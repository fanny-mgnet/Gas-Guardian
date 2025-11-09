CREATE TABLE alerts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  device_id UUID REFERENCES public.devices(id) ON DELETE CASCADE NOT NULL,
  alert_type TEXT NOT NULL,
  message TEXT NOT NULL,
  sensor_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view their own alerts"
ON alerts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Devices can insert alerts with their user_id"
ON alerts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Optional: If you want to allow users to update their own alerts
-- CREATE POLICY "Users can update their own alerts"
-- ON alerts FOR UPDATE USING (auth.uid() = user_id);

-- Optional: If you want to allow users to delete their own alerts
-- CREATE POLICY "Users can delete their own alerts"
-- ON alerts FOR DELETE USING (auth.uid() = user_id);