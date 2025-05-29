-------------------------------------------------------
-- 1. ORGANIZATIONS (for multi-tenant structure)
-------------------------------------------------------

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add role column to profiles table with default 'dispatcher'
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'dispatcher' 
CHECK (role IN ('admin', 'dispatcher'));

-- Add organization_id to support multi-tenant architecture
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Organization members can view their organization" ON organizations
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = organizations.id
    )
  );

CREATE POLICY "Admins can update their organization" ON organizations
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = organizations.id AND role = 'admin'
    )
  );

-------------------------------------------------------
-- 2. DRIVERS
-------------------------------------------------------

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  email TEXT,
  location TEXT,
  status TEXT NOT NULL CHECK (status IN ('AVAILABLE', 'ON_DUTY', 'OFF_DUTY', 'ON_BREAK')),
  license_type TEXT,
  experience INTEGER, -- years
  join_date DATE,
  telegram_username TEXT,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  sms_enabled BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Driver performance metrics
CREATE TABLE IF NOT EXISTS driver_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
  total_miles NUMERIC DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  total_loads INTEGER DEFAULT 0,
  average_rpm NUMERIC DEFAULT 0,
  on_time_delivery_percentage NUMERIC DEFAULT 0,
  load_acceptance_rate NUMERIC DEFAULT 0,
  month INTEGER, -- 1-12
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(driver_id, month, year)
);

-- Enable RLS
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_performance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Organization members can view their drivers" ON drivers
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = drivers.organization_id
    )
  );

CREATE POLICY "Organization members can view driver performance" ON driver_performance
  FOR SELECT USING (
    auth.uid() IN (
      SELECT p.id FROM profiles p
      JOIN drivers d ON p.organization_id = d.organization_id
      WHERE d.id = driver_performance.driver_id
    )
  );

CREATE POLICY "Dispatchers can update their drivers" ON drivers
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = drivers.organization_id
    )
  );

CREATE POLICY "Dispatchers can insert drivers" ON drivers
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = drivers.organization_id
    )
  );

-------------------------------------------------------
-- 3. CUSTOMERS
-------------------------------------------------------

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Customer performance metrics
CREATE TABLE IF NOT EXISTS customer_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  loads_completed INTEGER DEFAULT 0,
  total_revenue NUMERIC DEFAULT 0,
  average_rpm NUMERIC DEFAULT 0,
  issue_percentage NUMERIC DEFAULT 0,
  on_time_delivery_rate NUMERIC DEFAULT 0,
  late_deliveries INTEGER DEFAULT 0,
  month INTEGER, -- 1-12
  year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(customer_id, month, year)
);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_performance ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Organization members can view their customers" ON customers
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = customers.organization_id
    )
  );

CREATE POLICY "Organization members can view customer performance" ON customer_performance
  FOR SELECT USING (
    auth.uid() IN (
      SELECT p.id FROM profiles p
      JOIN customers c ON p.organization_id = c.organization_id
      WHERE c.id = customer_performance.customer_id
    )
  );

CREATE POLICY "Dispatchers can update their customers" ON customers
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = customers.organization_id
    )
  );

CREATE POLICY "Dispatchers can insert customers" ON customers
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = customers.organization_id
    )
  );

-------------------------------------------------------
-- 4. LOADS
-------------------------------------------------------

CREATE TABLE IF NOT EXISTS loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  reference TEXT NOT NULL,
  customer_id UUID REFERENCES customers(id),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  delivery_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('NEW', 'ASSIGNED', 'ACCEPTED', 'REFUSED', 'IN_PROGRESS', 'COMPLETED')),
  driver_id UUID REFERENCES drivers(id),
  rate NUMERIC,
  weight TEXT,
  commodity TEXT,
  equipment TEXT,
  notes TEXT,
  comments TEXT, -- Admin/manager comments
  dispatcher_id UUID REFERENCES profiles(id),
  distance NUMERIC,
  rpm NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Load timeline events
CREATE TABLE IF NOT EXISTS load_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID REFERENCES loads(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('CREATED', 'ASSIGNED', 'ACCEPTED', 'REFUSED', 'ARRIVED_PICKUP', 'DEPARTED_PICKUP', 'ARRIVED_DELIVERY', 'DELIVERED', 'COMPLETED')),
  event_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_timeline ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Organization members can view their loads" ON loads
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = loads.organization_id
    )
  );

