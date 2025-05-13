-- Create customer notes table
CREATE TABLE IF NOT EXISTS customer_notes (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create customer files table
CREATE TABLE IF NOT EXISTS customer_files (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add some sample data
INSERT INTO customer_notes (customer_id, content)
VALUES 
  (1, 'Customer called about visa extension options.'),
  (1, 'Sent email with required documents for visa renewal.');

INSERT INTO customer_files (customer_id, filename, file_type, file_path)
VALUES 
  (1, 'passport_scan.pdf', 'application/pdf', '/uploads/1/passport_scan.pdf'),
  (1, 'visa_application.pdf', 'application/pdf', '/uploads/1/visa_application.pdf'),
  (1, 'profile_photo.jpg', 'image/jpeg', '/uploads/1/profile_photo.jpg');
