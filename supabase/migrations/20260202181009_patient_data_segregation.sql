-- Migration: Patient Data Segregation (Ley 25.326 Compliance)
-- Description: Modify RLS policies so users can only see their own patients (admins see all)

-- Drop insecure policies that allow all authenticated users to see all patients
DROP POLICY IF EXISTS "Authenticated users can view all patients" ON "public"."patients";
DROP POLICY IF EXISTS "Authenticated users can update patients" ON "public"."patients";

-- New SELECT policy: users see their own patients, admins see all
CREATE POLICY "Users can view their own patients" ON "public"."patients"
FOR SELECT USING (
  (auth.uid() = user_id)
  OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'admin'
  ))
);

-- New UPDATE policy: same logic
CREATE POLICY "Users can update their own patients" ON "public"."patients"
FOR UPDATE USING (
  (auth.uid() = user_id)
  OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'admin'
  ))
);

-- New DELETE policy: for hard delete functionality
CREATE POLICY "Users can delete their own patients" ON "public"."patients"
FOR DELETE USING (
  (auth.uid() = user_id)
  OR
  (EXISTS (
    SELECT 1 FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE p.id = auth.uid() AND r.name = 'admin'
  ))
);
