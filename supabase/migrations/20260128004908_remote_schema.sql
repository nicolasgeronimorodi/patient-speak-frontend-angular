


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."count_transcriptions_search"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_is_valid" boolean DEFAULT true, "p_tag_id" "uuid" DEFAULT NULL::"uuid", "p_operator_user_id" "uuid" DEFAULT NULL::"uuid", "p_created_at_from" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_created_at_to" timestamp with time zone DEFAULT NULL::timestamp with time zone) RETURNS bigint
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  total BIGINT;
BEGIN
  SELECT COUNT(*) INTO total
  FROM transcriptions t
  WHERE 
    (p_is_valid IS NULL OR t.is_valid = p_is_valid)
    AND (p_query IS NULL OR p_query = '' OR t.full_text @@ websearch_to_tsquery('spanish', p_query))
    AND (p_has_access_to_all OR t.user_id = p_user_id)
    AND (p_tag_id IS NULL OR t.tag_id = p_tag_id)
    AND (p_operator_user_id IS NULL OR t.user_id = p_operator_user_id)
    AND (p_created_at_from IS NULL OR t.created_at >= p_created_at_from)
    AND (p_created_at_to IS NULL OR t.created_at <= p_created_at_to);
  
  RETURN total;
END;
$$;


ALTER FUNCTION "public"."count_transcriptions_search"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."count_transcriptions_search"("p_query" "text" DEFAULT NULL::"text", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_has_access_to_all" boolean DEFAULT false, "p_is_valid" boolean DEFAULT NULL::boolean, "p_tag_id" "uuid" DEFAULT NULL::"uuid", "p_operator_user_id" "uuid" DEFAULT NULL::"uuid", "p_created_at_from" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_created_at_to" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_patient_id" "uuid" DEFAULT NULL::"uuid") RETURNS bigint
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  total bigint;
BEGIN
  SELECT count(*) INTO total
    FROM transcriptions t
    WHERE 
      (p_is_valid IS NULL OR t.is_valid = p_is_valid)
      AND (p_query IS NULL OR p_query = '' OR t.full_text @@ websearch_to_tsquery('spanish', p_query))
      AND (p_has_access_to_all OR t.user_id = p_user_id)
      AND (p_tag_id IS NULL OR t.tag_id = p_tag_id)
      AND (p_operator_user_id IS NULL OR t.user_id = p_operator_user_id)
      AND (p_patient_id IS NULL OR t.patient_id = p_patient_id)
      AND (p_created_at_from IS NULL OR t.created_at >= p_created_at_from)
      AND (p_created_at_to IS NULL OR t.created_at <= p_created_at_to);
  RETURN total;
END;
$$;


ALTER FUNCTION "public"."count_transcriptions_search"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone, "p_patient_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_debug_info"() RETURNS TABLE("user_id" "uuid", "role_name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
  select p.id, r.name
  from profiles p
  join roles r on p.role_id = r.id
  where p.id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."current_user_debug_info"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."current_user_has_permission"("permission_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  user_id uuid;
  user_role_id int;
  has_perm boolean;
BEGIN
  -- Obtener el ID del usuario autenticado
  user_id := auth.uid();
  
  -- Si no hay usuario autenticado, devolver falso
  IF user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Obtener el rol del usuario
  SELECT role_id INTO user_role_id FROM public.profiles WHERE id = user_id;
  
  -- Si el usuario no tiene un rol, devolver falso
  IF user_role_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar si el rol del usuario tiene el permiso especificado
  SELECT EXISTS (
    SELECT 1
    FROM public.role_permissions rp
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE rp.role_id = user_role_id
    AND p.name = permission_name
  ) INTO has_perm;
  
  RETURN has_perm;
END;$$;


ALTER FUNCTION "public"."current_user_has_permission"("permission_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_current_user_permissions"() RETURNS TABLE("name" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  return query
    select perm.name
    from profiles p
    join roles r on p.role_id = r.id
    join role_permissions rp on r.id = rp.role_id
    join permissions perm on perm.id = rp.permission_id
    where p.id = auth.uid();
end;
$$;


ALTER FUNCTION "public"."get_current_user_permissions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_transcription_with_tags"("transcription_uuid" "uuid") RETURNS TABLE("id" "uuid", "title" "text", "content" "text", "language" "text", "created_at" timestamp with time zone, "tags" "text"[])
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id, 
    t.title, 
    t.content, 
    t.language, 
    t.created_at,
    ARRAY(
      SELECT tag.name 
      FROM tags tag
      JOIN transcription_tags tt ON tt.tag_id = tag.id
      WHERE tt.transcription_id = t.id
    ) as tags
  FROM transcriptions t
  WHERE t.id = transcription_uuid;
END;
$$;


ALTER FUNCTION "public"."get_transcription_with_tags"("transcription_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_permission"("user_uuid" "uuid", "permission_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  has_perm BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN role_permissions rp ON p.role_id = rp.role_id
    JOIN permissions perm ON rp.permission_id = perm.id
    WHERE p.id = user_uuid AND perm.name = permission_name
  ) INTO has_perm;
  
  RETURN has_perm;
END;
$$;


ALTER FUNCTION "public"."has_permission"("user_uuid" "uuid", "permission_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."insert_patient_with_validation"("p_user_id" "uuid", "p_first_name" "text", "p_last_name" "text", "p_document_type_id" integer, "p_document_number" "text", "p_consent_given" boolean) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_existing_id UUID;
  v_new_id UUID;
BEGIN
  IF p_document_number IS NOT NULL AND p_document_number <> '' THEN
    SELECT id INTO v_existing_id
    FROM public.patients
    WHERE document_type_id = p_document_type_id
      AND document_number = p_document_number
      AND is_active = true;

    IF v_existing_id IS NOT NULL THEN
      RAISE EXCEPTION 'DUPLICATE_PATIENT: Ya existe un paciente con ese documento';
    END IF;
  END IF;

  INSERT INTO public.patients (
    id, user_id, first_name, last_name, document_type_id,
    document_number, consent_given, consent_date, is_active, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), p_user_id, p_first_name, p_last_name, p_document_type_id,
    NULLIF(p_document_number, ''), p_consent_given,
    CASE WHEN p_consent_given THEN NOW() ELSE NULL END,
    true, NOW(), NOW()
  )
  RETURNING id INTO v_new_id;

  RETURN v_new_id;
END;
$$;


ALTER FUNCTION "public"."insert_patient_with_validation"("p_user_id" "uuid", "p_first_name" "text", "p_last_name" "text", "p_document_type_id" integer, "p_document_number" "text", "p_consent_given" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_uuid" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid AND role_id = 1
  ) INTO is_admin;
  
  RETURN is_admin;
END;
$$;


ALTER FUNCTION "public"."is_admin"("user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_user_admin"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
declare
  is_admin boolean;
begin
  select exists (
    select 1 from profiles
    where id = auth.uid() and role_id = 1
  )
  into is_admin;

  return is_admin;
end;
$$;


ALTER FUNCTION "public"."is_user_admin"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."transcriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "audio_url" "text",
    "duration" integer,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "full_text" "tsvector",
    "tag_id" "uuid",
    "is_valid" boolean DEFAULT true,
    "dni" "text",
    "first_name" "text",
    "last_name" "text",
    "patient_id" "uuid",
    "consultation_reason" "text"
);


ALTER TABLE "public"."transcriptions" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_transcriptions"("search_query" "text") RETURNS SETOF "public"."transcriptions"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM transcriptions
  WHERE to_tsvector('spanish', content || ' ' || title) @@ plainto_tsquery('spanish', search_query);
END;
$$;


ALTER FUNCTION "public"."search_transcriptions"("search_query" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_transcriptions_paginated"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_limit" integer, "p_offset" integer, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone) RETURNS TABLE("id" "uuid", "user_id" "uuid", "consultation_reason" "text", "content" "text", "language" "text", "audio_url" "text", "duration" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "tag_name" "text", "operator_full_name" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
    SELECT
      t.id,
      t.user_id,
      t.consultation_reason,
      t.content,
      t.language,
      t.audio_url,
      t.duration,
      t.created_at,
      t.updated_at,
      tg.name AS tag_name,
      p.full_name AS operator_full_name
    FROM transcriptions t
    LEFT JOIN tags tg ON tg.id = t.tag_id
    LEFT JOIN profiles p ON p.id = t.user_id
    WHERE 
      (p_is_valid IS NULL OR t.is_valid = p_is_valid)
      AND (p_query IS NULL OR p_query = '' OR t.full_text @@ websearch_to_tsquery('spanish', p_query))
      AND (p_has_access_to_all OR t.user_id = p_user_id)
      AND (p_tag_id IS NULL OR t.tag_id = p_tag_id)
      AND (p_operator_user_id IS NULL OR t.user_id = p_operator_user_id)
      AND (p_created_at_from IS NULL OR t.created_at >= p_created_at_from)
      AND (p_created_at_to IS NULL OR t.created_at <= p_created_at_to)
    ORDER BY t.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


ALTER FUNCTION "public"."search_transcriptions_paginated"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_limit" integer, "p_offset" integer, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."search_transcriptions_paginated"("p_query" "text" DEFAULT NULL::"text", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_has_access_to_all" boolean DEFAULT false, "p_limit" integer DEFAULT 10, "p_offset" integer DEFAULT 0, "p_is_valid" boolean DEFAULT NULL::boolean, "p_tag_id" "uuid" DEFAULT NULL::"uuid", "p_operator_user_id" "uuid" DEFAULT NULL::"uuid", "p_created_at_from" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_created_at_to" timestamp with time zone DEFAULT NULL::timestamp with time zone, "p_patient_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("id" "uuid", "user_id" "uuid", "consultation_reason" "text", "content" "text", "audio_url" "text", "duration" integer, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "tag_name" "text", "operator_full_name" "text", "patient_full_name" "text")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
    SELECT
      t.id,
      t.user_id,
      t.consultation_reason,
      t.content,
      t.audio_url,
      t.duration,
      t.created_at,
      t.updated_at,
      tg.name AS tag_name,
      p.full_name AS operator_full_name,
      (pat.last_name || ', ' || pat.first_name)::text AS patient_full_name
    FROM transcriptions t
    LEFT JOIN tags tg ON tg.id = t.tag_id
    LEFT JOIN profiles p ON p.id = t.user_id
    LEFT JOIN patients pat ON pat.id = t.patient_id
    WHERE 
      (p_is_valid IS NULL OR t.is_valid = p_is_valid)
      AND (p_query IS NULL OR p_query = '' OR t.full_text @@ websearch_to_tsquery('spanish', p_query))
      AND (p_has_access_to_all OR t.user_id = p_user_id)
      AND (p_tag_id IS NULL OR t.tag_id = p_tag_id)
      AND (p_operator_user_id IS NULL OR t.user_id = p_operator_user_id)
      AND (p_patient_id IS NULL OR t.patient_id = p_patient_id)
      AND (p_created_at_from IS NULL OR t.created_at >= p_created_at_from)
      AND (p_created_at_to IS NULL OR t.created_at <= p_created_at_to)
    ORDER BY t.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


ALTER FUNCTION "public"."search_transcriptions_paginated"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_limit" integer, "p_offset" integer, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone, "p_patient_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."transcriptions_per_day"() RETURNS TABLE("created_at" "date", "total" integer)
    LANGUAGE "sql"
    AS $$
  SELECT
    DATE(created_at) as created_at,
    COUNT(*) as total
  FROM transcriptions
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at);
$$;


ALTER FUNCTION "public"."transcriptions_per_day"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_full_text_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.full_text := to_tsvector('spanish', coalesce(NEW.consultation_reason, '') || ' ' || coalesce(NEW.content, ''));
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_full_text_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_user_authorization_for_action"("p_action_id" integer, "p_entity_id" integer, "p_resource_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $_$
declare
  v_user_id uuid := auth.uid();
  v_permission_id int;
  v_requires_context boolean;
  v_table_name text;
  v_owner_id uuid;
begin
  -- Obtener permisos vinculados a la acción/entidad
  for v_permission_id, v_requires_context in
    select
      p.id,
      p.requires_ownership_context
    from actions_entities_permissions aep
    join permissions p on aep.permission_id = p.id
    where aep.actions_entities_id = (
      select id from actions_entities
      where action_id = p_action_id and entity_id = p_entity_id
    )
  loop
    -- Caso sin contexto: si el usuario tiene el permiso, devolver true
    if not v_requires_context then
      if exists (
        select 1
        from role_permissions rp
        join profiles pr on pr.role_id = rp.role_id
        where pr.id = v_user_id and rp.permission_id = v_permission_id
      ) then
        return true;
      end if;

    -- Caso con contexto: verificar ownership
    else
      select e.table_name into v_table_name
      from entities e where e.id = p_entity_id;

      execute format('select user_id from %I where id = $1', v_table_name)
      into v_owner_id
      using p_resource_id;

      if v_owner_id = v_user_id then
        if exists (
          select 1
          from role_permissions rp
          join profiles pr on pr.role_id = rp.role_id
          where pr.id = v_user_id and rp.permission_id = v_permission_id
        ) then
          return true;
        end if;
      end if;
    end if;
  end loop;

  -- Si ningún permiso habilita la acción, denegar
  return false;
end;
$_$;


ALTER FUNCTION "public"."validate_user_authorization_for_action"("p_action_id" integer, "p_entity_id" integer, "p_resource_id" "uuid") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."actions" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL
);


ALTER TABLE "public"."actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."actions_entities" (
    "id" integer NOT NULL,
    "action_id" integer NOT NULL,
    "entity_id" integer NOT NULL
);


ALTER TABLE "public"."actions_entities" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."actions_entities_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."actions_entities_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."actions_entities_id_seq" OWNED BY "public"."actions_entities"."id";



CREATE TABLE IF NOT EXISTS "public"."actions_entities_permissions" (
    "id" integer NOT NULL,
    "actions_entities_id" integer NOT NULL,
    "permission_id" integer NOT NULL
);


ALTER TABLE "public"."actions_entities_permissions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."actions_entities_permissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."actions_entities_permissions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."actions_entities_permissions_id_seq" OWNED BY "public"."actions_entities_permissions"."id";



CREATE SEQUENCE IF NOT EXISTS "public"."actions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."actions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."actions_id_seq" OWNED BY "public"."actions"."id";



CREATE TABLE IF NOT EXISTS "public"."document_types" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "code" "text" NOT NULL,
    "validation_pattern" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."document_types" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."document_types_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."document_types_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."document_types_id_seq" OWNED BY "public"."document_types"."id";



CREATE TABLE IF NOT EXISTS "public"."entities" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "table_name" "text" NOT NULL
);


ALTER TABLE "public"."entities" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."entities_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."entities_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."entities_id_seq" OWNED BY "public"."entities"."id";



CREATE TABLE IF NOT EXISTS "public"."observations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "transcription_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_deleted" boolean DEFAULT false
);


ALTER TABLE "public"."observations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."patients" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "document_number" "text",
    "consent_given" boolean DEFAULT false NOT NULL,
    "consent_date" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "document_type_id" integer DEFAULT 1 NOT NULL
);


ALTER TABLE "public"."patients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "requires_ownership_context" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."permissions_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."permissions_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."permissions_id_seq" OWNED BY "public"."permissions"."id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "full_name" "text",
    "role_id" integer DEFAULT 2,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "first_name" "text",
    "last_name" "text",
    "email" "text" NOT NULL
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "role_id" integer NOT NULL,
    "permission_id" integer NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."roles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."roles_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."roles_id_seq" OWNED BY "public"."roles"."id";



CREATE TABLE IF NOT EXISTS "public"."shared_transcriptions" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "transcription_id" "uuid",
    "profile_id" "uuid",
    "permission" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "shared_transcriptions_permission_check" CHECK (("permission" = ANY (ARRAY['read'::"text", 'edit'::"text"])))
);


