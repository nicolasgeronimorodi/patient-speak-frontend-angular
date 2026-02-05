-- Migration: Patient Cascade Delete (Ley 25.326 Compliance)
-- Description: Add ON DELETE CASCADE from patients to transcriptions
-- Note: observations already have CASCADE from transcriptions, so they will be deleted automatically

-- Remove existing foreign key constraint
ALTER TABLE "public"."transcriptions"
DROP CONSTRAINT IF EXISTS "transcriptions_patient_id_fkey";

-- Add new constraint with ON DELETE CASCADE
ALTER TABLE "public"."transcriptions"
ADD CONSTRAINT "transcriptions_patient_id_fkey"
FOREIGN KEY ("patient_id")
REFERENCES "public"."patients"("id")
ON DELETE CASCADE;
