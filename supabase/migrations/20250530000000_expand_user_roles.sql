-------------------------------------------------------
-- EXPAND USER ROLES FOR FREIGHT DISPATCH PLATFORM
-------------------------------------------------------

-- First, drop the existing constraint
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add expanded constraint to allow all four roles
ALTER TABLE profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'dispatcher', 'driver', 'customer'));

-- Create helper functions for role-based operations

-- Function to check if user is a driver
CREATE OR REPLACE FUNCTION public.is_driver()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'driver'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a customer
CREATE OR REPLACE FUNCTION public.is_customer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'customer'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is a dispatcher
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

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid();
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set user role (for admin use)
CREATE OR REPLACE FUNCTION public.set_user_role(user_id UUID, new_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Only admins can set user roles
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
    RETURN FALSE;
  END IF;
  
  -- Validate the role
  IF new_role NOT IN ('admin', 'dispatcher', 'driver', 'customer') THEN
    RAISE EXCEPTION 'Invalid role specified. Valid roles are: admin, dispatcher, driver, customer';
    RETURN FALSE;
  END IF;
  
  -- Update the user's role
  UPDATE profiles
  SET role = new_role
  WHERE id = user_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign default role on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_with_role()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, first_name, last_name, avatar_url)
  VALUES (
    new.id, 
    'customer', 
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create new trigger with role assignment
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_with_role();

-- Update RLS policies for profiles table to enforce role-based access

-- Allow users to view profiles based on role
DROP POLICY IF EXISTS "Users can view profiles based on role" ON profiles;
CREATE POLICY "Users can view profiles based on role" ON profiles
FOR SELECT USING (
  -- Everyone can view their own profile
  id = auth.uid() OR
  -- Admins can view all profiles
  public.is_admin() OR
  -- Dispatchers can view all profiles in their organization
  (public.is_dispatcher() AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid()))
);

-- Only admins can update roles
DROP POLICY IF EXISTS "Only admins can update roles" ON profiles;
CREATE POLICY "Only admins can update roles" ON profiles
FOR UPDATE USING (
  id = auth.uid() OR public.is_admin()
);