ALTER TABLE "public"."shared_transcriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tags" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "user_id" "uuid",
    "is_global" boolean DEFAULT false,
    "is_valid" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."tags" OWNER TO "postgres";


ALTER TABLE ONLY "public"."actions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."actions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."actions_entities" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."actions_entities_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."actions_entities_permissions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."actions_entities_permissions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."document_types" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."document_types_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."entities" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."entities_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."permissions" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."permissions_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."roles" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."roles_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."actions_entities"
    ADD CONSTRAINT "actions_entities_action_id_entity_id_key" UNIQUE ("action_id", "entity_id");



ALTER TABLE ONLY "public"."actions_entities_permissions"
    ADD CONSTRAINT "actions_entities_permissions_actions_entities_id_permission_key" UNIQUE ("actions_entities_id", "permission_id");



ALTER TABLE ONLY "public"."actions_entities_permissions"
    ADD CONSTRAINT "actions_entities_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."actions_entities"
    ADD CONSTRAINT "actions_entities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."actions"
    ADD CONSTRAINT "actions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."actions"
    ADD CONSTRAINT "actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."document_types"
    ADD CONSTRAINT "document_types_code_key" UNIQUE ("code");



ALTER TABLE ONLY "public"."document_types"
    ADD CONSTRAINT "document_types_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."document_types"
    ADD CONSTRAINT "document_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entities"
    ADD CONSTRAINT "entities_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."entities"
    ADD CONSTRAINT "entities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."entities"
    ADD CONSTRAINT "entities_table_name_key" UNIQUE ("table_name");



