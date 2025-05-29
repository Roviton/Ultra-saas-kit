-------------------------------------------------------
-- MULTI-TENANT ROW LEVEL SECURITY POLICIES
-------------------------------------------------------

-- Helper functions for RLS policies

-- Function to check if user belongs to an organization
CREATE OR REPLACE FUNCTION public.belongs_to_organization(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND organization_id = org_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin of an organization
CREATE OR REPLACE FUNCTION public.is_admin_of_organization(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND organization_id = org_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current organization ID
CREATE OR REPLACE FUNCTION public.current_organization_id()
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

-------------------------------------------------------
-- ORGANIZATIONS TABLE RLS POLICIES
-------------------------------------------------------

-- Ensure RLS is enabled
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Organization members can view their organization" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;

-- Create comprehensive policies
CREATE POLICY "Users can view only their organization" ON organizations
  FOR SELECT USING (
    public.belongs_to_organization(id)
  );

CREATE POLICY "Only admins can update their organization" ON organizations
  FOR UPDATE USING (
    public.is_admin_of_organization(id)
  );

CREATE POLICY "Only admins can insert organizations" ON organizations
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'admin'
    )
  );

-------------------------------------------------------
-- PROFILES TABLE RLS POLICIES
-------------------------------------------------------

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles in their organization" ON profiles;

-- Create comprehensive policies
CREATE POLICY "Users can view profiles in their organization" ON profiles
  FOR SELECT USING (
    organization_id = public.current_organization_id() OR
    id = auth.uid()
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (
    id = auth.uid()
  );

CREATE POLICY "Admins can update profiles in their organization" ON profiles
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles 
      WHERE role = 'admin' AND organization_id = profiles.organization_id
    )
  );

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (
    id = auth.uid()
  );

-------------------------------------------------------
-- DRIVERS TABLE RLS POLICIES
-------------------------------------------------------

-- Ensure RLS is enabled
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Organization members can view their drivers" ON drivers;
DROP POLICY IF EXISTS "Dispatchers can update their drivers" ON drivers;
DROP POLICY IF EXISTS "Dispatchers can insert drivers" ON drivers;

-- Create comprehensive policies
CREATE POLICY "Users can view drivers in their organization" ON drivers
  FOR SELECT USING (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can update drivers in their organization" ON drivers
  FOR UPDATE USING (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can insert drivers in their organization" ON drivers
  FOR INSERT WITH CHECK (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can delete drivers in their organization" ON drivers
  FOR DELETE USING (
    organization_id = public.current_organization_id()
  );

-------------------------------------------------------
-- DRIVER_PERFORMANCE TABLE RLS POLICIES
-------------------------------------------------------

-- Ensure RLS is enabled
ALTER TABLE driver_performance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Organization members can view driver performance" ON driver_performance;

-- Create comprehensive policies
CREATE POLICY "Users can view driver performance in their organization" ON driver_performance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = driver_performance.driver_id
      AND d.organization_id = public.current_organization_id()
    )
  );

CREATE POLICY "Users can update driver performance in their organization" ON driver_performance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = driver_performance.driver_id
      AND d.organization_id = public.current_organization_id()
    )
  );

CREATE POLICY "Users can insert driver performance in their organization" ON driver_performance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM drivers d
      WHERE d.id = driver_performance.driver_id
      AND d.organization_id = public.current_organization_id()
    )
  );

-------------------------------------------------------
-- CUSTOMERS TABLE RLS POLICIES
-------------------------------------------------------

-- Ensure RLS is enabled
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Organization members can view their customers" ON customers;
DROP POLICY IF EXISTS "Dispatchers can update their customers" ON customers;
DROP POLICY IF EXISTS "Dispatchers can insert customers" ON customers;

-- Create comprehensive policies
CREATE POLICY "Users can view customers in their organization" ON customers
  FOR SELECT USING (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can update customers in their organization" ON customers
  FOR UPDATE USING (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can insert customers in their organization" ON customers
  FOR INSERT WITH CHECK (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can delete customers in their organization" ON customers
  FOR DELETE USING (
    organization_id = public.current_organization_id()
  );

-------------------------------------------------------
-- CUSTOMER_PERFORMANCE TABLE RLS POLICIES
-------------------------------------------------------

-- Ensure RLS is enabled
ALTER TABLE customer_performance ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Organization members can view customer performance" ON customer_performance;

-- Create comprehensive policies
CREATE POLICY "Users can view customer performance in their organization" ON customer_performance
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = customer_performance.customer_id
      AND c.organization_id = public.current_organization_id()
    )
  );

CREATE POLICY "Users can update customer performance in their organization" ON customer_performance
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = customer_performance.customer_id
      AND c.organization_id = public.current_organization_id()
    )
  );

