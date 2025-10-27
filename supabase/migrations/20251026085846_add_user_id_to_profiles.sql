-- Add uuid-ossp extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add user_id column to profiles table
ALTER TABLE profiles
ADD COLUMN user_id UUID UNIQUE DEFAULT uuid_generate_v4();

-- Create a trigger to set user_id on new profile inserts if not already set
CREATE OR REPLACE FUNCTION set_user_id_on_new_profile()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN
        NEW.user_id = uuid_generate_v4();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_id_trigger
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_user_id_on_new_profile();