ALTER TABLE ONLY "public"."observations"
    ADD CONSTRAINT "observations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shared_transcriptions"
    ADD CONSTRAINT "shared_transcriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transcriptions"
    ADD CONSTRAINT "transcriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "unique_patient_document_v2" UNIQUE ("document_type_id", "document_number");



CREATE INDEX "idx_patients_search" ON "public"."patients" USING "btree" ("user_id", "first_name", "last_name", "document_number");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_transcriptions_patient" ON "public"."transcriptions" USING "btree" ("patient_id");



CREATE INDEX "transcriptions_content_idx" ON "public"."transcriptions" USING "gin" ("to_tsvector"('"spanish"'::"regconfig", "content"));



CREATE INDEX "transcriptions_full_text_idx" ON "public"."transcriptions" USING "gin" ("full_text");



CREATE OR REPLACE TRIGGER "full_text_update" BEFORE INSERT OR UPDATE ON "public"."transcriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_full_text_column"();



CREATE OR REPLACE TRIGGER "update_patients_updated_at" BEFORE UPDATE ON "public"."patients" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tags_updated_at" BEFORE UPDATE ON "public"."tags" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."actions_entities"
    ADD CONSTRAINT "actions_entities_action_id_fkey" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."actions_entities"
    ADD CONSTRAINT "actions_entities_entity_id_fkey" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."actions_entities_permissions"
    ADD CONSTRAINT "actions_entities_permissions_actions_entities_id_fkey" FOREIGN KEY ("actions_entities_id") REFERENCES "public"."actions_entities"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."actions_entities_permissions"
    ADD CONSTRAINT "actions_entities_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "fk_patients_document_type" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_types"("id");



