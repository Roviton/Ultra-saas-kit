-------------------------------------------------------
-- SUBSCRIPTION TIERS AND TEAM MEMBER LIMITS
-------------------------------------------------------

-- Create subscription tiers table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  max_team_members INTEGER NOT NULL,
  max_drivers INTEGER NOT NULL,
  max_customers INTEGER NOT NULL,
  max_loads_per_month INTEGER NOT NULL,
  can_export_csv BOOLEAN NOT NULL DEFAULT false,
  can_export_xlsx BOOLEAN NOT NULL DEFAULT false,
  can_use_ai_features BOOLEAN NOT NULL DEFAULT false,
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on subscription_tiers
ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

-- Everyone can view subscription tiers
CREATE POLICY "Everyone can view subscription tiers" ON subscription_tiers
  FOR SELECT USING (true);

-- Add subscription tier to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_tier_id UUID REFERENCES subscription_tiers(id);
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;

-- Insert default subscription tiers
INSERT INTO subscription_tiers 
  (name, max_team_members, max_drivers, max_customers, max_loads_per_month, can_export_csv, can_export_xlsx, can_use_ai_features, price_monthly)
VALUES
  ('Free', 1, 5, 10, 20, false, false, false, 0),
  ('Basic', 3, 15, 30, 100, true, false, false, 29.99),
  ('Pro', 10, 50, 100, 500, true, true, false, 99.99),
  ('Enterprise', 999999, 999999, 999999, 999999, true, true, true, 299.99);

-- Create function to check team member limits
CREATE OR REPLACE FUNCTION public.check_team_member_limit()
RETURNS TRIGGER AS $$
DECLARE
  max_members INTEGER;
  current_count INTEGER;
  tier_id UUID;
BEGIN
  -- Get the organization's subscription tier
  SELECT subscription_tier_id INTO tier_id
  FROM organizations
  WHERE id = NEW.organization_id;
  
  -- Get the maximum allowed team members for this tier
  SELECT max_team_members INTO max_members
  FROM subscription_tiers
  WHERE id = tier_id;
  
  -- Count current team members in this organization
  SELECT COUNT(*) INTO current_count
  FROM profiles
  WHERE organization_id = NEW.organization_id;
  
  -- If adding this user would exceed the limit, raise an error
  IF current_count >= max_members THEN
    RAISE EXCEPTION 'Cannot add more team members. Your subscription tier allows a maximum of % team members.', max_members;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to enforce team member limit on new profile creation
CREATE TRIGGER enforce_team_member_limit
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_team_member_limit();

-- Set default subscription tier for existing organizations
UPDATE organizations
SET subscription_tier_id = (SELECT id FROM subscription_tiers WHERE name = 'Free')
WHERE subscription_tier_id IS NULL;

-- Make subscription tier required for organizations
ALTER TABLE organizations ALTER COLUMN subscription_tier_id SET NOT NULL;

-- Create function to check subscription tier limits for various resources
CREATE OR REPLACE FUNCTION public.check_subscription_limit(org_id UUID, resource_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  tier RECORD;
  current_count INTEGER;
BEGIN
  -- Get the organization's subscription tier details
  SELECT st.* INTO tier
  FROM organizations o
  JOIN subscription_tiers st ON o.subscription_tier_id = st.id
  WHERE o.id = org_id;
  
  -- Check limits based on resource type
  CASE resource_type
    WHEN 'drivers' THEN
      SELECT COUNT(*) INTO current_count FROM drivers WHERE organization_id = org_id;
      RETURN current_count < tier.max_drivers;
    
    WHEN 'customers' THEN
      SELECT COUNT(*) INTO current_count FROM customers WHERE organization_id = org_id;
      RETURN current_count < tier.max_customers;
    
    WHEN 'loads' THEN
      -- Count loads created in the current month
      SELECT COUNT(*) INTO current_count 
      FROM loads 
      WHERE organization_id = org_id 
      AND created_at >= date_trunc('month', CURRENT_DATE);
      
      RETURN current_count < tier.max_loads_per_month;
    
    WHEN 'can_export_csv' THEN
      RETURN tier.can_export_csv;
    
    WHEN 'can_export_xlsx' THEN
      RETURN tier.can_export_xlsx;
    
    WHEN 'can_use_ai_features' THEN
      RETURN tier.can_use_ai_features;
    
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to enforce resource limits
CREATE OR REPLACE FUNCTION public.enforce_driver_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.check_subscription_limit(NEW.organization_id, 'drivers') THEN
    RAISE EXCEPTION 'You have reached your subscription tier limit for drivers';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_driver_limit
  BEFORE INSERT ON drivers
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_driver_limit();

CREATE OR REPLACE FUNCTION public.enforce_customer_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.check_subscription_limit(NEW.organization_id, 'customers') THEN
    RAISE EXCEPTION 'You have reached your subscription tier limit for customers';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_customer_limit
  BEFORE INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_customer_limit();

CREATE OR REPLACE FUNCTION public.enforce_load_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT public.check_subscription_limit(NEW.organization_id, 'loads') THEN
    RAISE EXCEPTION 'You have reached your subscription tier monthly limit for loads';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER enforce_load_limit
  BEFORE INSERT ON loads
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_load_limit();

-- Function to get list of features available to an organization
CREATE OR REPLACE FUNCTION public.get_organization_features(org_id UUID)
RETURNS TABLE (
  feature_name TEXT,
  feature_enabled BOOLEAN,
  feature_limit INTEGER,
  feature_usage INTEGER
) AS $$
DECLARE
  tier RECORD;
  load_count INTEGER;
BEGIN
  -- Get the organization's subscription tier details
  SELECT st.* INTO tier
  FROM organizations o
  JOIN subscription_tiers st ON o.subscription_tier_id = st.id
  WHERE o.id = org_id;

  -- Count current loads this month
  SELECT COUNT(*) INTO load_count 
  FROM loads 
  WHERE organization_id = org_id 
  AND created_at >= date_trunc('month', CURRENT_DATE);

  -- Return available features and limits
  RETURN QUERY
  SELECT 'Team Members'::TEXT, true, tier.max_team_members,
    (SELECT COUNT(*) FROM profiles WHERE organization_id = org_id)
  UNION
  SELECT 'Drivers'::TEXT, true, tier.max_drivers,
    (SELECT COUNT(*) FROM drivers WHERE organization_id = org_id)
  UNION
  SELECT 'Customers'::TEXT, true, tier.max_customers, 
    (SELECT COUNT(*) FROM customers WHERE organization_id = org_id)
  UNION
  SELECT 'Loads per Month'::TEXT, true, tier.max_loads_per_month, load_count
  UNION
  SELECT 'CSV Export'::TEXT, tier.can_export_csv, NULL, NULL
  UNION
  SELECT 'XLSX Export'::TEXT, tier.can_export_xlsx, NULL, NULL
  UNION
  SELECT 'AI Features'::TEXT, tier.can_use_ai_features, NULL, NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Only organization members can view their organization's features
CREATE POLICY "Organization members can view their features" ON subscription_tiers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organizations
      WHERE subscription_tier_id = subscription_tiers.id
      AND id = (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  );
