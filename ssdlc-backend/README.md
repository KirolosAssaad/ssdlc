# BookVault Backend API

A secure and scalable Flask-based REST API for the BookVault ebook store application. Built with modern Python practices, comprehensive security middleware, and modular architecture.

## Features

### 🔐 **Authentication & Security**
- JWT-based authentication with access and refresh tokens
- Password hashing using bcrypt
- Comprehensive security headers middleware
- CORS protection with configurable origins
- Request/response logging and monitoring
- Input validation using Marshmallow schemas

### 📚 **Book Management**
- Book catalog with search, filtering, and pagination
- Genre-based categorization
- Rating and review system
- Purchase tracking and download management
- File upload and storage capabilities

### 👤 **User Management**
- User registration and profile management
- Device registration (one device per user policy)
- Purchase history and library management
- Password change and account deletion
- Soft delete for data retention

### 🛡️ **Security Middleware**
- Automatic security headers injection
- Request ID tracking
- Response time monitoring
- Server information hiding
- Content Security Policy enforcement

## Technology Stack

- **Framework**: Flask 3.1.2
- **Database**: SQLAlchemy with SQLite (configurable)
- **Authentication**: Flask-JWT-Extended
- **Password Hashing**: Flask-Bcrypt
- **Validation**: Marshmallow
- **CORS**: Flask-CORS
- **Migration**: Flask-Migrate
- **Dependency Management**: Poetry

## Project Structure

```
ssdlc-backend/
├── app/
│   ├── __init__.py              # Application factory
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── security.py          # Security headers middleware
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py              # User model
│   │   ├── book.py              # Book model
│   │   └── purchase.py          # Purchase model
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── auth.py              # Authentication endpoints
│   │   ├── books.py             # Book management endpoints
│   │   └── users.py             # User management endpoints
│   └── utils/
│       ├── __init__.py
│       ├── decorators.py        # Custom decorators
│       ├── responses.py         # Response utilities
│       ├── error_handlers.py    # Global error handlers
│       └── seed_data.py         # Database seeding
├── config.py                    # Configuration classes
├── run.py                       # Application entry point
├── .env.example                 # Environment variables template
├── .env                         # Environment variables (local)
├── pyproject.toml              # Poetry configuration
└── README.md                   # This file
```

## Getting Started

### Prerequisites
- Python 3.9 or higher
- Poetry (recommended) or pip

### Installation with Poetry

1. **Clone and navigate to the backend directory:**
```bash
cd ssdlc-backend
```

2. **Install dependencies:**
```bash
poetry install
```

3. **Activate the virtual environment:**
```bash
poetry shell
```

4. **Copy environment variables:**
```bash
cp .env.example .env
```

5. **Configure environment variables in `.env`:**
```bash
# Update these values as needed
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///bookvault.db
CORS_ORIGINS=http://localhost:5173
```

6. **Initialize the database:**
```bash
flask init-db
```

7. **Seed the database with sample data:**
```bash
flask seed-db
```

8. **Run the development server:**
```bash
python run.py
```

The API will be available at `http://localhost:5000`

### Installation with pip

1. **Create and activate virtual environment:**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Follow steps 4-8 from Poetry installation**

## API Endpoints

### Authentication (`/api/auth`)
- `POST /login` - User login
- `POST /signup` - User registration
- `POST /forgot-password` - Password reset request
- `POST /refresh` - Refresh access token
- `POST /logout` - User logout
- `GET /me` - Get current user info

### Books (`/api/books`)
- `GET /` - Get books with filtering and pagination
- `GET /<book_id>` - Get specific book
- `GET /genres` - Get all available genres
- `GET /search` - Advanced book search
- `POST /purchase` - Purchase a book (requires auth)
- `GET /<book_id>/download` - Download purchased book (requires auth)

### Users (`/api/user`)
- `GET /profile` - Get user profile (requires auth)
- `PUT /profile` - Update user profile (requires auth)
- `GET /purchased-books` - Get purchased books (requires auth)
- `GET /purchases` - Get purchase history (requires auth)
- `POST /register-device` - Register device (requires auth)
- `DELETE /register-device` - Unregister device (requires auth)
- `PUT /change-password` - Change password (requires auth)
- `DELETE /account` - Delete account (requires auth)

## Security Features

### Security Headers
The middleware automatically adds these security headers to all responses:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: geolocation=(), microphone=(), camera=()`

### Request Monitoring
- Request ID tracking for debugging
- Response time measurement
- Comprehensive request/response logging
- Server information hiding

### Data Protection
- Password hashing with bcrypt
- JWT token-based authentication
- Input validation and sanitization
- SQL injection prevention through SQLAlchemy ORM
- CORS protection with configurable origins

## Database Models

### User Model
- Unique email-based authentication
- Device registration (one device policy)
- Purchase history tracking
- Soft delete capability

### Book Model
- Comprehensive book metadata
- Search and filtering capabilities
- Rating and review system
- File storage management

### Purchase Model
- Transaction tracking
- Download limit enforcement
- Payment method recording
- Status management (pending, completed, failed, refunded)

## Configuration

### Environment Variables
```bash
# Flask Configuration
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
FLASK_ENV=development
DEBUG=True

# Database Configuration
DATABASE_URL=sqlite:///bookvault.db

# CORS Configuration
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Email Configuration (for password reset)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password

# File Upload Configuration
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

# Rate Limiting (using memory storage)
RATELIMIT_STORAGE_URL=memory://

# Pagination
BOOKS_PER_PAGE=20
```

### Database Configuration
The application supports multiple database backends through SQLAlchemy:
- **Development**: SQLite (default)
- **Production**: PostgreSQL, MySQL, or other SQLAlchemy-supported databases

## CLI Commands

```bash
# Database management
flask init-db          # Initialize database tables
flask seed-db          # Seed with sample data
flask reset-db         # Reset database (drop and recreate)

# Development
python run.py          # Run development server
flask shell           # Open Flask shell with models loaded
```

## Testing

### Sample Data
The seeded database includes:
- 3 sample users (including admin)
- 8 sample books across different genres
- Sample purchases and device registrations

### Test Credentials
```
Email: john.doe@example.com
Password: password123

Email: jane.smith@example.com  
Password: password123

Email: admin@bookvault.com
Password: admin123
```

## Production Deployment

### Environment Setup
1. Set `FLASK_ENV=production`
2. Use a production database (PostgreSQL recommended)
3. Configure proper secret keys
4. Configure rate limiting (memory-based or external service)
5. Configure email service for password resets
6. Set up file storage (AWS S3, etc.)

### Security Considerations
- Use HTTPS in production
- Configure proper CORS origins
- Set up rate limiting (memory-based or external service)
- Monitor logs and implement alerting
- Regular security updates
- Database backups

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    // Validation errors (optional)
  }
}
```

## Contributing

1. Follow PEP 8 style guidelines
2. Add tests for new features
3. Update documentation
4. Use meaningful commit messages
5. Create feature branches for new development

## License

This project is part of the BookVault application suite.