ALTER TABLE ONLY "public"."observations"
    ADD CONSTRAINT "observations_transcription_id_fkey" FOREIGN KEY ("transcription_id") REFERENCES "public"."transcriptions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."observations"
    ADD CONSTRAINT "observations_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."patients"
    ADD CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shared_transcriptions"
    ADD CONSTRAINT "shared_transcriptions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."shared_transcriptions"
    ADD CONSTRAINT "shared_transcriptions_transcription_id_fkey" FOREIGN KEY ("transcription_id") REFERENCES "public"."transcriptions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tags"
    ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



ALTER TABLE ONLY "public"."transcriptions"
    ADD CONSTRAINT "transcriptions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id");



ALTER TABLE ONLY "public"."transcriptions"
    ADD CONSTRAINT "transcriptions_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."transcriptions"
    ADD CONSTRAINT "transcriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id");



CREATE POLICY "Admins and owners can update transcription Logic delete" ON "public"."transcriptions" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "r"."id")))
     JOIN "public"."permissions" "perm" ON (("rp"."permission_id" = "perm"."id")))
  WHERE (("p"."id" = "auth"."uid"()) AND (("perm"."name" = 'transcription:delete:all'::"text") OR (("perm"."name" = 'transcription:delete:own'::"text") AND ("transcriptions"."user_id" = "auth"."uid"()))))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "r"."id")))
     JOIN "public"."permissions" "perm" ON (("rp"."permission_id" = "perm"."id")))
  WHERE (("p"."id" = "auth"."uid"()) AND (("perm"."name" = 'transcription:delete:all'::"text") OR (("perm"."name" = 'transcription:delete:own'::"text") AND ("transcriptions"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Admins can create new tags" ON "public"."tags" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "r"."id")))
     JOIN "public"."permissions" "perm" ON (("rp"."permission_id" = "perm"."id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("perm"."name" = 'tags:create:all'::"text")))));



CREATE POLICY "Admins can create profiles" ON "public"."profiles" FOR INSERT TO "authenticated" WITH CHECK ("public"."current_user_has_permission"('user:manage'::"text"));



CREATE POLICY "Admins can logically delete a tag" ON "public"."tags" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "r"."id")))
     JOIN "public"."permissions" "perm" ON (("rp"."permission_id" = "perm"."id")))
  WHERE (("p"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("perm"."name" = 'tags:delete:all'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "r"."id")))
     JOIN "public"."permissions" "perm" ON (("rp"."permission_id" = "perm"."id")))
  WHERE (("p"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("perm"."name" = 'tags:delete:all'::"text")))));



