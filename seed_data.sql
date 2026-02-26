
-- Insert a sample badge for the current user (replace with actual user ID if needed, or rely on RLS if running in SQL editor with specific user context)
-- Note: In Supabase SQL editor, you might need to manually set the user_id if not running as a signed-in user.
-- For now, we will assume this might be run via an admin client or we just want to have the data ready.
-- Actually, since we don't know the exact user ID here easily without querying, let's create a function to add a badge to a specific email, or just insert if we know the ID.

-- Helper to add a badge to a user by email
CREATE OR REPLACE FUNCTION add_badge_to_user_email(user_email TEXT, badge_name TEXT, badge_icon TEXT, badge_color TEXT)
RETURNS VOID AS $$
DECLARE
  target_user_id UUID;
BEGIN
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
  
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.badges (user_id, name, icon, color)
    VALUES (target_user_id, badge_name, badge_icon, badge_color);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage example (you can run this in Supabase SQL Editor):
-- SELECT add_badge_to_user_email('test@example.com', 'Early Bird', 'Sun', 'text-yellow-500');
