-- Enable Row Level Security for the device_readings table
ALTER TABLE device_readings ENABLE ROW LEVEL SECURITY;

-- Policy to allow devices to insert readings with a provided user_id.
-- WARNING: This policy trusts the user_id sent by the device.
-- It does NOT verify if the device is authorized to send data for that user_id.
-- This is less secure than linking via device_id and authenticated user sessions.
CREATE POLICY "Allow device to insert readings with provided user_id"
ON device_readings FOR INSERT WITH CHECK (true);

-- Policy to allow authenticated users to view their own device readings
CREATE POLICY "Allow authenticated users to view their own readings"
ON device_readings FOR SELECT USING (auth.uid() = user_id);