CREATE POLICY "Organization members can view load timeline" ON load_timeline
  FOR SELECT USING (
    auth.uid() IN (
      SELECT p.id FROM profiles p
      JOIN loads l ON p.organization_id = l.organization_id
      WHERE l.id = load_timeline.load_id
    )
  );

CREATE POLICY "Dispatchers can update their loads" ON loads
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = loads.organization_id
    )
  );

CREATE POLICY "Dispatchers can insert loads" ON loads
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = loads.organization_id
    )
  );

CREATE POLICY "Dispatchers can insert load timeline events" ON load_timeline
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT p.id FROM profiles p
      JOIN loads l ON p.organization_id = l.organization_id
      WHERE l.id = load_timeline.load_id
    )
  );

-------------------------------------------------------
-- 5. DOCUMENTS
-------------------------------------------------------

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  load_id UUID REFERENCES loads(id),
  driver_id UUID REFERENCES drivers(id),
  customer_id UUID REFERENCES customers(id),
  document_type TEXT NOT NULL CHECK (document_type IN ('RATE_CONFIRMATION', 'BOL', 'POD', 'INVOICE', 'DRIVER_LICENSE', 'INSURANCE', 'OTHER')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Organization members can view their documents" ON documents
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = documents.organization_id
    )
  );

CREATE POLICY "Dispatchers can update their documents" ON documents
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = documents.organization_id
    )
  );

CREATE POLICY "Dispatchers can insert documents" ON documents
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT id FROM profiles WHERE organization_id = documents.organization_id
    )
  );

-------------------------------------------------------
-- 6. VIEWS FOR ADMIN KPI MONITORING
-------------------------------------------------------