CREATE POLICY "Admins can read all profiles" ON "public"."profiles" FOR SELECT TO "authenticated" USING ("public"."current_user_has_permission"('user:manage'::"text"));



CREATE POLICY "Admins can update a tag" ON "public"."tags" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "r"."id")))
     JOIN "public"."permissions" "perm" ON (("rp"."permission_id" = "perm"."id")))
  WHERE (("p"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("perm"."name" = 'tags:write:all'::"text"))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
     JOIN "public"."role_permissions" "rp" ON (("rp"."role_id" = "r"."id")))
     JOIN "public"."permissions" "perm" ON (("rp"."permission_id" = "perm"."id")))
  WHERE (("p"."id" = ( SELECT "auth"."uid"() AS "uid")) AND ("perm"."name" = 'tags:write:all'::"text")))));



CREATE POLICY "Admins can update profiles" ON "public"."profiles" FOR UPDATE TO "authenticated" USING ("public"."current_user_has_permission"('user:manage'::"text")) WITH CHECK ("public"."current_user_has_permission"('user:manage'::"text"));



CREATE POLICY "Allow admins to read any transcription" ON "public"."transcriptions" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("r"."name" = 'admin'::"text")))));



CREATE POLICY "Allow insert observation on own transcription with create:own" ON "public"."observations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM (((("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
     JOIN "public"."role_permissions" "rp" ON (("r"."id" = "rp"."role_id")))
     JOIN "public"."permissions" "perm" ON (("perm"."id" = "rp"."permission_id")))
     JOIN "public"."transcriptions" "t" ON (("t"."id" = "observations"."transcription_id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("t"."user_id" = "auth"."uid"()) AND ("perm"."name" = 'observation:create:own'::"text")))));



CREATE POLICY "Allow insert observation with create:all" ON "public"."observations" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
     JOIN "public"."role_permissions" "rp" ON (("r"."id" = "rp"."role_id")))
     JOIN "public"."permissions" "perm" ON (("perm"."id" = "rp"."permission_id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("perm"."name" = 'observation:create:all'::"text")))));



CREATE POLICY "Allow select observations on visible transcriptions" ON "public"."observations" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."transcriptions" "t"
  WHERE ("t"."id" = "observations"."transcription_id"))));



