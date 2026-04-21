-- Migration for adding customers management to existing database

CREATE SEQUENCE IF NOT EXISTS customer_id_seq START WITH 1000 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(50) UNIQUE NOT NULL DEFAULT ('CUST-' || LPAD(nextval('customer_id_seq')::text, 6, '0')),
  customer_name VARCHAR(100) NOT NULL,
  product VARCHAR(150) NOT NULL,
  mobile_no VARCHAR(20) NOT NULL,
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customers_customer_id ON customers(customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_purchase_date ON customers(purchase_date);

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Backfill missing/empty IDs and ensure future IDs continue after existing max
UPDATE customers
SET customer_id = 'CUST-' || LPAD(nextval('customer_id_seq')::text, 6, '0')
WHERE customer_id IS NULL OR BTRIM(customer_id) = '';

SELECT setval(
  'customer_id_seq',
  GREATEST(
    COALESCE(
      (
        SELECT MAX(NULLIF(regexp_replace(customer_id, '\\D', '', 'g'), '')::bigint)
        FROM customers
      ),
      0
    ),
    999
  )
);

ALTER TABLE customers
  ALTER COLUMN customer_id SET DEFAULT ('CUST-' || LPAD(nextval('customer_id_seq')::text, 6, '0'));
