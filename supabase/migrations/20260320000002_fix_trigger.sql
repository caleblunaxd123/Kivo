-- Make handle_new_user resilient: if profile creation fails, auth signup still succeeds.
-- The app upserts the profile anyway on every SIGNED_IN event.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name, auth_provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'provider', NEW.app_metadata->>'provider', 'email')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth signup due to profile creation failure.
  -- The app handles profile upsert on SIGNED_IN.
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
