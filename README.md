# BookVault - Digital Ebook Store

A complete full-stack application for digital ebook sales with device registration and secure downloads.

## 🏗️ Architecture

BookVault consists of three main components:
- **Frontend**: React 19 + TypeScript + Vite (served with Nginx)
- **Backend**: Flask + SQLAlchemy + JWT Authentication
- **Database**: PostgreSQL for data persistence

## 🚀 Quick Start with Docker

### Prerequisites
- Docker (20.10+)
- Docker Compose (2.0+)

### 1. Clone and Start
```bash
git clone <repository-url>
cd bookvault
./start-bookvault.sh
```

### 2. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api

### 3. Test Credentials
```
Email: john.doe@example.com
Password: password123
```

## 📋 Services

### Frontend (Port 3000)
- **Technology**: React 19, TypeScript, Vite
- **Server**: Nginx with security headers
- **Features**: 
  - Responsive design with mobile-first approach
  - Book browsing and purchasing
  - User authentication and account management
  - Device registration for downloads

### Backend (Port 5000)
- **Technology**: Flask, SQLAlchemy, JWT
- **Features**:
  - RESTful API with comprehensive validation
  - JWT-based authentication
  - Device registration (one device per user)
  - Book catalog with search and filtering
  - Purchase tracking and download management
  - Security middleware with headers protection

### Database (Port 5432)
- **Technology**: PostgreSQL 15
- **Features**:
  - Persistent data storage
  - Automatic initialization and seeding
  - Optimized indexes for performance



## 🛠️ Development

### Local Development Setup

#### Backend Development
```bash
cd ssdlc-backend
poetry install
poetry shell
cp .env.example .env
# Update .env with your settings
poetry run python init_db.py
poetry run python run.py
```

#### Frontend Development
```bash
cd ssdlc-frontent
pnpm install
cp .env.example .env
# Update .env with your settings
pnpm dev
```

### Docker Development
```bash
# Start all services
./start-bookvault.sh

# View logs
docker-compose logs -f

# Restart a specific service
docker-compose restart backend

# Stop all services
./stop-bookvault.sh
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Security Keys (CHANGE IN PRODUCTION!)
SECRET_KEY=your-super-secret-key
JWT_SECRET_KEY=your-jwt-secret-key

# Database
POSTGRES_DB=bookvault
POSTGRES_USER=bookvault_user
POSTGRES_PASSWORD=bookvault_password

# Email (Optional)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# Application
FLASK_ENV=production
DEBUG=False
BOOKS_PER_PAGE=20
VITE_API_BASE_URL=http://localhost:5000/api
```

### Docker Compose Services

```yaml
services:
  postgres:    # PostgreSQL database
  backend:     # Flask API server
  frontend:    # React app with Nginx
```

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Password reset
- `GET /api/auth/me` - Current user info

### Book Endpoints
- `GET /api/books` - List books with pagination
- `GET /api/books/{id}` - Get specific book
- `POST /api/books/purchase` - Purchase book
- `GET /api/books/{id}/download` - Download purchased book

### User Endpoints
- `GET /api/user/profile` - User profile
- `PUT /api/user/profile` - Update profile
- `POST /api/user/register-device` - Register device
- `GET /api/user/purchased-books` - User's library

## 🔒 Security Features

### Backend Security
- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Comprehensive security headers
- Input validation with Marshmallow
- SQL injection prevention
- CORS protection

### Frontend Security
- Content Security Policy (CSP)
- XSS protection headers
- Secure cookie handling
- Input sanitization
- Authentication state management

### Infrastructure Security
- Non-root Docker containers
- Health checks for all services
- Network isolation
- Volume encryption support
- Secrets management

## 🏭 Production Deployment

### Docker Production Setup
1. **Update environment variables**:
   ```bash
   cp .env.docker .env
   # Edit .env with production values
   ```

2. **Use production Docker Compose**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Set up reverse proxy** (Nginx/Traefik)
4. **Configure SSL certificates**
5. **Set up monitoring and logging**

### Recommended Production Changes
- Use managed PostgreSQL (AWS RDS, Google Cloud SQL)
- Implement caching layer if needed (Redis, Memcached)
- Use CDN for static assets
- Implement proper logging and monitoring
- Set up automated backups
- Use secrets management (AWS Secrets Manager, etc.)

## 📊 Monitoring

### Health Checks
- `GET /api/health` - Backend health
- `GET /` - Frontend health
- Database connection monitoring


### Logging
- Application logs in JSON format
- Request/response logging
- Error tracking and alerting
- Performance monitoring

## 🧪 Testing

### Manual Testing
```bash
# Test API endpoints
curl http://localhost:5000/api/health

# Test frontend
curl http://localhost:3000

# Test database connection
docker-compose exec postgres psql -U bookvault_user -d bookvault -c "SELECT version();"
```

### Automated Testing
```bash
# Backend tests
cd ssdlc-backend
poetry run pytest

# Frontend tests
cd ssdlc-frontent
pnpm test
```

## 🔄 Backup and Recovery

### Database Backup
```bash
# Create backup
docker-compose exec postgres pg_dump -U bookvault_user bookvault > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U bookvault_user bookvault < backup.sql
```

### Volume Backup
```bash
# Backup volumes
docker run --rm -v bookvault_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres_backup.tar.gz /data
```

## 🛠️ Troubleshooting

### Common Issues

1. **Database connection failed**:
   ```bash
   docker-compose logs postgres
   docker-compose restart postgres
   ```

2. **Backend not starting**:
   ```bash
   docker-compose logs backend
   # Check environment variables
   ```

3. **Frontend build failed**:
   ```bash
   docker-compose logs frontend
   # Check Node.js version and dependencies
   ```

4. **Port conflicts**:
   ```bash
   # Change ports in docker-compose.yml
   # Or stop conflicting services
   ```

### Useful Commands
```bash
# View all logs
docker-compose logs -f

# Restart specific service
docker-compose restart <service-name>

# Rebuild and restart
docker-compose up -d --build <service-name>

# Clean up everything
docker-compose down -v
docker system prune -a
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the logs for error details