-- Fix handle_new_user function to properly extract all metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile with all available metadata
  INSERT INTO public.profiles (
    id, 
    email, 
    username, 
    account_type,
    phone_number
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'account_type')::account_type, 'personal'),
    NEW.raw_user_meta_data->>'phone_number'
  );
  
  -- Initialize onboarding progress
  INSERT INTO public.onboarding_progress (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Add policy to allow public profile viewing (needed for username lookup during signin)
CREATE POLICY "Anyone can view usernames for login"
  ON public.profiles
  FOR SELECT
  USING (true);

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;