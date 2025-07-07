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
  ('d3870434-3ffc-4e99-bbd0-779f208050c0', 'Jane Smith', 'jane.smith@example.com', 'jane123', 'customer')
ON CONFLICT (email) DO NOTHING; 