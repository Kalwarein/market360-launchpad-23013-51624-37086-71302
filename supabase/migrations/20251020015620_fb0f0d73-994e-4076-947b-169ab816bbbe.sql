-- Create a test admin user role
-- Note: You'll need to create the actual user via signup first
-- Then run this to grant admin role:
-- Replace 'your-user-uuid-here' with actual user ID after signup

-- Example grant (commented out - run manually after creating user):
-- INSERT INTO user_roles (user_id, role) 
-- VALUES ('your-user-uuid-here'::uuid, 'admin'::app_role);

-- Enable auto-confirm for email signups in development
-- This is handled via Supabase dashboard settings