CREATE POLICY "Users can insert customer performance in their organization" ON customer_performance
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM customers c
      WHERE c.id = customer_performance.customer_id
      AND c.organization_id = public.current_organization_id()
    )
  );

-------------------------------------------------------
-- LOADS TABLE RLS POLICIES
-------------------------------------------------------

-- Ensure RLS is enabled
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Organization members can view their loads" ON loads;
DROP POLICY IF EXISTS "Dispatchers can update their loads" ON loads;
DROP POLICY IF EXISTS "Dispatchers can insert loads" ON loads;

-- Create comprehensive policies
CREATE POLICY "Users can view loads in their organization" ON loads
  FOR SELECT USING (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can update loads in their organization" ON loads
  FOR UPDATE USING (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can insert loads in their organization" ON loads
  FOR INSERT WITH CHECK (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can delete loads in their organization" ON loads
  FOR DELETE USING (
    organization_id = public.current_organization_id()
  );

-------------------------------------------------------
-- LOAD_TIMELINE TABLE RLS POLICIES
-------------------------------------------------------

-- Ensure RLS is enabled
ALTER TABLE load_timeline ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Organization members can view load timeline" ON load_timeline;
DROP POLICY IF EXISTS "Dispatchers can insert load timeline events" ON load_timeline;

-- Create comprehensive policies
CREATE POLICY "Users can view load timeline in their organization" ON load_timeline
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM loads l
      WHERE l.id = load_timeline.load_id
      AND l.organization_id = public.current_organization_id()
    )
  );

CREATE POLICY "Users can insert load timeline in their organization" ON load_timeline
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM loads l
      WHERE l.id = load_timeline.load_id
      AND l.organization_id = public.current_organization_id()
    )
  );

-------------------------------------------------------
-- DOCUMENTS TABLE RLS POLICIES
-------------------------------------------------------

-- Ensure RLS is enabled
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Organization members can view their documents" ON documents;
DROP POLICY IF EXISTS "Dispatchers can update their documents" ON documents;
DROP POLICY IF EXISTS "Dispatchers can insert documents" ON documents;

-- Create comprehensive policies
CREATE POLICY "Users can view documents in their organization" ON documents
  FOR SELECT USING (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can update documents in their organization" ON documents
  FOR UPDATE USING (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can insert documents in their organization" ON documents
  FOR INSERT WITH CHECK (
    organization_id = public.current_organization_id()
  );

CREATE POLICY "Users can delete documents in their organization" ON documents
  FOR DELETE USING (
    organization_id = public.current_organization_id()
  );

-------------------------------------------------------
-- ADMIN-SPECIFIC PERMISSIONS
-------------------------------------------------------

-- Views specifically for admins
CREATE OR REPLACE VIEW admin_organization_summary AS
SELECT
  o.id AS organization_id,
  o.name AS organization_name,
  COUNT(DISTINCT p.id) AS total_users,
  SUM(CASE WHEN p.role = 'admin' THEN 1 ELSE 0 END) AS admin_count,
  SUM(CASE WHEN p.role = 'dispatcher' THEN 1 ELSE 0 END) AS dispatcher_count,
  COUNT(DISTINCT d.id) AS total_drivers,
  COUNT(DISTINCT c.id) AS total_customers,
  COUNT(DISTINCT l.id) AS total_loads
FROM
  organizations o
  LEFT JOIN profiles p ON o.id = p.organization_id
  LEFT JOIN drivers d ON o.id = d.organization_id
  LEFT JOIN customers c ON o.id = c.organization_id
  LEFT JOIN loads l ON o.id = l.organization_id
GROUP BY
  o.id, o.name;

-- RLS policy for the admin view
CREATE POLICY "Only admins can access organization summary" ON admin_organization_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Function for admins to get all organization users
CREATE OR REPLACE FUNCTION admin_get_organization_users(org_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  username TEXT,
  email TEXT,
  role TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Check if user is admin of the specified organization
  IF NOT public.is_admin_of_organization(org_id) THEN
    RAISE EXCEPTION 'Unauthorized: Only organization admins can view all users';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.username,
    u.email,
    p.role,
    u.created_at
  FROM 
    profiles p
    JOIN auth.users u ON p.id = u.id
  WHERE 
    p.organization_id = org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
