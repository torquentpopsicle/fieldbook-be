-- Drop tables if they exist to ensure a clean migration
DROP TABLE IF EXISTS field_availability CASCADE;
DROP TABLE IF EXISTS field_facilities CASCADE;
DROP TABLE IF EXISTS fields CASCADE;
DROP TABLE IF EXISTS facilities CASCADE;
DROP TABLE IF EXISTS sport_types CASCADE;

-- Create sport_types table
CREATE TABLE IF NOT EXISTS sport_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create facilities table
CREATE TABLE IF NOT EXISTS facilities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create fields table
CREATE TABLE IF NOT EXISTS fields (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  sport_type_id INTEGER REFERENCES sport_types(id),
  sport_type VARCHAR(50), -- Keep for backward compatibility
  rating DECIMAL(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  capacity INTEGER NOT NULL,
  availability_summary VARCHAR(100),
  price_per_hour DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'Rp',
  description TEXT,
  images TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create field_facilities junction table
CREATE TABLE IF NOT EXISTS field_facilities (
  id SERIAL PRIMARY KEY,
  field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
  facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(field_id, facility_id)
);

-- Create field_availability table with unique constraint
CREATE TABLE IF NOT EXISTS field_availability (
  id SERIAL PRIMARY KEY,
  field_id INTEGER REFERENCES fields(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(field_id, day_of_week, start_time, end_time)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fields_address ON fields(address);
CREATE INDEX IF NOT EXISTS idx_fields_price ON fields(price_per_hour);
CREATE INDEX IF NOT EXISTS idx_fields_rating ON fields(rating);
CREATE INDEX IF NOT EXISTS idx_field_facilities_field_id ON field_facilities(field_id);
CREATE INDEX IF NOT EXISTS idx_field_availability_field_id ON field_availability(field_id);

-- Insert initial sport types
INSERT INTO sport_types (name, description) VALUES
  ('Soccer', 'Football/soccer fields'),
  ('Basketball', 'Basketball courts'),
  ('Futsal', 'Indoor soccer/futsal'),
  ('Badminton', 'Badminton courts'),
  ('Tennis', 'Tennis courts'),
  ('Volleyball', 'Volleyball courts')
ON CONFLICT (name) DO NOTHING;

-- Insert initial facilities
INSERT INTO facilities (name, description, icon) VALUES
  ('Indoor', 'Indoor facility', 'indoor'),
  ('Outdoor', 'Outdoor facility', 'outdoor'),
  ('Parking', 'Parking available', 'parking'),
  ('Changing Rooms', 'Changing rooms available', 'changing-rooms'),
  ('Air Conditioning', 'Air conditioning available', 'ac'),
  ('Sound System', 'Sound system available', 'sound'),
  ('Floodlights', 'Floodlights for night play', 'lights'),
  ('Equipment Rental', 'Equipment rental available', 'equipment'),
  ('Toilet', 'Toilet facilities', 'toilet'),
  ('Kantin', 'Food and beverage available', 'food'),
  ('Mushola', 'Prayer room available', 'prayer')
ON CONFLICT (name) DO NOTHING; 