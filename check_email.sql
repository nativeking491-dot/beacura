
-- Function to securely check if email exists without exposing other user data
CREATE OR REPLACE FUNCTION public.check_email_exists(email_to_check TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of creator (admin) to bypass RLS
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users 
    WHERE email = email_to_check
  );
END;
$$;

-- Grant execute permission to anon users so standard login form can use it
GRANT EXECUTE ON FUNCTION public.check_email_exists(TEXT) TO anon, authenticated;
