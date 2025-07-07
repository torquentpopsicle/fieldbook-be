-- Drop users table if it exists
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert initial users from the JSON data
INSERT INTO users (id, name, email, password, role) VALUES
  ('ac81918e-4b7a-4566-b55f-05ae4984ad9c', 'John Doe', 'customer@example.com', 'customer123', 'customer'),
  ('ad618c35-ba8d-4111-9f99-d5e3780ce8b0', 'Jane Smith', 'admin@fieldbook.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING; 