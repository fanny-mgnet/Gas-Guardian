ALTER TABLE device_readings
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Optional: Add a policy to allow devices to insert readings with their user_id
-- This assumes you have a way to authenticate the device itself,
-- or that you are explicitly trusting the device to send the correct user_id.
-- WARNING: This policy is less secure than linking via device_id and RLS.
-- CREATE POLICY "Allow device to insert readings with user_id"
-- ON device_readings FOR INSERT WITH CHECK (auth.uid() = user_id);