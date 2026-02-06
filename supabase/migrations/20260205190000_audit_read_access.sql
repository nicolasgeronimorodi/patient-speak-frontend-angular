-- =============================================================================
-- Migracion: Auditoria de acceso a datos (lectura)
-- Agrega soporte para registrar cuando un usuario visualiza datos de un paciente.
-- Complementa la auditoria de escritura (triggers) con auditoria de lectura
-- requerida por la Ley 25.326.
-- =============================================================================

-- 1. Ampliar el CHECK constraint para aceptar 'SELECT'
ALTER TABLE "public"."audit_logs"
DROP CONSTRAINT "audit_logs_action_check";

ALTER TABLE "public"."audit_logs"
ADD CONSTRAINT "audit_logs_action_check"
CHECK ("action" IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT'));


-- 2. RPC para registrar acceso de lectura a un paciente
CREATE OR REPLACE FUNCTION "public"."log_patient_access"("p_patient_id" uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO "public"."audit_logs" ("user_id", "action", "table_name", "record_id")
  VALUES (auth.uid(), 'SELECT', 'patients', p_patient_id);
END;
$$;

ALTER FUNCTION "public"."log_patient_access"(uuid) OWNER TO "postgres";
