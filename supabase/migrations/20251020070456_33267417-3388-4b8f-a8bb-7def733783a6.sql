-- Ensure triggers exist to create profile, onboarding record, and user balance on signup
DO $$
BEGIN
  -- Create trigger to insert into public.profiles and onboarding_progress
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;

  -- Create trigger to initialize user balance
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_balance'
  ) THEN
    CREATE TRIGGER on_auth_user_created_balance
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.initialize_user_balance();
  END IF;
END
$$;