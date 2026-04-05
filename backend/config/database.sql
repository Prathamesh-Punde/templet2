-- Create database
CREATE DATABASE admin_panel_db;

-- Connect to the database
\c admin_panel_db;

-- Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('hr', 'customer_support', 'enquiry_follow_up_executive', 'super_admin');

-- Create Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Careers table (managed by HR and Super Admin)
CREATE TABLE careers (
  id SERIAL PRIMARY KEY,
  job_title VARCHAR(200) NOT NULL,
  department VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  employment_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  responsibilities TEXT NOT NULL,
  salary_range VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Career Applications table (submitted by candidates from public careers page)
CREATE TABLE career_applications (
  id SERIAL PRIMARY KEY,
  career_id INTEGER NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  candidate_name VARCHAR(100) NOT NULL,
  candidate_email VARCHAR(100) NOT NULL,
  candidate_phone VARCHAR(20),
  years_of_experience INTEGER,
  current_location VARCHAR(100),
  resume_link TEXT,
  cover_letter TEXT,
  status VARCHAR(30) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Support Tickets table (managed by Customer Support and Super Admin)
CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  assigned_to INTEGER REFERENCES users(id),
  resolved_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- Create Enquiries table (managed by Enquiry Follow Up Executive and Super Admin)
CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  service VARCHAR(100),
  message TEXT NOT NULL,
  status VARCHAR(40) DEFAULT 'new',
  call_time TIME,
  comments TEXT,
  next_followup_date DATE,
  handled_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Support Ticket Responses table
CREATE TABLE ticket_responses (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  response TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Activity Logs table
CREATE TABLE activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_careers_is_active ON careers(is_active);
CREATE INDEX idx_career_applications_career_id ON career_applications(career_id);
CREATE INDEX idx_career_applications_status ON career_applications(status);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON support_tickets(assigned_to);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_handled_by ON enquiries(handled_by);
CREATE INDEX idx_ticket_responses_ticket_id ON ticket_responses(ticket_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_careers_updated_at BEFORE UPDATE ON careers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_career_applications_updated_at BEFORE UPDATE ON career_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default super admin user (password: admin123 - CHANGE THIS!)
INSERT INTO users (username, email, password, role) VALUES
('superadmin', 'admin@company.com', '$2b$10$6mFPFgcMOqC3MMmedpiaO.LsWaFGvxbytIkQKunypsU1n8wRAJ0Na', 'super_admin');

-- Insert sample data for testing
INSERT INTO users (username, email, password, role) VALUES
('hr_user', 'hr@company.com', '$2b$10$6mFPFgcMOqC3MMmedpiaO.LsWaFGvxbytIkQKunypsU1n8wRAJ0Na', 'hr'),
('support_user', 'support@company.com', '$2b$10$6mFPFgcMOqC3MMmedpiaO.LsWaFGvxbytIkQKunypsU1n8wRAJ0Na', 'customer_support'),
('enquiry_user', 'enquiry@company.com', '$2b$10$6mFPFgcMOqC3MMmedpiaO.LsWaFGvxbytIkQKunypsU1n8wRAJ0Na', 'enquiry_follow_up_executive');