-- Load summary view for KPI dashboards
CREATE OR REPLACE VIEW load_summary AS
SELECT
  l.organization_id,
  DATE_TRUNC('month', l.created_at) AS month,
  COUNT(*) AS total_loads,
  SUM(CASE WHEN l.status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_loads,
  SUM(l.rate) AS total_revenue,
  AVG(l.rpm) AS average_rpm,
  SUM(l.distance) AS total_miles,
  COUNT(DISTINCT l.driver_id) AS active_drivers,
  COUNT(DISTINCT l.customer_id) AS active_customers
FROM loads l
GROUP BY l.organization_id, DATE_TRUNC('month', l.created_at);

-- Dispatcher activity view
CREATE OR REPLACE VIEW dispatcher_activity AS
SELECT
  p.id AS dispatcher_id,
  p.full_name,
  p.organization_id,
  COUNT(l.id) AS total_loads_created,
  SUM(l.rate) AS total_revenue_managed,
  COUNT(DISTINCT l.driver_id) AS drivers_assigned,
  COUNT(DISTINCT l.customer_id) AS customers_served,
  DATE_TRUNC('month', l.created_at) AS month
FROM profiles p
LEFT JOIN loads l ON p.id = l.dispatcher_id
WHERE p.role = 'dispatcher'
GROUP BY p.id, p.full_name, p.organization_id, DATE_TRUNC('month', l.created_at);

-------------------------------------------------------
-- 7. FUNCTIONS FOR DOCUMENT EXPORT (CSV/XLSX)
-------------------------------------------------------

-- Function to export loads as CSV
CREATE OR REPLACE FUNCTION export_loads_csv(
  org_id UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Only allow this function to be called by admins
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND organization_id = org_id 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Build CSV header
  result := 'id,reference,customer,origin,destination,pickup_date,delivery_date,status,driver,rate,distance,rpm,created_at' || E'\n';
  
  -- Build CSV data
  SELECT string_agg(
    l.id || ',' || 
    l.reference || ',' || 
    c.name || ',' || 
    l.origin || ',' || 
    l.destination || ',' || 
    l.pickup_date || ',' || 
    l.delivery_date || ',' || 
    l.status || ',' || 
    COALESCE(d.name, 'Unassigned') || ',' || 
    COALESCE(l.rate::TEXT, '') || ',' || 
    COALESCE(l.distance::TEXT, '') || ',' || 
    COALESCE(l.rpm::TEXT, '') || ',' || 
    l.created_at,
    E'\n'
  )
  INTO result
  FROM loads l
  LEFT JOIN customers c ON l.customer_id = c.id
  LEFT JOIN drivers d ON l.driver_id = d.id
  WHERE l.organization_id = org_id
  AND (start_date IS NULL OR l.created_at >= start_date)
  AND (end_date IS NULL OR l.created_at <= end_date);
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to export drivers as CSV
CREATE OR REPLACE FUNCTION export_drivers_csv(
  org_id UUID
) RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  -- Only allow this function to be called by admins
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND organization_id = org_id 
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  -- Build CSV header
  result := 'id,name,phone,email,location,status,license_type,experience,join_date,total_miles,total_revenue,total_loads,average_rpm,on_time_delivery,load_acceptance_rate' || E'\n';
  
  -- Build CSV data
  SELECT string_agg(
    d.id || ',' || 
    d.name || ',' || 
    COALESCE(d.phone, '') || ',' || 
    COALESCE(d.email, '') || ',' || 
    COALESCE(d.location, '') || ',' || 
    d.status || ',' || 
    COALESCE(d.license_type, '') || ',' || 
    COALESCE(d.experience::TEXT, '') || ',' || 
    COALESCE(d.join_date::TEXT, '') || ',' || 
    COALESCE(dp.total_miles::TEXT, '0') || ',' || 
    COALESCE(dp.total_revenue::TEXT, '0') || ',' || 
    COALESCE(dp.total_loads::TEXT, '0') || ',' || 
    COALESCE(dp.average_rpm::TEXT, '0') || ',' || 
    COALESCE(dp.on_time_delivery_percentage::TEXT, '0') || ',' || 
    COALESCE(dp.load_acceptance_rate::TEXT, '0'),
    E'\n'
  )
  INTO result
  FROM drivers d
  LEFT JOIN (
    SELECT 
      driver_id, 
      SUM(total_miles) as total_miles,
      SUM(total_revenue) as total_revenue,
      SUM(total_loads) as total_loads,
      AVG(average_rpm) as average_rpm,
      AVG(on_time_delivery_percentage) as on_time_delivery_percentage,
      AVG(load_acceptance_rate) as load_acceptance_rate
    FROM driver_performance
    GROUP BY driver_id
  ) dp ON d.id = dp.driver_id
  WHERE d.organization_id = org_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-------------------------------------------------------
-- 8. INDEXES FOR PERFORMANCE OPTIMIZATION
-------------------------------------------------------

-- Loads indexes
CREATE INDEX IF NOT EXISTS idx_loads_organization_id ON loads(organization_id);
CREATE INDEX IF NOT EXISTS idx_loads_customer_id ON loads(customer_id);
CREATE INDEX IF NOT EXISTS idx_loads_driver_id ON loads(driver_id);
CREATE INDEX IF NOT EXISTS idx_loads_dispatcher_id ON loads(dispatcher_id);
CREATE INDEX IF NOT EXISTS idx_loads_status ON loads(status);
CREATE INDEX IF NOT EXISTS idx_loads_pickup_date ON loads(pickup_date);
CREATE INDEX IF NOT EXISTS idx_loads_delivery_date ON loads(delivery_date);
CREATE INDEX IF NOT EXISTS idx_loads_created_at ON loads(created_at);

-- Drivers indexes
CREATE INDEX IF NOT EXISTS idx_drivers_organization_id ON drivers(organization_id);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);

-- Documents indexes
CREATE INDEX IF NOT EXISTS idx_documents_organization_id ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_load_id ON documents(load_id);
CREATE INDEX IF NOT EXISTS idx_documents_driver_id ON documents(driver_id);
CREATE INDEX IF NOT EXISTS idx_documents_customer_id ON documents(customer_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_type ON documents(document_type);

-- Timeline indexes
CREATE INDEX IF NOT EXISTS idx_load_timeline_load_id ON load_timeline(load_id);
CREATE INDEX IF NOT EXISTS idx_load_timeline_event_type ON load_timeline(event_type);
CREATE INDEX IF NOT EXISTS idx_load_timeline_event_time ON load_timeline(event_time);

-------------------------------------------------------
-- 9. TRIGGERS FOR AUTOMATED UPDATES
-------------------------------------------------------

-- Trigger to update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all tables with updated_at
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'updated_at' 
    AND table_schema = 'public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_timestamp ON %I', t);
    EXECUTE format('CREATE TRIGGER update_timestamp BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_timestamp()', t);
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create load_timeline events
CREATE OR REPLACE FUNCTION log_load_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS NULL OR NEW.status <> OLD.status THEN
    INSERT INTO load_timeline (
      load_id, 
      event_type, 
      notes,
      created_by
    ) VALUES (
      NEW.id, 
      NEW.status,
      'Status changed to ' || NEW.status,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_load_status_change
AFTER INSERT OR UPDATE OF status ON loads
FOR EACH ROW
EXECUTE FUNCTION log_load_status_change();