CREATE POLICY "Allow update observation with delete:all" ON "public"."observations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
     JOIN "public"."role_permissions" "rp" ON (("r"."id" = "rp"."role_id")))
     JOIN "public"."permissions" "perm" ON (("perm"."id" = "rp"."permission_id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("perm"."name" = 'observation:delete:all'::"text"))))) WITH CHECK (true);



CREATE POLICY "Allow update own observation with delete:own" ON "public"."observations" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ((("public"."profiles" "p"
     JOIN "public"."roles" "r" ON (("p"."role_id" = "r"."id")))
     JOIN "public"."role_permissions" "rp" ON (("r"."id" = "rp"."role_id")))
     JOIN "public"."permissions" "perm" ON (("perm"."id" = "rp"."permission_id")))
  WHERE (("p"."id" = "auth"."uid"()) AND ("observations"."user_id" = "auth"."uid"()) AND ("perm"."name" = 'observation:delete:own'::"text")))));



CREATE POLICY "Allow users to read their own profiles" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Anyone can read permissions" ON "public"."permissions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can read role_permissions" ON "public"."role_permissions" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Anyone can read roles" ON "public"."roles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can insert patients" ON "public"."patients" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can read document types" ON "public"."document_types" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can update patients" ON "public"."patients" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view all patients" ON "public"."patients" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Enable read access for all users" ON "public"."tags" FOR SELECT USING (true);



