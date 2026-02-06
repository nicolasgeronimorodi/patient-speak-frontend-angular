-- =============================================================================
-- Migracion: Sistema de Auditoria (Ley 25.326)
-- Crea tabla audit_logs, trigger function, 9 triggers AFTER,
-- politicas RLS y funciones RPC para consulta paginada.
-- =============================================================================

-- 1. Tabla audit_logs
CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
  "id" uuid DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
  "user_id" uuid,
  "action" text NOT NULL,
  "table_name" text NOT NULL,
  "record_id" uuid NOT NULL,
  "old_data" jsonb,
  "new_data" jsonb,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "audit_logs_action_check" CHECK ("action" IN ('INSERT', 'UPDATE', 'DELETE'))
);

ALTER TABLE "public"."audit_logs" OWNER TO "postgres";

CREATE INDEX idx_audit_logs_record_id ON "public"."audit_logs"("record_id");
CREATE INDEX idx_audit_logs_table_name ON "public"."audit_logs"("table_name");
CREATE INDEX idx_audit_logs_created_at ON "public"."audit_logs"("created_at" DESC);


-- 2. Trigger function
CREATE OR REPLACE FUNCTION "public"."log_audit_event"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO "public"."audit_logs" ("user_id", "action", "table_name", "record_id", "new_data")
    VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO "public"."audit_logs" ("user_id", "action", "table_name", "record_id", "old_data", "new_data")
    VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO "public"."audit_logs" ("user_id", "action", "table_name", "record_id", "old_data")
    VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

ALTER FUNCTION "public"."log_audit_event"() OWNER TO "postgres";


-- 3. Triggers (9: 3 tablas x 3 operaciones)

-- patients
CREATE TRIGGER audit_patients_insert
  AFTER INSERT ON "public"."patients"
  FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();

CREATE TRIGGER audit_patients_update
  AFTER UPDATE ON "public"."patients"
  FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();

CREATE TRIGGER audit_patients_delete
  AFTER DELETE ON "public"."patients"
  FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();

-- transcriptions
CREATE TRIGGER audit_transcriptions_insert
  AFTER INSERT ON "public"."transcriptions"
  FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();

CREATE TRIGGER audit_transcriptions_update
  AFTER UPDATE ON "public"."transcriptions"
  FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();

CREATE TRIGGER audit_transcriptions_delete
  AFTER DELETE ON "public"."transcriptions"
  FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();

-- observations
CREATE TRIGGER audit_observations_insert
  AFTER INSERT ON "public"."observations"
  FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();

CREATE TRIGGER audit_observations_update
  AFTER UPDATE ON "public"."observations"
  FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();

CREATE TRIGGER audit_observations_delete
  AFTER DELETE ON "public"."observations"
  FOR EACH ROW EXECUTE FUNCTION "public"."log_audit_event"();


-- 4. RLS
ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs" ON "public"."audit_logs"
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM "public"."profiles" p
    JOIN "public"."roles" r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'admin'
  )
);

CREATE POLICY "System can insert audit logs" ON "public"."audit_logs"
FOR INSERT WITH CHECK (true);


-- 5. RPC: consulta paginada de logs por paciente
CREATE OR REPLACE FUNCTION "public"."get_patient_audit_logs"(
  "p_patient_id" uuid,
  "p_limit" integer DEFAULT 20,
  "p_offset" integer DEFAULT 0
)
RETURNS TABLE (
  "id" uuid,
  "user_id" uuid,
  "action" text,
  "table_name" text,
  "record_id" uuid,
  "old_data" jsonb,
  "new_data" jsonb,
  "created_at" timestamptz,
  "user_full_name" text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    SELECT
      a.id,
      a.user_id,
      a.action,
      a.table_name,
      a.record_id,
      a.old_data,
      a.new_data,
      a.created_at,
      p.full_name AS user_full_name
    FROM "public"."audit_logs" a
    LEFT JOIN "public"."profiles" p ON p.id = a.user_id
    WHERE
      (a.table_name = 'patients' AND a.record_id = p_patient_id)
      OR (a.table_name = 'transcriptions' AND a.record_id IN (
        SELECT t.id FROM "public"."transcriptions" t WHERE t.patient_id = p_patient_id
      ))
      OR (a.table_name = 'observations' AND a.record_id IN (
        SELECT o.id FROM "public"."observations" o
        JOIN "public"."transcriptions" t ON o.transcription_id = t.id
        WHERE t.patient_id = p_patient_id
      ))
    ORDER BY a.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

ALTER FUNCTION "public"."get_patient_audit_logs"(uuid, integer, integer) OWNER TO "postgres";


-- 6. RPC: conteo de logs por paciente
CREATE OR REPLACE FUNCTION "public"."count_patient_audit_logs"("p_patient_id" uuid)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total bigint;
BEGIN
  SELECT count(*) INTO total
  FROM "public"."audit_logs" a
  WHERE
    (a.table_name = 'patients' AND a.record_id = p_patient_id)
    OR (a.table_name = 'transcriptions' AND a.record_id IN (
      SELECT t.id FROM "public"."transcriptions" t WHERE t.patient_id = p_patient_id
    ))
    OR (a.table_name = 'observations' AND a.record_id IN (
      SELECT o.id FROM "public"."observations" o
      JOIN "public"."transcriptions" t ON o.transcription_id = t.id
      WHERE t.patient_id = p_patient_id
    ));
  RETURN total;
END;
$$;

ALTER FUNCTION "public"."count_patient_audit_logs"(uuid) OWNER TO "postgres";
