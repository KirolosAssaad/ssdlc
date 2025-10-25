# PostgreSQL Setup Guide for BookVault

BookVault uses PostgreSQL as its primary and only supported database. This guide will help you set up PostgreSQL for development and production.

## 🐘 Why PostgreSQL Only?

- **Production Ready**: PostgreSQL is enterprise-grade and production-ready
- **Feature Rich**: Advanced features like JSON support, full-text search, and extensions
- **Scalability**: Better performance and scalability compared to SQLite
- **Consistency**: Same database in development, testing, and production
- **Docker Integration**: Seamless integration with Docker containers

## 📋 Prerequisites

### Development Environment
- PostgreSQL 12+ installed locally
- Python 3.9+ with psycopg2-binary package
- Access to create databases and users

### Production Environment
- Managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Or self-hosted PostgreSQL with proper backup and monitoring

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
cd ssdlc-backend
python setup_postgres.py
```

This script will:
- Check if PostgreSQL is installed and running
- Create the `bookvault` database
- Create the `bookvault_user` with proper permissions
- Test the connection

### Option 2: Manual Setup

#### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### 2. Create Database and User
```bash
# Connect as postgres user
sudo -u postgres psql

# Create user
CREATE USER bookvault_user WITH PASSWORD 'bookvault_password';

# Create database
CREATE DATABASE bookvault OWNER bookvault_user;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE bookvault TO bookvault_user;

# Exit
\q
```

#### 3. Update Configuration
Update your `.env` file:
```bash
DATABASE_URL=postgresql://bookvault_user:bookvault_password@localhost:5432/bookvault
```

#### 4. Initialize Database
```bash
python init_db.py
```

## 🐳 Docker Setup

### Development with Docker Compose
The Docker Compose setup automatically handles PostgreSQL:

```bash
# Start all services including PostgreSQL
docker-compose up -d

# Check PostgreSQL status
docker-compose logs postgres
```

### Production Docker
For production, use managed PostgreSQL services:

```yaml
# docker-compose.prod.yml
services:
  backend:
    environment:
      DATABASE_URL: postgresql://user:password@your-postgres-host:5432/bookvault
```

## 🔧 Configuration Options

### Environment Variables
```bash
# Required
DATABASE_URL=postgresql://user:password@host:port/database

# Optional (for testing)
TEST_DATABASE_URL=postgresql://user:password@host:port/bookvault_test
```

### Connection Parameters
The DATABASE_URL supports various PostgreSQL connection parameters:

```bash
# Basic connection
DATABASE_URL=postgresql://user:password@localhost:5432/bookvault

# With SSL (production)
DATABASE_URL=postgresql://user:password@host:5432/bookvault?sslmode=require

# With connection pooling
DATABASE_URL=postgresql://user:password@host:5432/bookvault?pool_size=20&max_overflow=0
```

## 🏭 Production Considerations

### Managed Services (Recommended)

**AWS RDS:**
```bash
DATABASE_URL=postgresql://username:password@your-rds-endpoint.amazonaws.com:5432/bookvault?sslmode=require
```

**Google Cloud SQL:**
```bash
DATABASE_URL=postgresql://username:password@your-cloud-sql-ip:5432/bookvault?sslmode=require
```

**Azure Database:**
```bash
DATABASE_URL=postgresql://username:password@your-server.postgres.database.azure.com:5432/bookvault?sslmode=require
```

### Self-Hosted Production

#### Security Configuration
```bash
# postgresql.conf
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
ssl_ca_file = 'ca.crt'

# pg_hba.conf
hostssl all all 0.0.0.0/0 md5
```

#### Performance Tuning
```bash
# postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

#### Backup Configuration
```bash
# Daily backup script
#!/bin/bash
pg_dump -h localhost -U bookvault_user bookvault > backup_$(date +%Y%m%d).sql

# Automated backup with retention
pg_dump -h localhost -U bookvault_user -Fc bookvault > backup_$(date +%Y%m%d).dump
find /backup/path -name "backup_*.dump" -mtime +7 -delete
```

## 🧪 Testing Configuration

### Test Database Setup
```bash
# Create test database
sudo -u postgres createdb bookvault_test -O bookvault_user

# Set test environment variable
export TEST_DATABASE_URL=postgresql://bookvault_user:bookvault_password@localhost:5432/bookvault_test
```

### Running Tests
```bash
# Run tests with test database
FLASK_ENV=testing python -m pytest
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Connection Refused
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql
```

#### 2. Authentication Failed
```bash
# Check pg_hba.conf configuration
sudo nano /etc/postgresql/*/main/pg_hba.conf

# Ensure this line exists:
local   all             all                                     md5
```

#### 3. Database Does Not Exist
```bash
# Create database manually
sudo -u postgres createdb bookvault -O bookvault_user
```

#### 4. Permission Denied
```bash
# Grant all privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE bookvault TO bookvault_user;"
```

### Connection Testing
```bash
# Test connection with psql
psql -h localhost -U bookvault_user -d bookvault

# Test connection with Python
python -c "
from sqlalchemy import create_engine
engine = create_engine('postgresql://bookvault_user:bookvault_password@localhost:5432/bookvault')
with engine.connect() as conn:
    print('✅ Connection successful!')
"
```

### Performance Monitoring
```bash
# Check active connections
SELECT count(*) FROM pg_stat_activity WHERE state = 'active';

# Check database size
SELECT pg_size_pretty(pg_database_size('bookvault'));

# Check table sizes
SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## 📊 Monitoring and Maintenance

### Health Checks
```bash
# Database health check
SELECT version(), current_database(), current_user, now();

# Check for long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';
```

### Regular Maintenance
```bash
# Analyze tables for query optimization
ANALYZE;

# Vacuum to reclaim space
VACUUM;

# Full vacuum (requires downtime)
VACUUM FULL;

# Reindex for performance
REINDEX DATABASE bookvault;
```

## 🔐 Security Best Practices

### User Management
```sql
-- Create read-only user for reporting
CREATE USER bookvault_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE bookvault TO bookvault_readonly;
GRANT USAGE ON SCHEMA public TO bookvault_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bookvault_readonly;

-- Create backup user
CREATE USER bookvault_backup WITH PASSWORD 'backup_password';
GRANT CONNECT ON DATABASE bookvault TO bookvault_backup;
GRANT USAGE ON SCHEMA public TO bookvault_backup;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO bookvault_backup;
```

### Connection Security
- Always use SSL in production (`sslmode=require`)
- Use strong passwords
- Limit connection sources with pg_hba.conf
- Regular security updates

### Data Protection
- Regular backups with encryption
- Point-in-time recovery setup
- Database encryption at rest
- Network encryption in transit

## 📚 Additional Resources

- [PostgreSQL Official Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy PostgreSQL Dialect](https://docs.sqlalchemy.org/en/14/dialects/postgresql.html)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [PostgreSQL Security](https://www.postgresql.org/docs/current/security.html)