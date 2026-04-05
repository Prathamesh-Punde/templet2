-- Migration for adding enquiry follow-up workflow to an existing database

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'enquiry_follow_up_executive';

CREATE TABLE IF NOT EXISTS enquiries (
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

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_handled_by ON enquiries(handled_by);

DROP TRIGGER IF EXISTS update_enquiries_updated_at ON enquiries;
CREATE TRIGGER update_enquiries_updated_at BEFORE UPDATE ON enquiries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