CREATE POLICY "Enable transcription insert to authenticated users" ON "public"."transcriptions" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can read own profile" ON "public"."profiles" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK ((("auth"."uid"() = "id") AND (NOT ("role_id" IS DISTINCT FROM ( SELECT "profiles_1"."role_id"
   FROM "public"."profiles" "profiles_1"
  WHERE ("profiles_1"."id" = "auth"."uid"()))))));



CREATE POLICY "Users can view own transcriptions" ON "public"."transcriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."document_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."observations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."patients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."shared_transcriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transcriptions" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;
























































































































SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;



SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;

































SET SESSION AUTHORIZATION "postgres";
RESET SESSION AUTHORIZATION;















GRANT ALL ON FUNCTION "public"."count_transcriptions_search"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."count_transcriptions_search"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_transcriptions_search"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."count_transcriptions_search"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone, "p_patient_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."count_transcriptions_search"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone, "p_patient_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."count_transcriptions_search"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone, "p_patient_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_debug_info"() TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_debug_info"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_debug_info"() TO "service_role";



GRANT ALL ON FUNCTION "public"."current_user_has_permission"("permission_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."current_user_has_permission"("permission_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."current_user_has_permission"("permission_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_current_user_permissions"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_current_user_permissions"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_current_user_permissions"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_transcription_with_tags"("transcription_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_transcription_with_tags"("transcription_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_transcription_with_tags"("transcription_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_permission"("user_uuid" "uuid", "permission_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("user_uuid" "uuid", "permission_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("user_uuid" "uuid", "permission_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."insert_patient_with_validation"("p_user_id" "uuid", "p_first_name" "text", "p_last_name" "text", "p_document_type_id" integer, "p_document_number" "text", "p_consent_given" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."insert_patient_with_validation"("p_user_id" "uuid", "p_first_name" "text", "p_last_name" "text", "p_document_type_id" integer, "p_document_number" "text", "p_consent_given" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."insert_patient_with_validation"("p_user_id" "uuid", "p_first_name" "text", "p_last_name" "text", "p_document_type_id" integer, "p_document_number" "text", "p_consent_given" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_user_admin"() TO "anon";
GRANT ALL ON FUNCTION "public"."is_user_admin"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_user_admin"() TO "service_role";



GRANT ALL ON TABLE "public"."transcriptions" TO "anon";
GRANT ALL ON TABLE "public"."transcriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."transcriptions" TO "service_role";



GRANT ALL ON FUNCTION "public"."search_transcriptions"("search_query" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."search_transcriptions"("search_query" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_transcriptions"("search_query" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_transcriptions_paginated"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_limit" integer, "p_offset" integer, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."search_transcriptions_paginated"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_limit" integer, "p_offset" integer, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_transcriptions_paginated"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_limit" integer, "p_offset" integer, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."search_transcriptions_paginated"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_limit" integer, "p_offset" integer, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone, "p_patient_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."search_transcriptions_paginated"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_limit" integer, "p_offset" integer, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone, "p_patient_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_transcriptions_paginated"("p_query" "text", "p_user_id" "uuid", "p_has_access_to_all" boolean, "p_limit" integer, "p_offset" integer, "p_is_valid" boolean, "p_tag_id" "uuid", "p_operator_user_id" "uuid", "p_created_at_from" timestamp with time zone, "p_created_at_to" timestamp with time zone, "p_patient_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."transcriptions_per_day"() TO "anon";
GRANT ALL ON FUNCTION "public"."transcriptions_per_day"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."transcriptions_per_day"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_full_text_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_full_text_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_full_text_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_user_authorization_for_action"("p_action_id" integer, "p_entity_id" integer, "p_resource_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_user_authorization_for_action"("p_action_id" integer, "p_entity_id" integer, "p_resource_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_user_authorization_for_action"("p_action_id" integer, "p_entity_id" integer, "p_resource_id" "uuid") TO "service_role";



























GRANT ALL ON TABLE "public"."actions" TO "anon";
GRANT ALL ON TABLE "public"."actions" TO "authenticated";
GRANT ALL ON TABLE "public"."actions" TO "service_role";



GRANT ALL ON TABLE "public"."actions_entities" TO "anon";
GRANT ALL ON TABLE "public"."actions_entities" TO "authenticated";
GRANT ALL ON TABLE "public"."actions_entities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."actions_entities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."actions_entities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."actions_entities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."actions_entities_permissions" TO "anon";
GRANT ALL ON TABLE "public"."actions_entities_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."actions_entities_permissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."actions_entities_permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."actions_entities_permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."actions_entities_permissions_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."actions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."actions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."actions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."document_types" TO "anon";
GRANT ALL ON TABLE "public"."document_types" TO "authenticated";
GRANT ALL ON TABLE "public"."document_types" TO "service_role";



GRANT ALL ON SEQUENCE "public"."document_types_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."document_types_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."document_types_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."entities" TO "anon";
GRANT ALL ON TABLE "public"."entities" TO "authenticated";
GRANT ALL ON TABLE "public"."entities" TO "service_role";



GRANT ALL ON SEQUENCE "public"."entities_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."entities_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."entities_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."observations" TO "anon";
GRANT ALL ON TABLE "public"."observations" TO "authenticated";
GRANT ALL ON TABLE "public"."observations" TO "service_role";



GRANT ALL ON TABLE "public"."patients" TO "anon";
GRANT ALL ON TABLE "public"."patients" TO "authenticated";
GRANT ALL ON TABLE "public"."patients" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."permissions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."roles_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."shared_transcriptions" TO "anon";
GRANT ALL ON TABLE "public"."shared_transcriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."shared_transcriptions" TO "service_role";



GRANT ALL ON TABLE "public"."tags" TO "anon";
GRANT ALL ON TABLE "public"."tags" TO "authenticated";
GRANT ALL ON TABLE "public"."tags" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































