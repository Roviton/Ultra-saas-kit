-------------------------------------------------------
-- USER ROLES EXTENSION
-------------------------------------------------------

-- Add role column to profiles table with default 'dispatcher'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'dispatcher' 
CHECK (role IN ('admin', 'dispatcher'));

-- Create new RLS policies for role-based access

-- Allow admins to view all profiles in their organization
CREATE POLICY "Admins can view all profiles in their organization" ON profiles
  FOR SELECT 
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin' AND organization_id = profiles.organization_id
    )
  );

-- Add function to check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check if user is a dispatcher
CREATE OR REPLACE FUNCTION public.is_dispatcher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'dispatcher'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get user's organization ID
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies for role-based access

-- Create admin-specific table for monitoring capabilities
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  dashboard_layout JSONB DEFAULT '{}',
  notification_preferences JSONB DEFAULT '{}',
  export_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(profile_id)
);

-- Enable RLS on admin_settings
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access admin_settings
CREATE POLICY "Only admins can access their admin_settings" ON admin_settings
  USING (
    auth.uid() = profile_id AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create an example function to demonstrate admin-only capabilities (export to CSV)
CREATE OR REPLACE FUNCTION admin_export_user_data(target_organization_id UUID)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
  user_org_id UUID;
  user_role TEXT;
BEGIN
  -- Get current user's organization ID and role
  SELECT organization_id, role INTO user_org_id, user_role
  FROM profiles
  WHERE id = auth.uid();
  
  -- Check if user is admin and belongs to the target organization
  IF user_role != 'admin' OR user_org_id != target_organization_id THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can export user data for their organization';
  END IF;
  
  -- Generate CSV of users in the organization
  SELECT string_agg(
    id || ',' || 
    COALESCE(full_name, '') || ',' || 
    COALESCE(username, '') || ',' || 
    role || ',' || 
    COALESCE(updated_at::TEXT, ''),
    E'\n'
  ) INTO result
  FROM profiles
  WHERE organization_id = target_organization_id;
  
  RETURN 'id,full_name,username,role,updated_at' || E'\n' || result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function for admins to assign roles to users
CREATE OR REPLACE FUNCTION admin_assign_role(target_user_id UUID, new_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  admin_org_id UUID;
  target_org_id UUID;
BEGIN
  -- Check if current user is an admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can assign roles';
  END IF;
  
  -- Get admin's organization ID
  SELECT organization_id INTO admin_org_id
  FROM profiles
  WHERE id = auth.uid();
  
  -- Get target user's organization ID
  SELECT organization_id INTO target_org_id
  FROM profiles
  WHERE id = target_user_id;
  
  -- Check if target user is in the same organization
  IF admin_org_id != target_org_id THEN
    RAISE EXCEPTION 'Unauthorized: Cannot modify users from different organizations';
  END IF;
  
  -- Check if the new role is valid
  IF new_role NOT IN ('admin', 'dispatcher') THEN
    RAISE EXCEPTION 'Invalid role: Role must be either admin or dispatcher';
  END IF;
  
  -- Update the user's role
  UPDATE profiles
  SET role = new_role
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
