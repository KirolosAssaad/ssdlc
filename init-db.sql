-- BookVault Database Initialization Script
-- This script sets up the initial database configuration

-- Create the database (if not exists)
SELECT 'CREATE DATABASE bookvault'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'bookvault');

-- Connect to the bookvault database
\c bookvault;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Create indexes for better performance (will be created by SQLAlchemy migrations)
-- These are just placeholders for future optimizations

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE bookvault TO bookvault_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO bookvault_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO bookvault_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO bookvault_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO bookvault_user;