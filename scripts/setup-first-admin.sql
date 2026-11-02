-- ==============================================================================
-- PlayBeat Tools - First Admin Setup SQL Helper
-- ==============================================================================
-- Step 1: In the Supabase Dashboard -> Authentication -> Users, click "Add User"
--         (or invite) and create your admin account with an email (e.g. admin@playbeatdigital.store)
--         and a strong password.
-- Step 2: Copy the generated UUID of the created user from auth.users.
-- Step 3: Run the SQL statement below in the Supabase SQL Editor, replacing
--         'YOUR_USER_UUID_HERE' and 'admin@playbeatdigital.store' with your values.

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'admin@playbeatdigital.store';
BEGIN
  -- Look up user ID from auth.users by email
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.admin_users (id, email, role, full_name)
    VALUES (v_user_id, v_email, 'superadmin', 'PlayBeat Superadmin')
    ON CONFLICT (id) DO UPDATE
    SET role = 'superadmin', updated_at = now();

    RAISE NOTICE 'Admin user % successfully registered as superadmin with ID %', v_email, v_user_id;
  ELSE
    RAISE NOTICE 'User % not found in auth.users yet. Please create the user under Authentication first!', v_email;
  END IF;
END $$;
