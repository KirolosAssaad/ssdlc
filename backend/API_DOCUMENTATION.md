# Bookstore Backend API Documentation

## Table of Contents

1. [API Overview](#api-overview)
   - [Introduction](#introduction)
   - [Base URL](#base-url)
   - [Versioning](#versioning)
   - [Getting Started](#getting-started)

2. [Authentication & Authorization](#authentication--authorization)
   - [Auth0 OAuth2 Flow](#auth0-oauth2-flow)
   - [JWT Token Structure](#jwt-token-structure)
   - [Role-Based Access Control](#role-based-access-control)
   - [Authentication Examples](#authentication-examples)

3. [API Endpoints](#api-endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [Book Management Endpoints](#book-management-endpoints)
   - [Search and Filter Endpoints](#search-and-filter-endpoints)
   - [System Endpoints](#system-endpoints)

4. [Data Models & Schemas](#data-models--schemas)
   - [Authentication Models](#authentication-models)
   - [Book Models](#book-models)
   - [Purchase Models](#purchase-models)
   - [Response Models](#response-models)

5. [Validation Rules and Constraints](#validation-rules-and-constraints)
   - [Password Complexity Requirements](#password-complexity-requirements)
   - [Email Validation Rules](#email-validation-rules)
   - [Name Field Validation](#name-field-validation)
   - [Username and Email Uniqueness Constraints](#username-and-email-uniqueness-constraints)
   - [Validation Error Messages and HTTP Status Codes](#validation-error-messages-and-http-status-codes)

6. [Error Handling](#error-handling)
   - [HTTP Status Codes](#http-status-codes)
   - [Error Response Format](#error-response-format)
   - [Common Error Scenarios](#common-error-scenarios)
   - [Troubleshooting Guide](#troubleshooting-guide)

7. [Security & DRM](#security--drm)
   - [Book Access Authorization](#book-access-authorization)
   - [Ownership Verification](#ownership-verification)
   - [Secure File Path Handling](#secure-file-path-handling)
   - [Access Logging and Audit Trail](#access-logging-and-audit-trail)
   - [Security Best Practices](#security-best-practices)

8. [Security Best Practices for API Consumers](#security-best-practices-for-api-consumers)
   - [JWT Token Handling Best Practices](#jwt-token-handling-best-practices)
   - [Rate Limiting Considerations and Recommendations](#rate-limiting-considerations-and-recommendations)
   - [CORS Policy and Cross-Origin Request Handling](#cors-policy-and-cross-origin-request-handling)
   - [Security Headers and Their Purposes](#security-headers-and-their-purposes)
   - [API Security Checklist for Developers](#api-security-checklist-for-developers)

9. [Operational Guide](#operational-guide)
   - [Health Monitoring](#health-monitoring)
   - [Configuration](#configuration)
   - [Logging](#logging)
   - [Troubleshooting](#troubleshooting)

10. [Testing and Validation](#testing-and-validation)
   - [API Testing Strategies](#api-testing-strategies)
   - [Authentication Flow Testing](#authentication-flow-testing)
   - [DRM Testing Scenarios](#drm-testing-scenarios)
   - [Integration Testing Guidelines](#integration-testing-guidelines)
   - [API Validation Checklist](#api-validation-checklist)

---

## API Overview

### Introduction

The Bookstore Backend API is a comprehensive FastAPI-based service designed to provide secure book management functionality with integrated authentication and Digital Rights Management (DRM) protection. Built with modern Python technologies, this API serves as the backbone for a digital bookstore platform that enables users to discover, purchase, and securely access digital book content.

**System Purpose:**
The API facilitates a complete digital bookstore ecosystem where users can browse a catalog of books, make secure purchases, and access their owned content through DRM-protected mechanisms. The system ensures that only authorized users can access purchased content while maintaining comprehensive audit trails and security controls.

**Core Functionality:**
- **User Management**: Complete user lifecycle management with Auth0 OAuth2 integration
- **Book Catalog**: Comprehensive book browsing, searching, and metadata management
- **Purchase System**: Secure book purchasing with ownership tracking
- **DRM Protection**: Digital rights management ensuring secure content access
- **Role-Based Security**: Multi-tier access control (user, admin, sudo_admin)
- **Audit & Logging**: Complete activity tracking for security and compliance

**Technology Stack:**
- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL with SQLModel ORM
- **Authentication**: Auth0 OAuth2 with JWT tokens
- **Security**: Custom middleware for headers and DRM protection
- **Documentation**: Auto-generated OpenAPI/Swagger documentation

**Key Features:**
- Auth0 OAuth2 authentication integration with JWT token validation
- Role-based access control with granular permission management
- DRM-protected book file access with ownership verification
- Comprehensive book catalog management with search and filtering
- Purchase tracking and ownership verification system
- Advanced search capabilities by author, genre, and metadata
- Health monitoring and operational endpoints
- Comprehensive error handling and validation
- Security headers and CORS protection

### Base URL

The API is accessible through different base URLs depending on the deployment environment:

```
Development: http://localhost:8000
Production: https://api.bookstore.example.com (when deployed)
```

**Port Configuration:**
- Default development port: `8000`
- Configurable through environment variables or deployment settings
- Health check available at: `{BASE_URL}/health`

**SSL/TLS:**
- Development: HTTP (localhost only)
- Production: HTTPS required for all endpoints
- Auth0 callbacks require HTTPS in production environments

### Versioning

The API follows a pragmatic versioning approach designed for stability and backward compatibility:

**Current Versioning Strategy:**
- **Version**: v1 (implicit, no URL prefix required)
- **Approach**: Semantic versioning for breaking changes
- **Backward Compatibility**: Maintained within major versions
- **Future Versioning**: Will use URL prefixes (e.g., `/v2/`) for major version changes

**API Documentation Versions:**
- **Interactive Documentation**: Available at `/api/docs` (Swagger UI)
- **Alternative Documentation**: Available at `/api/redoc` (ReDoc format)
- **OpenAPI Schema**: Available at `/openapi.json`

**Version Management:**
- Non-breaking changes are deployed without version increments
- Breaking changes will introduce new versioned endpoints
- Deprecated endpoints will be marked and supported for transition periods
- Version information available in API responses headers

### Getting Started

Follow these steps to begin integrating with the Bookstore Backend API:

#### 1. Environment Setup

**Prerequisites:**
- Python 3.10 or higher
- Poetry package manager
- PostgreSQL database (for local development)
- Auth0 account and application configuration

**Local Development Setup:**
```bash
# Clone the repository and navigate to backend directory
cd backend

# Install Poetry (if not already installed)
pip install poetry

# Install project dependencies
poetry install

# Configure environment variables (see Configuration section)
cp .env.example .env
# Edit .env with your Auth0 and database credentials

# Start the development server
poetry run start
```

#### 2. Authentication Configuration

**Auth0 Setup Requirements:**
- Auth0 domain and client credentials
- Configured callback URLs for your environment
- Appropriate audience and scope settings
- JWKS endpoint access for token validation

**Required Environment Variables:**
```bash
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_DOMAIN=your_auth0_domain
AUTH0_AUDIENCE=your_auth0_audience
AUTH0_CALLBACK_URL=http://localhost:8000/auth/callback
```

#### 3. API Access and Testing

**Interactive Documentation:**
1. Start the development server: `poetry run start`
2. Navigate to `http://localhost:8000/api/docs`
3. Use the Swagger UI to explore and test endpoints
4. Authenticate using the Auth0 flow for protected endpoints

**Basic API Testing:**
```bash
# Health check (no authentication required)
curl http://localhost:8000/health

# Get public book catalog (no authentication required)
curl http://localhost:8000/books/

# Access protected endpoints (authentication required)
# First obtain a token through the Auth0 flow, then:
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     http://localhost:8000/books/my-books
```

#### 4. Integration Guidelines

**Request Headers:**
- `Content-Type: application/json` for POST/PUT requests
- `Authorization: Bearer {jwt_token}` for protected endpoints
- Standard HTTP headers for caching and content negotiation

**Response Format:**
- All responses use JSON format
- Consistent error response structure
- HTTP status codes follow REST conventions
- Pagination for list endpoints (when applicable)

**Rate Limiting:**
- Currently no rate limiting implemented
- Production deployments should implement appropriate rate limiting
- Monitor usage patterns and implement limits as needed

**Security Considerations:**
- Always use HTTPS in production environments
- Validate JWT tokens on every protected request
- Implement proper CORS policies for web applications
- Follow Auth0 security best practices for token handling

#### 5. Development Workflow

**Local Development:**
1. Use the interactive documentation for endpoint testing
2. Monitor logs for debugging information
3. Use the health endpoint to verify service status
4. Test authentication flows with Auth0 development settings

**Integration Testing:**
1. Test all authentication flows (login, token refresh, logout)
2. Verify role-based access control for different user types
3. Test DRM protection for book file access
4. Validate error handling for various scenarios

**Production Deployment:**
1. Configure production Auth0 settings
2. Set up proper database connections and migrations
3. Implement monitoring and logging solutions
4. Configure load balancing and scaling as needed

---

## Authentication & Authorization

The Bookstore Backend API uses Auth0 OAuth2 for authentication and implements a comprehensive role-based access control system. All protected endpoints require valid JWT tokens, and certain administrative functions require specific role permissions.

### Auth0 OAuth2 Flow

The API implements the OAuth2 Authorization Code flow with PKCE (Proof Key for Code Exchange) for secure authentication. This flow ensures that sensitive credentials are never exposed to client applications.

#### Step-by-Step OAuth2 Process

**1. Authentication Initiation**
- Client requests authorization URL from `/auth/sso` endpoint
- Server generates Auth0 authorization URL with required parameters
- Client redirects user to Auth0 login page

**2. User Authentication**
- User authenticates with Auth0 (login/signup)
- Auth0 redirects back to application with authorization code
- Authorization code is temporary and single-use

**3. Token Exchange**
- Client sends authorization code to `/auth/callback` endpoint
- Server exchanges code for access and refresh tokens
- Server validates tokens and retrieves user information

**4. Token Usage**
- Client includes access token in Authorization header for API requests
- Server validates JWT token on each protected endpoint request
- Token contains user identity and permissions information

#### OAuth2 Configuration

**Auth0 Settings:**
```
Domain: kahf-bookstore.us.auth0.com
Audience: {configured_audience}
Algorithms: RS256
JWKS URL: https://kahf-bookstore.us.auth0.com/.well-known/jwks.json
```

**Required Scopes:**
- `openid`: Basic OpenID Connect functionality
- `profile`: Access to user profile information
- `email`: Access to user email address
- `offline_access`: Refresh token capability
- `read:users`: Read user information (for role management)
- `read:roles`: Read role information
- `read:role_members`: Read role membership information

**Redirect URIs:**
- Development: `http://localhost:8000/auth/callback`
- Production: `https://your-domain.com/auth/callback`

### JWT Token Structure

The API uses JSON Web Tokens (JWT) with RS256 algorithm for secure authentication. Tokens are validated using Auth0's public keys retrieved from the JWKS endpoint.

#### Token Validation Process

**1. Token Extraction**
```
Authorization: Bearer {jwt_token}
```

**2. Signature Verification**
- Retrieve signing key from Auth0 JWKS endpoint
- Verify token signature using RS256 algorithm
- Ensure token hasn't been tampered with

**3. Claims Validation**
- **Issuer (iss)**: Must match `https://kahf-bookstore.us.auth0.com/`
- **Audience (aud)**: Must match configured API audience
- **Expiration (exp)**: Token must not be expired
- **Issued At (iat)**: Token must have valid issue time
- **Subject (sub)**: Contains unique user identifier

#### JWT Token Claims

**Standard Claims:**
```json
{
  "iss": "https://kahf-bookstore.us.auth0.com/",
  "sub": "auth0|user_unique_identifier",
  "aud": "your_api_audience",
  "iat": 1640995200,
  "exp": 1641081600,
  "azp": "your_client_id",
  "scope": "openid profile email offline_access read:users read:roles"
}
```

**Custom Claims (when applicable):**
- User roles and permissions are retrieved separately via Auth0 Management API
- Role information is cached in request state during authentication
- Additional user metadata can be included based on Auth0 configuration

#### Token Lifecycle Management

**Access Token:**
- **Lifetime**: Typically 24 hours (configurable in Auth0)
- **Usage**: Required for all protected API endpoints
- **Storage**: Should be stored securely in client application
- **Renewal**: Use refresh token to obtain new access token

**Refresh Token:**
- **Lifetime**: Longer-lived (configurable, typically 30 days)
- **Usage**: Used to obtain new access tokens without re-authentication
- **Security**: More sensitive, should be stored very securely
- **Rotation**: New refresh token may be issued with each refresh

### Role-Based Access Control

The API implements a three-tier role-based access control system that provides granular permissions for different user types and administrative functions.

#### Available Roles

**1. User (Default Role)**
- **Description**: Standard user with basic book access permissions
- **Permissions**:
  - Browse public book catalog
  - Purchase books
  - Access owned book content
  - View personal purchase history
  - Read owned books with DRM protection
- **Endpoints**: All user-facing book management endpoints
- **Role Name**: `user` (implicit, no explicit role assignment needed)

**2. Admin**
- **Description**: Administrative user with elevated permissions
- **Auth0 Role ID**: `rol_3rIPylnLOf4V0LHJ`
- **Permissions**:
  - All user permissions
  - Manage user roles (limited)
  - Access administrative endpoints
  - View system health and operational data
- **Endpoints**: Admin-specific endpoints plus all user endpoints
- **Role Name**: `admin`

**3. Sudo Admin (Super Administrator)**
- **Description**: Highest level administrative access
- **Auth0 Role ID**: `rol_Rse83znIx3ekyIHp`
- **Permissions**:
  - All admin permissions
  - Assign/modify user roles
  - Full system administration access
  - Access to all administrative functions
- **Endpoints**: All endpoints including role management
- **Role Name**: `sudo_admin`

#### Role Assignment Process

**Role Assignment Requirements:**
- Only `sudo_admin` users can assign roles to other users
- Role assignments are managed through Auth0 Management API
- Role changes take effect immediately upon assignment

**Role Assignment Endpoint:**
```
POST /auth/set-role/{user_id}
Authorization: Bearer {sudo_admin_jwt_token}
Content-Type: application/json

{
  "role": "admin" | "sudo_admin"
}
```

#### Role Verification Process

**1. Token Validation**
- Extract and validate JWT token
- Retrieve user ID from token claims

**2. Role Retrieval**
- Query Auth0 Management API for user roles
- Cache role information in request state
- Handle API rate limits and errors gracefully

**3. Permission Check**
- Compare required roles with user's assigned roles
- Allow access if user has any of the required roles
- Return 403 Forbidden if insufficient permissions

#### Endpoint Protection Patterns

**Public Endpoints (No Authentication Required):**
```python
@router.get("/books/")
async def get_books():
    # No authentication required
    pass
```

**Protected Endpoints (Authentication Required):**
```python
@router.get("/books/my-books")
@require_auth()
async def get_my_books(request: Request):
    # Valid JWT token required
    user_id = request.state.user_id
    pass
```

**Role-Protected Endpoints (Specific Roles Required):**
```python
@router.get("/auth/set-role/{user_id}")
@require_auth(required_roles=["sudo_admin"])
async def set_admin(user_id: str, role: str):
    # sudo_admin role required
    pass
```

### Authentication Examples

The following examples demonstrate how to authenticate with the API and use JWT tokens for accessing protected endpoints.

#### Complete Authentication Flow Example

**Step 1: Initiate OAuth2 Flow**
```http
GET /auth/sso HTTP/1.1
Host: localhost:8000
```

**Response:**
```json
{
  "auth_url": "https://kahf-bookstore.us.auth0.com/oauth2/authorize?response_type=code&client_id=your_client_id&redirect_uri=http%3A//localhost%3A8000/auth/callback&scope=openid+profile+email+offline_access+read%3Ausers+read%3Aroles+read%3Arole_members&audience=your_audience"
}
```

**Step 2: User Authentication (Browser Redirect)**
- Redirect user to the `auth_url` from Step 1
- User completes authentication with Auth0
- Auth0 redirects back with authorization code

**Step 3: Exchange Code for Tokens**
```http
GET /auth/callback?code=authorization_code_from_auth0 HTTP/1.1
Host: localhost:8000
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...",
  "refresh_token": "v1.MRqwjJosOaS9s...",
  "sub": "auth0|507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "email_verified": true,
  "picture": "https://s.gravatar.com/avatar/...",
  "roles": [
    {
      "id": "rol_3rIPylnLOf4V0LHJ",
      "name": "admin",
      "description": "Administrator role"
    }
  ]
}
```

#### Using Access Tokens for API Requests

**Accessing Protected User Endpoints:**
```http
GET /books/my-books HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...
```

**Response:**
```json
{
  "books": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "purchase_date": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Accessing Admin Endpoints:**
```http
GET /auth/roles/auth0|507f1f77bcf86cd799439011 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...
```

**Response:**
```json
{
  "user_id": "auth0|507f1f77bcf86cd799439011",
  "roles": [
    {
      "id": "rol_3rIPylnLOf4V0LHJ",
      "name": "admin",
      "description": "Administrator role"
    }
  ]
}
```

#### Token Refresh Example

**Refreshing Access Token:**
```http
GET /auth/refresh-token HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...",
  "refresh_token": "v1.MRqwjJosOaS9s..."
}
```

#### Error Handling Examples

**Invalid Token (401 Unauthorized):**
```http
GET /books/my-books HTTP/1.1
Host: localhost:8000
Authorization: Bearer invalid_token
```

**Response:**
```json
{
  "detail": "Invalid token"
}
```

**Insufficient Permissions (403 Forbidden):**
```http
GET /auth/set-role/auth0|507f1f77bcf86cd799439011 HTTP/1.1
Host: localhost:8000
Authorization: Bearer user_token_without_admin_role
```

**Response:**
```json
{
  "detail": "Insufficient permissions"
}
```

**Missing Authorization Header (401 Unauthorized):**
```http
GET /books/my-books HTTP/1.1
Host: localhost:8000
```

**Response:**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

#### Client Implementation Guidelines

**Token Storage Best Practices:**
```javascript
// Store tokens securely (example for web applications)
localStorage.setItem('access_token', response.access_token);
localStorage.setItem('refresh_token', response.refresh_token);

// Include token in API requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json'
};
```

**Automatic Token Refresh:**
```javascript
// Check token expiration and refresh if needed
async function makeAuthenticatedRequest(url, options = {}) {
  let token = localStorage.getItem('access_token');
  
  // Add token to request headers
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };
  
  let response = await fetch(url, options);
  
  // If token expired, refresh and retry
  if (response.status === 401) {
    await refreshToken();
    token = localStorage.getItem('access_token');
    options.headers['Authorization'] = `Bearer ${token}`;
    response = await fetch(url, options);
  }
  
  return response;
}
```

**Role-Based UI Control:**
```javascript
// Check user roles for UI display logic
function hasRole(requiredRole) {
  const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
  return userRoles.some(role => role.name === requiredRole);
}

// Show admin features only to admin users
if (hasRole('admin') || hasRole('sudo_admin')) {
  showAdminPanel();
}
```

---

## API Endpoints

### Authentication Endpoints

The authentication endpoints handle OAuth2 flows, token management, and role-based access control. These endpoints integrate with Auth0 to provide secure authentication and authorization services.

#### GET /auth/sso

**Method:** `GET`  
**URL:** `/auth/sso`  
**Authentication:** Not Required  
**Roles:** None

**Description:** Initiates the OAuth2 authentication flow by generating an Auth0 authorization URL. This endpoint creates the URL that clients should redirect users to for authentication with Auth0.

**Parameters:**
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None

**Request Example:**
```http
GET /auth/sso HTTP/1.1
Host: localhost:8000
Accept: application/json
User-Agent: BookstoreClient/1.0
```

**Response Examples:**

**Success (200):**
```json
{
  "auth_url": "https://kahf-bookstore.us.auth0.com/oauth2/authorize?response_type=code&client_id=AbCdEf123456789&redirect_uri=http%3A//localhost%3A8000/auth/callback&scope=openid+profile+email+offline_access+read%3Ausers+read%3Aroles+read%3Arole_members&audience=https%3A//bookstore-api.example.com&state=xyz789abc123"
}
```

**Error (500) - Configuration Error:**
```json
{
  "detail": "Auth0 configuration error. Please contact system administrator."
}
```

**Possible Status Codes:**
- `200 OK`: Successfully generated authorization URL
- `500 Internal Server Error`: Server configuration error

**Usage Notes:**
- The generated URL includes all necessary OAuth2 parameters
- Users should be redirected to the `auth_url` for authentication
- The URL includes scopes for profile access and role management
- Redirect URI is configured for the callback endpoint

---

#### GET /auth/callback

**Method:** `GET`  
**URL:** `/auth/callback`  
**Authentication:** Not Required (OAuth2 callback)  
**Roles:** None

**Description:** Handles the OAuth2 callback from Auth0 after user authentication. This endpoint exchanges the authorization code for access and refresh tokens, retrieves user information, and returns the complete authentication response.

**Parameters:**
- **Path Parameters:** None
- **Query Parameters:**
  - `code` (string, required): Authorization code returned by Auth0 after successful authentication
- **Request Body:** None

**Request Example:**
```http
GET /auth/callback?code=SplxlOBeZQQYbYS6WxSbIA&state=xyz789abc123 HTTP/1.1
Host: localhost:8000
Accept: application/json
User-Agent: BookstoreClient/1.0
```

**Response Examples:**

**Success (200) - Regular User:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2thaGYtYm9va3N0b3JlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MjM0NTY3ODkwYWJjZGVmIiwiYXVkIjoiaHR0cHM6Ly9ib29rc3RvcmUtYXBpLmV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMTIzNDU2LCJleHAiOjE3MDAyMDk4NTYsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwifQ.placeholder_signature_here",
  "refresh_token": "v1.MRqwjJosOaS9s8U2kQDXOgEAbbg8kSxIvnlNQVJoGnInpEIxqDT42Q_placeholder",
  "sub": "auth0|623456789abcdef",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "email_verified": true,
  "picture": "https://s.gravatar.com/avatar/def456abc789?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fja.png",
  "updated_at": "2024-11-16T08:15:30.000Z",
  "roles": []
}
```

**Success (200) - Admin User:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2thaGYtYm9va3N0b3JlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJhdWQiOiJodHRwczovL2Jvb2tzdG9yZS1hcGkuZXhhbXBsZS5jb20iLCJpYXQiOjE3MDAxMjM0NTYsImV4cCI6MTcwMDIwOTg1Niwic2NvcGUiOiJvcGVuaWQgcHJvZmlsZSBlbWFpbCByZWFkOnVzZXJzIHJlYWQ6cm9sZXMifQ.placeholder_signature_here",
  "refresh_token": "v1.AdminRefreshTokenPlaceholder123456789",
  "sub": "auth0|507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "email_verified": true,
  "picture": "https://s.gravatar.com/avatar/abc123def456?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fjo.png",
  "updated_at": "2024-11-16T10:30:00.000Z",
  "roles": [
    {
      "id": "rol_3rIPylnLOf4V0LHJ",
      "name": "admin",
      "description": "Administrator role with elevated permissions"
    }
  ]
}
```

**Success (200) - Super Admin User:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2thaGYtYm9va3N0b3JlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw3ODkwYWJjZGVmMTIzNDU2IiwiYXVkIjoiaHR0cHM6Ly9ib29rc3RvcmUtYXBpLmV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMTIzNDU2LCJleHAiOjE3MDAyMDk4NTYsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgcmVhZDp1c2VycyByZWFkOnJvbGVzIHJlYWQ6cm9sZV9tZW1iZXJzIn0.placeholder_signature_here",
  "refresh_token": "v1.SuperAdminRefreshTokenPlaceholder987654321",
  "sub": "auth0|7890abcdef123456",
  "name": "Alice Johnson",
  "email": "alice.johnson@bookstore.com",
  "email_verified": true,
  "picture": "https://s.gravatar.com/avatar/ghi789jkl012?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fal.png",
  "updated_at": "2024-11-16T09:45:15.000Z",
  "roles": [
    {
      "id": "rol_Rse83znIx3ekyIHp",
      "name": "sudo_admin",
      "description": "Super administrator with full system access"
    }
  ]
}
```

**Error (400):**
```json
{
  "detail": "Invalid authorization code"
}
```

**Error (401):**
```json
{
  "detail": "Authentication failed"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully exchanged code for tokens and retrieved user info
- `400 Bad Request`: Invalid or expired authorization code
- `401 Unauthorized`: Authentication failed with Auth0
- `500 Internal Server Error`: Token exchange or user info retrieval failed

**Usage Notes:**
- This endpoint is called automatically by Auth0 after user authentication
- The authorization code is single-use and expires quickly
- Response includes both access and refresh tokens for token management
- User roles are automatically retrieved and included in the response
- Store both tokens securely for subsequent API calls
- For role information, see [Role-Based Access Control](#role-based-access-control)
- For token security best practices, see [JWT Token Handling Best Practices](#jwt-token-handling-best-practices)

---

#### GET /auth/user

**Method:** `GET`  
**URL:** `/auth/user`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Retrieves current user information from Auth0 using the provided access token. This endpoint returns the user's profile data including name, email, and verification status.

**Parameters:**
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
GET /auth/user HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2thaGYtYm9va3N0b3JlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJhdWQiOiJodHRwczovL2Jvb2tzdG9yZS1hcGkuZXhhbXBsZS5jb20iLCJpYXQiOjE3MDAxMjM0NTYsImV4cCI6MTcwMDIwOTg1Nn0.placeholder_signature
Accept: application/json
User-Agent: BookstoreClient/1.0
```

**Response Examples:**

**Success (200) - Complete User Profile:**
```json
{
  "sub": "auth0|507f1f77bcf86cd799439011",
  "name": "John Doe",
  "given_name": "John",
  "family_name": "Doe",
  "middle_name": "Michael",
  "nickname": "john.doe",
  "preferred_username": "john.doe",
  "profile": "https://kahf-bookstore.us.auth0.com/u/john.doe",
  "picture": "https://s.gravatar.com/avatar/abc123def456?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fjo.png",
  "website": "https://johndoe.dev",
  "email": "john.doe@example.com",
  "email_verified": true,
  "gender": "male",
  "birthdate": "1990-05-15",
  "zoneinfo": "America/New_York",
  "locale": "en-US",
  "phone_number": "+1-555-123-4567",
  "phone_number_verified": true,
  "address": {
    "street_address": "123 Main St",
    "locality": "New York",
    "region": "NY",
    "postal_code": "10001",
    "country": "US"
  },
  "updated_at": "2024-11-16T10:30:00.000Z"
}
```

**Success (200) - Minimal User Profile:**
```json
{
  "sub": "auth0|623456789abcdef",
  "name": "Jane Smith",
  "given_name": "Jane",
  "family_name": "Smith",
  "middle_name": "",
  "nickname": "jane.smith",
  "preferred_username": "jane.smith",
  "profile": "",
  "picture": "https://s.gravatar.com/avatar/def456abc789?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fja.png",
  "website": "",
  "email": "jane.smith@example.com",
  "email_verified": true,
  "gender": "",
  "birthdate": "",
  "zoneinfo": "",
  "locale": "",
  "phone_number": "",
  "phone_number_verified": false,
  "address": {},
  "updated_at": "2024-11-16T08:15:30.000Z"
}
```

**Error (401) - Missing Header:**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Error (401) - Invalid Token Format:**
```json
{
  "detail": "Invalid token format. Expected 'Bearer <token>'"
}
```

**Error (401) - Expired Token:**
```json
{
  "detail": "Token has expired. Please refresh your token."
}
```

**Error (401) - Invalid Signature:**
```json
{
  "detail": "Invalid token signature"
}
```

**Error (500) - Auth0 Service Error:**
```json
{
  "detail": "Authentication service temporarily unavailable"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully retrieved user information
- `401 Unauthorized`: Missing, invalid, or expired access token
- `403 Forbidden`: Token valid but insufficient permissions (shouldn't occur for this endpoint)
- `500 Internal Server Error`: Failed to retrieve user info from Auth0

**Usage Notes:**
- Requires a valid JWT access token in the Authorization header
- Returns comprehensive user profile information from Auth0
- Use this endpoint to get current user details for profile display
- Token validation includes signature verification and expiration checks
- For token validation details, see [JWT Token Structure](#jwt-token-structure)
- For error handling information, see [Error Handling](#error-handling)

---

#### GET /auth/refresh-token

**Method:** `GET`  
**URL:** `/auth/refresh-token`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Refreshes the access token using the refresh token. This endpoint allows clients to obtain a new access token without requiring the user to re-authenticate, extending the session duration.

**Parameters:**
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required, even if expired)

**Request Example:**
```http
GET /auth/refresh-token HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...
```

**Response Examples:**

**Success (200):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ.eyJpc3MiOiJodHRwczovL2thaGYtYm9va3N0b3JlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJhdWQiOiJ5b3VyX2FwaV9hdWRpZW5jZSIsImlhdCI6MTY0MDk5NTIwMCwiZXhwIjoxNjQxMDgxNjAwfQ.new_signature",
  "refresh_token": "v1.NewRefreshTokenValue123456789"
}
```

**Error (401):**
```json
{
  "detail": "Invalid or expired refresh token"
}
```

**Error (400):**
```json
{
  "detail": "Refresh token not found in request state"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully refreshed access token
- `400 Bad Request`: Missing or invalid refresh token
- `401 Unauthorized`: Expired or revoked refresh token
- `500 Internal Server Error`: Token refresh failed with Auth0

**Usage Notes:**
- Use this endpoint when the access token expires (typically after 24 hours)
- The refresh token is automatically extracted from the request state during authentication
- Both new access and refresh tokens are returned
- Store the new tokens securely and replace the old ones
- Refresh tokens may be rotated (new refresh token provided)

---

#### GET /auth/set-role/{user_id}

**Method:** `GET`  
**URL:** `/auth/set-role/{user_id}`  
**Authentication:** Required  
**Roles:** `sudo_admin` only

**Description:** Assigns administrative roles to users. This endpoint allows super administrators to grant admin or sudo_admin roles to other users in the system.

**Parameters:**
- **Path Parameters:**
  - `user_id` (string, required): Auth0 user ID (format: "auth0|user_identifier")
- **Query Parameters:**
  - `role` (string, required): Role to assign ("admin" or "sudo_admin")
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {sudo_admin_access_token}` (required)

**Request Examples:**

**Assign Admin Role:**
```http
GET /auth/set-role/auth0|623456789abcdef?role=admin HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2thaGYtYm9va3N0b3JlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw3ODkwYWJjZGVmMTIzNDU2IiwiYXVkIjoiaHR0cHM6Ly9ib29rc3RvcmUtYXBpLmV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMTIzNDU2LCJleHAiOjE3MDAyMDk4NTZ9.placeholder_signature
Accept: application/json
User-Agent: BookstoreAdmin/1.0
```

**Assign Super Admin Role:**
```http
GET /auth/set-role/auth0|507f1f77bcf86cd799439011?role=sudo_admin HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.placeholder_super_admin_token
Accept: application/json
User-Agent: BookstoreAdmin/1.0
```

**Response Examples:**

**Success (200) - Admin Role Assigned:**
```json
{
  "detail": "User auth0|623456789abcdef has been assigned the admin role.",
  "user_id": "auth0|623456789abcdef",
  "role_assigned": "admin",
  "role_id": "rol_3rIPylnLOf4V0LHJ",
  "assigned_by": "auth0|7890abcdef123456",
  "assigned_at": "2024-11-16T15:30:45.123Z"
}
```

**Success (200) - Super Admin Role Assigned:**
```json
{
  "detail": "User auth0|507f1f77bcf86cd799439011 has been assigned the sudo_admin role.",
  "user_id": "auth0|507f1f77bcf86cd799439011",
  "role_assigned": "sudo_admin",
  "role_id": "rol_Rse83znIx3ekyIHp",
  "assigned_by": "auth0|7890abcdef123456",
  "assigned_at": "2024-11-16T15:35:12.456Z"
}
```

**Error (403):**
```json
{
  "detail": "Insufficient permissions"
}
```

**Error (400):**
```json
{
  "detail": "Invalid role specified. Must be 'admin' or 'sudo_admin'"
}
```

**Error (404):**
```json
{
  "detail": "User not found"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully assigned role to user
- `400 Bad Request`: Invalid role parameter or user ID format
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: User does not have sudo_admin role
- `404 Not Found`: User ID not found in Auth0
- `500 Internal Server Error`: Role assignment failed with Auth0

**Usage Notes:**
- Only users with `sudo_admin` role can assign roles to other users
- Valid roles are "admin" and "sudo_admin"
- Role assignments take effect immediately
- User ID must be in Auth0 format (e.g., "auth0|507f1f77bcf86cd799439011")
- Role IDs are mapped internally: admin (rol_3rIPylnLOf4V0LHJ), sudo_admin (rol_Rse83znIx3ekyIHp)

---

#### GET /auth/roles/{user_id}

**Method:** `GET`  
**URL:** `/auth/roles/{user_id}`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Retrieves the roles assigned to a specific user. This endpoint returns all roles associated with the specified user ID from Auth0.

**Parameters:**
- **Path Parameters:**
  - `user_id` (string, required): Auth0 user ID (format: "auth0|user_identifier")
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
GET /auth/roles/auth0|507f1f77bcf86cd799439011 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...
```

**Response Examples:**

**Success (200):**
```json
{
  "user_id": "auth0|507f1f77bcf86cd799439011",
  "roles": [
    {
      "id": "rol_3rIPylnLOf4V0LHJ",
      "name": "admin",
      "description": "Administrator role with elevated permissions"
    }
  ]
}
```

**Success (200) - User with no roles:**
```json
{
  "user_id": "auth0|507f1f77bcf86cd799439011",
  "roles": []
}
```

**Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Error (404):**
```json
{
  "detail": "User not found"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully retrieved user roles (empty array if no roles assigned)
- `401 Unauthorized`: Missing or invalid access token
- `404 Not Found`: User ID not found in Auth0
- `500 Internal Server Error`: Failed to retrieve roles from Auth0

**Usage Notes:**
- Any authenticated user can query roles for any user ID
- Returns empty array if user has no assigned roles
- Role information includes ID, name, and description
- User ID must be in Auth0 format (e.g., "auth0|507f1f77bcf86cd799439011")
- Use this endpoint to check permissions before displaying role-specific UI elements

---

### Book Management Endpoints

The book management endpoints provide comprehensive functionality for browsing, purchasing, and accessing digital books. These endpoints implement DRM (Digital Rights Management) protection to ensure that only authorized users can access purchased content.

#### GET /books/

**Method:** `GET`  
**URL:** `/books/`  
**Authentication:** Not Required  
**Roles:** None (Public endpoint)

**Description:** Retrieves the complete catalog of available books in the bookstore. This is a public endpoint that allows users to browse the book collection without authentication.

**Parameters:**
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None

**Request Example:**
```http
GET /books/ HTTP/1.1
Host: localhost:8000
Accept: application/json
User-Agent: BookstoreClient/1.0
```

**Response Examples:**

**Success (200) - Full Catalog:**
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream through the eyes of narrator Nick Carraway.",
    "genre": "Classic Literature"
  },
  {
    "id": 2,
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "description": "A gripping tale of racial injustice and childhood innocence in the American South, told through the perspective of young Scout Finch.",
    "genre": "Fiction"
  },
  {
    "id": 3,
    "title": "1984",
    "author": "George Orwell",
    "description": "A dystopian social science fiction novel about totalitarian control, surveillance, and the struggle for individual freedom.",
    "genre": "Science Fiction"
  },
  {
    "id": 4,
    "title": "Pride and Prejudice",
    "author": "Jane Austen",
    "description": "A romantic novel that critiques the British landed gentry at the end of the 18th century through the relationship between Elizabeth Bennet and Mr. Darcy.",
    "genre": "Romance"
  },
  {
    "id": 5,
    "title": "The Catcher in the Rye",
    "author": "J.D. Salinger",
    "description": "A controversial coming-of-age story following teenager Holden Caulfield's experiences in New York City.",
    "genre": "Fiction"
  },
  {
    "id": 6,
    "title": "Dune",
    "author": "Frank Herbert",
    "description": "An epic science fiction novel set in the distant future amidst a feudal interstellar society.",
    "genre": "Science Fiction"
  }
]
```

**Success (200) - Empty Catalog:**
```json
[]
```

**Error (500) - Database Error:**
```json
{
  "detail": "Unable to retrieve book catalog. Please try again later."
}
```

**Possible Status Codes:**
- `200 OK`: Successfully retrieved book catalog
- `500 Internal Server Error`: Database connection or server error

**Usage Notes:**
- Returns all books available in the store regardless of purchase status
- No pagination implemented (returns complete catalog)
- Book descriptions may be empty for some books
- Use this endpoint for displaying the main book catalog to users

---

#### GET /books/{book_id}

**Method:** `GET`  
**URL:** `/books/{book_id}`  
**Authentication:** Not Required  
**Roles:** None (Public endpoint)

**Description:** Retrieves detailed information about a specific book by its ID. This public endpoint allows users to view book details without authentication.

**Parameters:**
- **Path Parameters:**
  - `book_id` (integer, required): Unique identifier of the book
- **Query Parameters:** None
- **Request Body:** None

**Request Example:**
```http
GET /books/1 HTTP/1.1
Host: localhost:8000
```

**Response Examples:**

**Success (200):**
```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "description": "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream through the eyes of narrator Nick Carraway.",
  "genre": "Classic Literature"
}
```

**Error (404):**
```json
{
  "detail": "Book not found"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully retrieved book details
- `404 Not Found`: Book with specified ID does not exist
- `500 Internal Server Error`: Database connection or server error

**Usage Notes:**
- Returns detailed information for a single book
- Book ID must be a valid integer
- Author field may be "Unknown" if not specified in database
- Description field may be empty string if not provided

---

#### GET /books/my-books

**Method:** `GET`  
**URL:** `/books/my-books`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Retrieves all books that the authenticated user owns (has purchased). This endpoint returns only books that the user has access to read through the DRM system.

**Parameters:**
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
GET /books/my-books HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2thaGYtYm9va3N0b3JlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MjM0NTY3ODkwYWJjZGVmIiwiYXVkIjoiaHR0cHM6Ly9ib29rc3RvcmUtYXBpLmV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMTIzNDU2LCJleHAiOjE3MDAyMDk4NTZ9.placeholder_signature
Accept: application/json
User-Agent: BookstoreClient/1.0
```

**Response Examples:**

**Success (200) - Multiple Owned Books:**
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream through the eyes of narrator Nick Carraway.",
    "genre": "Classic Literature",
    "purchase_date": "2024-11-16T14:30:25.123Z",
    "purchase_id": 42
  },
  {
    "id": 3,
    "title": "1984",
    "author": "George Orwell",
    "description": "A dystopian social science fiction novel about totalitarian control, surveillance, and the struggle for individual freedom.",
    "genre": "Science Fiction",
    "purchase_date": "2024-11-10T09:15:30.456Z",
    "purchase_id": 38
  },
  {
    "id": 6,
    "title": "Dune",
    "author": "Frank Herbert",
    "description": "An epic science fiction novel set in the distant future amidst a feudal interstellar society.",
    "genre": "Science Fiction",
    "purchase_date": "2024-11-05T16:45:12.789Z",
    "purchase_id": 35
  }
]
```

**Success (200) - Single Owned Book:**
```json
[
  {
    "id": 4,
    "title": "Pride and Prejudice",
    "author": "Jane Austen",
    "description": "A romantic novel that critiques the British landed gentry at the end of the 18th century through the relationship between Elizabeth Bennet and Mr. Darcy.",
    "genre": "Romance",
    "purchase_date": "2024-11-16T10:20:15.321Z",
    "purchase_id": 41
  }
]
```

**Success (200) - No owned books:**
```json
[]
```

**Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully retrieved user's owned books (empty array if no books owned)
- `401 Unauthorized`: Missing, invalid, or expired access token
- `500 Internal Server Error`: Database error or failed to retrieve user books

**Usage Notes:**
- Only returns books that the user has purchased and owns
- Empty array returned if user has not purchased any books
- Books are filtered based on purchase records in the database
- Use this endpoint to display a user's personal library

---

#### GET /books/my-purchases

**Method:** `GET`  
**URL:** `/books/my-purchases`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Retrieves the complete purchase history for the authenticated user, including purchase dates and book details. This endpoint provides a detailed transaction history.

**Parameters:**
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
GET /books/my-purchases HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2thaGYtYm9va3N0b3JlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MjM0NTY3ODkwYWJjZGVmIiwiYXVkIjoiaHR0cHM6Ly9ib29rc3RvcmUtYXBpLmV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMTIzNDU2LCJleHAiOjE3MDAyMDk4NTZ9.placeholder_signature
Accept: application/json
User-Agent: BookstoreClient/1.0
```

**Response Examples:**

**Success (200) - Complete Purchase History:**
```json
[
  {
    "purchase_id": 42,
    "book_id": 1,
    "book_title": "The Great Gatsby",
    "book_author": "F. Scott Fitzgerald",
    "book_genre": "Classic Literature",
    "purchase_price": 12.99,
    "purchased_at": "2024-11-16T14:30:25.123Z"
  },
  {
    "purchase_id": 38,
    "book_id": 3,
    "book_title": "1984",
    "book_author": "George Orwell",
    "book_genre": "Science Fiction",
    "purchase_price": 10.99,
    "purchased_at": "2024-11-10T09:15:30.456Z"
  },
  {
    "purchase_id": 35,
    "book_id": 6,
    "book_title": "Dune",
    "book_author": "Frank Herbert",
    "book_genre": "Science Fiction",
    "purchase_price": 15.99,
    "purchased_at": "2024-11-05T16:45:12.789Z"
  },
  {
    "purchase_id": 41,
    "book_id": 4,
    "book_title": "Pride and Prejudice",
    "book_author": "Jane Austen",
    "book_genre": "Romance",
    "purchase_price": 8.99,
    "purchased_at": "2024-11-16T10:20:15.321Z"
  }
]
```

**Success (200) - Recent Purchase Only:**
```json
[
  {
    "purchase_id": 45,
    "book_id": 2,
    "book_title": "To Kill a Mockingbird",
    "book_author": "Harper Lee",
    "book_genre": "Fiction",
    "purchase_price": 11.99,
    "purchased_at": "2024-11-16T16:20:30.654Z"
  }
]
```

**Success (200) - No purchases:**
```json
[]
```

**Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully retrieved purchase history (empty array if no purchases)
- `401 Unauthorized`: Missing, invalid, or expired access token
- `500 Internal Server Error`: Database error or failed to retrieve purchases

**Usage Notes:**
- Returns complete purchase history with timestamps
- Includes both purchase metadata and book details
- Purchase dates are in ISO 8601 format with timezone
- Use this endpoint for displaying purchase history and receipts
- Purchase IDs can be used for customer service and refund processing

---

#### POST /books/purchase/{book_id}

**Method:** `POST`  
**URL:** `/books/purchase/{book_id}`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Purchases a book for the authenticated user, granting them access to read the book content. In a production environment, this endpoint would be called after successful payment processing.

**Parameters:**
- **Path Parameters:**
  - `book_id` (integer, required): Unique identifier of the book to purchase
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
POST /books/purchase/1 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2thaGYtYm9va3N0b3JlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MjM0NTY3ODkwYWJjZGVmIiwiYXVkIjoiaHR0cHM6Ly9ib29rc3RvcmUtYXBpLmV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMTIzNDU2LCJleHAiOjE3MDAyMDk4NTZ9.placeholder_signature
Accept: application/json
Content-Type: application/json
User-Agent: BookstoreClient/1.0
```

**Response Examples:**

**Success (200) - First Purchase:**
```json
{
  "status": "success",
  "message": "Successfully purchased 'The Great Gatsby'",
  "book_id": 1,
  "book_title": "The Great Gatsby",
  "purchase_id": 15,
  "purchase_date": "2024-11-16T14:30:25.123Z",
  "user_id": "auth0|623456789abcdef"
}
```

**Success (200) - Science Fiction Purchase:**
```json
{
  "status": "success",
  "message": "Successfully purchased 'Dune'",
  "book_id": 6,
  "book_title": "Dune",
  "purchase_id": 42,
  "purchase_date": "2024-11-16T15:45:10.456Z",
  "user_id": "auth0|623456789abcdef"
}
```

**Error (404):**
```json
{
  "detail": "Book not found"
}
```

**Error (400):**
```json
{
  "detail": "Book already purchased by user"
}
```

**Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully purchased book and granted access
- `400 Bad Request`: Book already owned by user or invalid book ID
- `401 Unauthorized`: Missing, invalid, or expired access token
- `404 Not Found`: Book with specified ID does not exist
- `500 Internal Server Error`: Database error or purchase processing failed

**Usage Notes:**
- Creates a purchase record linking the user to the book
- Duplicate purchases are prevented by unique constraint (user_id, book_id)
- Purchase grants immediate access to book content via DRM system
- In production, integrate with payment processing before calling this endpoint
- Purchase ID can be used for tracking and customer service

---

#### GET /books/read/{book_id}

**Method:** `GET`  
**URL:** `/books/read/{book_id}`  
**Authentication:** Required  
**Roles:** Any authenticated user (with book ownership)

**Description:** Downloads or streams the book file content with DRM protection. This endpoint verifies that the user owns the book before serving the file, implementing digital rights management.

**Parameters:**
- **Path Parameters:**
  - `book_id` (integer, required): Unique identifier of the book to read
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
GET /books/read/1 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2thaGYtYm9va3N0b3JlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MjM0NTY3ODkwYWJjZGVmIiwiYXVkIjoiaHR0cHM6Ly9ib29rc3RvcmUtYXBpLmV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMTIzNDU2LCJleHAiOjE3MDAyMDk4NTZ9.placeholder_signature
Accept: application/pdf, application/octet-stream
User-Agent: BookstoreClient/1.0
```

**Response Examples:**

**Success (200) - PDF Book:**
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="the-great-gatsby.pdf"
Content-Length: 2048576
Cache-Control: private, no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY

%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
[Binary PDF file content continues...]
```

**Success (200) - EPUB Book:**
```
HTTP/1.1 200 OK
Content-Type: application/epub+zip
Content-Disposition: attachment; filename="dune.epub"
Content-Length: 1536000
Cache-Control: private, no-cache
X-Content-Type-Options: nosniff
X-Frame-Options: DENY

PK[Binary EPUB file content...]
```

**Error (403):**
```json
{
  "detail": "Access Denied: Purchase required to access this book."
}
```

**Error (404):**
```json
{
  "detail": "Book not found"
}
```

**Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Error (500):**
```json
{
  "detail": "Book file is missing from server."
}
```

**Possible Status Codes:**
- `200 OK`: Successfully authorized and serving book file
- `401 Unauthorized`: Missing, invalid, or expired access token
- `403 Forbidden`: User does not own the book (DRM protection activated)
- `404 Not Found`: Book with specified ID does not exist
- `500 Internal Server Error`: Book file missing from server or DRM check failed

**Usage Notes:**
- **DRM Protection**: Verifies book ownership before serving file
- **Security**: Prevents path traversal attacks through secure file path handling
- **File Format**: Currently serves PDF files with appropriate MIME type
- **Access Logging**: All access attempts are logged for audit purposes
- **Ownership Verification**: Checks purchase records in database before file access
- Use this endpoint in e-reader applications or download managers
- Files are served with appropriate headers for browser download/display
- For detailed DRM information, see [Security & DRM](#security--drm)
- For ownership verification process, see [Ownership Verification](#ownership-verification)

---

#### GET /books/check-ownership/{book_id}

**Method:** `GET`  
**URL:** `/books/check-ownership/{book_id}`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Verifies whether the authenticated user owns a specific book without attempting to access the file content. This endpoint is useful for UI logic and access control decisions.

**Parameters:**
- **Path Parameters:**
  - `book_id` (integer, required): Unique identifier of the book to check
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
GET /books/check-ownership/1 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...
```

**Response Examples:**

**Success (200) - User owns book:**
```json
{
  "user_id": "auth0|623456789abcdef",
  "book_id": 1,
  "book_title": "The Great Gatsby",
  "owns_book": true,
  "purchase_date": "2024-11-16T14:30:25.123Z",
  "purchase_id": 42
}
```

**Success (200) - User does not own book:**
```json
{
  "user_id": "auth0|623456789abcdef",
  "book_id": 2,
  "book_title": "To Kill a Mockingbird",
  "owns_book": false
}
```

**Success (200) - Non-existent book:**
```json
{
  "user_id": "auth0|623456789abcdef",
  "book_id": 999,
  "book_title": null,
  "owns_book": false
}
```

**Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully checked ownership status
- `401 Unauthorized`: Missing, invalid, or expired access token
- `500 Internal Server Error`: Database error during ownership check

**Usage Notes:**
- Returns ownership status without accessing book files
- Use for UI logic (showing "Read" vs "Purchase" buttons)
- Lightweight alternative to attempting file access
- Does not verify that book exists (returns false for non-existent books)
- Useful for batch ownership checks in user interfaces
- Response includes user ID for verification and audit purposes

---

### Search and Filter Endpoints

The search and filter endpoints provide advanced book discovery functionality, allowing users to find books by various criteria including title, author, and genre. These endpoints also provide metadata endpoints to retrieve available authors and genres for filtering purposes.

#### GET /books/search

**Method:** `GET`  
**URL:** `/books/search`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Searches for books by title or author using a text query. The search performs case-insensitive partial matching against both book titles and author names, returning all books that contain the search query in either field.

**Parameters:**
- **Path Parameters:** None
- **Query Parameters:**
  - `query` (string, required): Search term to match against book titles and author names
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
GET /books/search?query=gatsby HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2thaGYtYm9va3N0b3JlLnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJhdXRoMHw2MjM0NTY3ODkwYWJjZGVmIiwiYXVkIjoiaHR0cHM6Ly9ib29rc3RvcmUtYXBpLmV4YW1wbGUuY29tIiwiaWF0IjoxNzAwMTIzNDU2LCJleHAiOjE3MDAyMDk4NTZ9.placeholder_signature
Accept: application/json
User-Agent: BookstoreClient/1.0
```

**Additional Request Examples:**

**Search by Author:**
```http
GET /books/search?query=orwell HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.placeholder_token
Accept: application/json
```

**Search by Genre:**
```http
GET /books/search?query=science%20fiction HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkFCQ0RFRjEyMzQ1NiJ9.placeholder_token
Accept: application/json
```

**Response Examples:**

**Success (200) - Title Match:**
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream through the eyes of narrator Nick Carraway.",
    "genre": "Classic Literature"
  }
]
```

**Success (200) - Author Match:**
```json
[
  {
    "id": 3,
    "title": "1984",
    "author": "George Orwell",
    "description": "A dystopian social science fiction novel about totalitarian control, surveillance, and the struggle for individual freedom.",
    "genre": "Science Fiction"
  },
  {
    "id": 7,
    "title": "Animal Farm",
    "author": "George Orwell",
    "description": "An allegorical novella about farm animals who rebel against their human farmer, hoping to create a society where animals can be equal, free, and happy.",
    "genre": "Political Satire"
  }
]
```

**Success (200) - Multiple Matches:**
```json
[
  {
    "id": 3,
    "title": "1984",
    "author": "George Orwell",
    "description": "A dystopian social science fiction novel about totalitarian control, surveillance, and the struggle for individual freedom.",
    "genre": "Science Fiction"
  },
  {
    "id": 6,
    "title": "Dune",
    "author": "Frank Herbert",
    "description": "An epic science fiction novel set in the distant future amidst a feudal interstellar society.",
    "genre": "Science Fiction"
  }
]
```

**Error (400) - Missing Query:**
```json
{
  "detail": "Search query parameter is required"
}
```

**Error (400) - Empty Query:**
```json
{
  "detail": "Search query cannot be empty"
}
```

**Success (200) - No matches:**
```json
[]
```

**Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully performed search (returns empty array if no matches)
- `400 Bad Request`: Missing required query parameter
- `401 Unauthorized`: Missing, invalid, or expired access token
- `500 Internal Server Error`: Database error during search

**Usage Notes:**
- Search is case-insensitive and performs partial matching
- Searches both title and author fields simultaneously
- Returns books that match the query in either title or author
- Empty query parameter will return validation error
- Use URL encoding for special characters in search queries
- Results are not paginated (returns all matching books)

---

#### GET /books/filter/author/{author_name}

**Method:** `GET`  
**URL:** `/books/filter/author/{author_name}`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Filters books by author name using case-insensitive partial matching. Returns all books where the author field contains the specified author name.

**Parameters:**
- **Path Parameters:**
  - `author_name` (string, required): Author name to filter by (supports partial matching)
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
GET /books/filter/author/fitzgerald HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...
```

**Response Examples:**

**Success (200):**
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
    "genre": "Classic Literature"
  },
  {
    "id": 3,
    "title": "This Side of Paradise",
    "author": "F. Scott Fitzgerald",
    "description": "Fitzgerald's debut novel about a young man's coming of age in early 20th century America.",
    "genre": "Classic Literature"
  }
]
```

**Success (200) - No matches:**
```json
[]
```

**Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully filtered books by author (returns empty array if no matches)
- `401 Unauthorized`: Missing, invalid, or expired access token
- `500 Internal Server Error`: Database error during filtering

**Usage Notes:**
- Filtering is case-insensitive and supports partial matching
- Only searches the author field
- Books with null/empty author fields are excluded from results
- Use URL encoding for special characters in author names
- Results include all books by authors whose names contain the filter term
- Results are not paginated (returns all matching books)

---

#### GET /books/filter/genre/{genre_name}

**Method:** `GET`  
**URL:** `/books/filter/genre/{genre_name}`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Filters books by genre using case-insensitive partial matching. Returns all books where the genre field contains the specified genre name.

**Parameters:**
- **Path Parameters:**
  - `genre_name` (string, required): Genre name to filter by (supports partial matching)
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
GET /books/filter/genre/fiction HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...
```

**Response Examples:**

**Success (200):**
```json
[
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "description": "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
    "genre": "Classic Literature"
  },
  {
    "id": 2,
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "description": "A gripping tale of racial injustice and childhood innocence in the American South.",
    "genre": "Fiction"
  }
]
```

**Success (200) - No matches:**
```json
[]
```

**Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully filtered books by genre (returns empty array if no matches)
- `401 Unauthorized`: Missing, invalid, or expired access token
- `500 Internal Server Error`: Database error during filtering

**Usage Notes:**
- Filtering is case-insensitive and supports partial matching
- Only searches the genre field
- Books with null/empty genre fields are excluded from results
- Use URL encoding for special characters in genre names
- Results include all books in genres that contain the filter term
- Results are not paginated (returns all matching books)

---

#### GET /books/genre

**Method:** `GET`  
**URL:** `/books/genre`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Retrieves a list of all unique genres available in the bookstore. This endpoint provides metadata for building genre filter interfaces and discovering available book categories.

**Parameters:**
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
GET /books/genre HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...
```

**Response Examples:**

**Success (200):**
```json
[
  "Fiction",
  "Classic Literature",
  "Science Fiction",
  "Mystery",
  "Romance",
  "Non-Fiction",
  "Biography",
  "History"
]
```

**Success (200) - No genres:**
```json
[]
```

**Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully retrieved genre list (returns empty array if no genres)
- `401 Unauthorized`: Missing, invalid, or expired access token
- `500 Internal Server Error`: Database error during genre retrieval

**Usage Notes:**
- Returns only unique genre values from the book catalog
- Excludes books with null or empty genre fields
- Genres are returned as a simple array of strings
- Use this endpoint to populate genre filter dropdowns or category lists
- Results are not sorted (order may vary between requests)
- Genre names are returned exactly as stored in the database

---

#### GET /books/author

**Method:** `GET`  
**URL:** `/books/author`  
**Authentication:** Required  
**Roles:** Any authenticated user

**Description:** Retrieves a list of all unique authors available in the bookstore. This endpoint provides metadata for building author filter interfaces and discovering available authors.

**Parameters:**
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None
- **Headers:**
  - `Authorization: Bearer {access_token}` (required)

**Request Example:**
```http
GET /books/author HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...
```

**Response Examples:**

**Success (200):**
```json
[
  "F. Scott Fitzgerald",
  "Harper Lee",
  "George Orwell",
  "Jane Austen",
  "Mark Twain",
  "Ernest Hemingway",
  "Virginia Woolf",
  "Charles Dickens"
]
```

**Success (200) - No authors:**
```json
[]
```

**Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Possible Status Codes:**
- `200 OK`: Successfully retrieved author list (returns empty array if no authors)
- `401 Unauthorized`: Missing, invalid, or expired access token
- `500 Internal Server Error`: Database error during author retrieval

**Usage Notes:**
- Returns only unique author values from the book catalog
- Excludes books with null or empty author fields
- Authors are returned as a simple array of strings
- Use this endpoint to populate author filter dropdowns or author lists
- Results are not sorted (order may vary between requests)
- Author names are returned exactly as stored in the database

---

### System Endpoints

The system endpoints provide operational and monitoring functionality for the API service. These endpoints are used for health checks, system status monitoring, and administrative purposes.

#### GET /health

**Method:** `GET`  
**URL:** `/health`  
**Authentication:** Not Required  
**Roles:** None

**Description:** Returns the current health status of the API service, including basic system information and service availability status.

**Parameters:**
- **Path Parameters:** None
- **Query Parameters:** None
- **Request Body:** None

**Request Example:**
```http
GET /health HTTP/1.1
Host: localhost:8000
Accept: application/json
User-Agent: HealthCheck/1.0
```

**Response Examples:**

**Success (200) - Healthy Service:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-16T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": "2 days, 14 hours, 23 minutes",
  "database": "connected",
  "auth0": "accessible"
}
```

**Success (200) - Service with Warnings:**
```json
{
  "status": "degraded",
  "timestamp": "2024-11-16T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": "1 day, 5 hours, 12 minutes",
  "database": "connected",
  "auth0": "slow_response",
  "warnings": [
    "Auth0 response time above threshold"
  ]
}
```

**Error (503) - Service Unavailable:**
```json
{
  "status": "unhealthy",
  "timestamp": "2024-11-16T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": "3 hours, 45 minutes",
  "database": "disconnected",
  "auth0": "accessible",
  "errors": [
    "Database connection failed"
  ]
}
```

**Possible Status Codes:**
- `200 OK`: Service is healthy or degraded but functional
- `503 Service Unavailable`: Service is unhealthy or critical components are failing

**Usage Notes:**
- This endpoint is used by load balancers and monitoring systems
- Response includes dependency status (database, Auth0)
- No authentication required for basic health monitoring
- Use for automated health checks and service discovery
- Response time should be monitored as part of service health

---

## Data Models & Schemas

This section provides comprehensive documentation of all data models used in the Bookstore Backend API, including request/response schemas, validation rules, and database constraints.

### Authentication Models

#### UserCreate

**Description:** Request model for user registration. Used when creating new user accounts through the authentication system.

**Fields:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| first_name | string | Yes | Alphanumeric only, max 255 chars | User's first name. Only letters and numbers allowed |
| last_name | string | Yes | Alphanumeric only, max 255 chars | User's last name. Only letters and numbers allowed |
| username | string | Yes | Unique, max 255 chars | Unique username for the account |
| email | string | Yes | Valid email format, unique, max 255 chars | User's email address for authentication |
| password | string | Yes | Complex password requirements | User's password meeting security criteria |

**Validation Rules:**
- **first_name**: Must contain only alphanumeric characters (letters and numbers). No spaces, special characters, or symbols allowed
- **last_name**: Must contain only alphanumeric characters (letters and numbers). No spaces, special characters, or symbols allowed
- **username**: Must be unique across all users in the system
- **email**: Must match email regex pattern `^[\w\.-]+@[\w\.-]+\.\w+$` and be unique across all users
- **password**: Must meet complex requirements:
  - Minimum 10 characters long
  - At least one uppercase letter (A-Z)
  - At least one lowercase letter (a-z)
  - At least three digits (0-9)
  - At least one special character (@$!%*?&)
  - Regex pattern: `^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){3,})(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$`

**Validation Error Scenarios:**
- **Invalid first_name**: Returns 400 with "Invalid characters in first name field."
- **Invalid last_name**: Returns 400 with "Invalid characters in last name field."
- **Invalid email**: Returns 400 with "Invalid email address."
- **Weak password**: Returns 400 with "Password must be at least 10 characters long, contain at least one uppercase letter, one lowercase letter, three digits, and one special character."
- **Duplicate username**: Returns 400 with "Username already exists."
- **Duplicate email**: Returns 400 with "Email already exists."

**Valid Examples:**

**Basic User Registration:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "username": "johndoe123",
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**User with Numbers in Name:**
```json
{
  "first_name": "Jane2",
  "last_name": "Smith3",
  "username": "janesmith456",
  "email": "jane.smith@bookstore.com",
  "password": "MyStrongPwd789@"
}
```

**Complex Password Example:**
```json
{
  "first_name": "Alice",
  "last_name": "Johnson",
  "username": "alicejohnson",
  "email": "alice.johnson@university.edu",
  "password": "ComplexPassword456$"
}
```

**Invalid Examples:**

**Invalid Name Characters:**
```json
{
  "first_name": "John-Paul",
  "last_name": "O'Connor",
  "username": "johnpaul",
  "email": "john.paul@example.com",
  "password": "ValidPassword123!"
}
```
*Error: Names contain special characters (hyphen and apostrophe)*

**Weak Password:**
```json
{
  "first_name": "Bob",
  "last_name": "Wilson",
  "username": "bobwilson",
  "email": "bob.wilson@example.com",
  "password": "password123"
}
```
*Error: Password missing uppercase letter and special character*

**Invalid Email:**
```json
{
  "first_name": "Carol",
  "last_name": "Brown",
  "username": "carolbrown",
  "email": "carol.brown.invalid",
  "password": "StrongPassword456!"
}
```
*Error: Email missing @ symbol and domain extension*

**Related Models:**
- Links to User database model for storage
- Used in user registration endpoints

### Book Models

#### Book

**Description:** Database model representing books available in the bookstore catalog. Contains all book metadata and file information.

**Fields:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | integer | Yes | Primary key, auto-increment | Unique identifier for the book |
| title | string | Yes | Max 255 chars, indexed | Book title for display and search |
| author | string | No | Max 255 chars | Book author name (optional) |
| description | text | No | Unlimited length | Detailed book description (optional) |
| genre | string | No | Max 100 chars | Book genre/category (optional) |
| filepath | string | Yes | Max 500 chars | Internal file path for book content |
| created_at | datetime | Yes | Auto-generated | Timestamp when book was added |
| updated_at | datetime | No | Auto-updated | Timestamp of last modification |

**Database Constraints:**
- **Primary Key**: `id` field with auto-increment
- **Indexes**: `title` field is indexed for search performance
- **Not Null**: `id`, `title`, `filepath`, `created_at` are required
- **File Path**: Must be a valid file path within the server's book directory

**Validation Rules:**
- **title**: Cannot be empty or null, maximum 255 characters
- **filepath**: Must be a valid file path, cannot be empty, maximum 500 characters
- **author**: Optional field, maximum 255 characters if provided
- **genre**: Optional field, maximum 100 characters if provided
- **description**: Optional field, no length limit

**Example:**
```json
{
  "id": 1,
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "description": "A classic American novel set in the Jazz Age, exploring themes of wealth, love, and the American Dream.",
  "genre": "Classic Literature",
  "filepath": "/books/the-great-gatsby.pdf",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

**Related Models:**
- Referenced by Purchase model through foreign key relationship
- Used in all book-related API responses

### Purchase Models

#### Purchase

**Description:** Database model representing user ownership of books. Tracks which users have purchased which books using Auth0 user IDs.

**Fields:**
| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| id | integer | Yes | Primary key, auto-increment | Unique identifier for the purchase |
| user_id | string | Yes | Max 255 chars, indexed | Auth0 user ID of the purchaser |
| book_id | integer | Yes | Foreign key to books.id | ID of the purchased book |
| purchase_date | datetime | Yes | Auto-generated | Timestamp when purchase was made |

**Database Constraints:**
- **Primary Key**: `id` field with auto-increment
- **Foreign Key**: `book_id` references `books.id` with CASCADE delete
- **Unique Constraint**: Combination of (`user_id`, `book_id`) must be unique
- **Indexes**: `user_id` field is indexed for performance
- **Constraint Name**: `unique_user_book_purchase` for the unique constraint

**Validation Rules:**
- **user_id**: Must be a valid Auth0 user ID format (e.g., "auth0|507f1f77bcf86cd799439011")
- **book_id**: Must reference an existing book in the books table
- **Unique Purchase**: A user cannot purchase the same book multiple times

**Validation Error Scenarios:**
- **Duplicate Purchase**: Returns 400 with "User already owns this book."
- **Invalid Book**: Returns 404 with "Book not found."
- **Database Error**: Returns 500 with "Failed to create purchase."

**Examples:**

**Recent Purchase:**
```json
{
  "id": 42,
  "user_id": "auth0|623456789abcdef",
  "book_id": 1,
  "purchase_date": "2024-11-16T14:30:25.123Z"
}
```

**Older Purchase:**
```json
{
  "id": 15,
  "user_id": "auth0|507f1f77bcf86cd799439011",
  "book_id": 3,
  "purchase_date": "2024-10-15T09:15:30.456Z"
}
```

**Purchase with Extended User ID:**
```json
{
  "id": 128,
  "user_id": "auth0|google-oauth2|1234567890123456789",
  "book_id": 6,
  "purchase_date": "2024-11-01T16:45:12.789Z"
}
```

**Purchase Response Format:**
```json
{
  "purchase": {
    "id": 42,
    "user_id": "auth0|623456789abcdef",
    "book_id": 1,
    "purchase_date": "2024-11-16T14:30:25.123Z"
  },
  "book": {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Classic Literature"
  }
}
```

**Related Models:**
- References Book model through `book_id` foreign key
- Uses Auth0 user IDs instead of local user table references
- Used for DRM ownership verification

### Response Models

#### Standard Success Response

**Description:** Standard format for successful API responses containing data.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| data | object/array | Varies | The requested data (books, user info, etc.) |
| message | string | No | Optional success message |

**Example:**
```json
{
  "data": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald"
    }
  ]
}
```

#### Error Response

**Description:** Standard format for all error responses across the API.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| detail | string | Yes | Human-readable error message |

**Common Error Messages:**
- **Authentication Errors**:
  - "Missing or invalid authorization header"
  - "Invalid token"
  - "Insufficient permissions"
- **Validation Errors**:
  - "Invalid characters in first name field."
  - "Invalid email address."
  - "Password must be at least 10 characters long..."
- **Resource Errors**:
  - "Book not found."
  - "User already owns this book."
- **Server Errors**:
  - "Failed to create purchase."
  - "Failed to verify book ownership."

**Example:**
```json
{
  "detail": "Invalid email address."
}
```

#### Authentication Response

**Description:** Response format for successful authentication operations.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| access_token | string | Yes | JWT access token for API authentication |
| refresh_token | string | Yes | Refresh token for obtaining new access tokens |
| sub | string | Yes | Auth0 user ID (subject) |
| name | string | Yes | User's full name |
| email | string | Yes | User's email address |
| email_verified | boolean | Yes | Whether email is verified in Auth0 |
| picture | string | Yes | URL to user's profile picture |
| updated_at | string | Yes | ISO timestamp of last profile update |
| roles | array | Yes | Array of user roles with id, name, and description |

**Example:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1Njc4OTAifQ...",
  "refresh_token": "v1.MRqwjJosOaS9s8U2kQDXOgEAbbg8kSxIvnlNQVJoGnInpEIxqDT42Q",
  "sub": "auth0|507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "email_verified": true,
  "picture": "https://s.gravatar.com/avatar/abc123def456?s=480&r=pg&d=https%3A%2F%2Fcdn.auth0.com%2Favatars%2Fjo.png",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "roles": [
    {
      "id": "rol_3rIPylnLOf4V0LHJ",
      "name": "admin",
      "description": "Administrator role with elevated permissions"
    }
  ]
}
```

#### Book List Response

**Description:** Response format for endpoints returning multiple books.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| books | array | Yes | Array of book objects |

**Example:**
```json
{
  "books": [
    {
      "id": 1,
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "description": "A classic American novel...",
      "genre": "Classic Literature"
    },
    {
      "id": 2,
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "description": "A gripping tale of racial injustice...",
      "genre": "Classic Literature"
    }
  ]
}
```

#### Purchase Response

**Description:** Response format for successful book purchase operations.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | Success message |
| purchase_id | integer | Yes | ID of the created purchase record |
| book_id | integer | Yes | ID of the purchased book |
| purchase_date | string | Yes | ISO timestamp of purchase |

**Example:**
```json
{
  "message": "Book purchased successfully",
  "purchase_id": 123,
  "book_id": 1,
  "purchase_date": "2024-01-15T14:30:00Z"
}
```

#### Ownership Check Response

**Description:** Response format for book ownership verification.

**Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| owns_book | boolean | Yes | Whether the user owns the specified book |
| book_id | integer | Yes | ID of the checked book |

**Example:**
```json
{
  "owns_book": true,
  "book_id": 1
}
```

---

## Validation Rules and Constraints

This section provides comprehensive documentation of all validation rules, constraints, and error scenarios implemented in the Bookstore Backend API. Understanding these validation requirements is essential for proper API integration and error handling.

### Password Complexity Requirements

The API enforces strict password complexity requirements to ensure account security. All passwords must meet the following criteria:

#### Password Validation Rules

**Minimum Requirements:**
- **Length**: At least 10 characters
- **Uppercase Letters**: At least one uppercase letter (A-Z)
- **Lowercase Letters**: At least one lowercase letter (a-z)
- **Digits**: At least three digits (0-9)
- **Special Characters**: At least one special character from the set: `@$!%*?&`

**Regex Pattern:**
```regex
^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){3,})(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$
```

**Pattern Explanation:**
- `^` - Start of string
- `(?=.*[a-z])` - Positive lookahead for at least one lowercase letter
- `(?=.*[A-Z])` - Positive lookahead for at least one uppercase letter
- `(?=(?:.*\d){3,})` - Positive lookahead for at least three digits
- `(?=.*[@$!%*?&])` - Positive lookahead for at least one special character
- `[A-Za-z\d@$!%*?&]{10,}` - Match only allowed characters with minimum length of 10
- `$` - End of string

**Valid Password Examples:**
```
SecurePass123!
MyPassword456@
StrongPwd789$
ComplexKey012%
```

**Invalid Password Examples:**
```
password123        # Missing uppercase, special character
PASSWORD123!       # Missing lowercase
MyPassword!        # Only 2 digits (needs 3+)
ShortPwd1!         # Only 9 characters (needs 10+)
MyPassword123      # Missing special character
```

**Error Response:**
```json
{
  "detail": "Password must be at least 10 characters long, contain at least one uppercase letter, one lowercase letter, three digits, and one special character."
}
```

**HTTP Status Code:** `400 Bad Request`

**Related Information:**
- For user registration process, see [Authentication Models](#authentication-models)
- For security best practices, see [Security Best Practices for API Consumers](#security-best-practices-for-api-consumers)

### Email Validation Rules

Email addresses must conform to standard email format requirements and be unique across all user accounts.

#### Email Format Requirements

**Validation Rules:**
- Must follow standard email format: `local@domain.extension`
- Local part can contain letters, numbers, dots, and hyphens
- Domain part must contain at least one dot
- Extension must be at least one character
- Maximum length: 255 characters
- Must be unique across all users in the system

**Regex Pattern:**
```regex
^[\w\.-]+@[\w\.-]+\.\w+$
```

**Pattern Explanation:**
- `^` - Start of string
- `[\w\.-]+` - Local part: one or more word characters, dots, or hyphens
- `@` - Required @ symbol
- `[\w\.-]+` - Domain name: one or more word characters, dots, or hyphens
- `\.` - Required dot before extension
- `\w+` - Extension: one or more word characters
- `$` - End of string

**Valid Email Examples:**
```
user@example.com
john.doe@company.org
test123@domain.co.uk
admin@bookstore.app
```

**Invalid Email Examples:**
```
invalid-email           # Missing @ and domain
user@                   # Missing domain
@domain.com            # Missing local part
user.domain.com        # Missing @ symbol
user@domain            # Missing extension
```

**Error Responses:**

**Invalid Format:**
```json
{
  "detail": "Invalid email address."
}
```

**Duplicate Email:**
```json
{
  "detail": "Email already exists."
}
```

**HTTP Status Code:** `400 Bad Request`

### Name Field Validation

First name and last name fields have strict character restrictions to ensure data consistency and prevent injection attacks.

#### Name Validation Rules

**Character Requirements:**
- **Allowed Characters**: Only alphanumeric characters (letters and numbers)
- **Prohibited Characters**: Spaces, special characters, symbols, punctuation
- **Length**: Maximum 255 characters per field
- **Case**: Both uppercase and lowercase letters allowed
- **Numbers**: Numeric digits are allowed

**Validation Method:**
The API uses Python's `str.isalnum()` method to validate name fields, which returns `True` only if all characters are alphanumeric.

**Valid Name Examples:**
```
John
Smith
John123
MARY
alex
User1
TestName99
```

**Invalid Name Examples:**
```
John Doe          # Contains space
O'Connor          # Contains apostrophe
Jean-Pierre       # Contains hyphen
Mary!             # Contains exclamation mark
José              # Contains accented character
Smith Jr.         # Contains period and space
```

**Error Responses:**

**Invalid First Name:**
```json
{
  "detail": "Invalid characters in first name field."
}
```

**Invalid Last Name:**
```json
{
  "detail": "Invalid characters in last name field."
}
```

**HTTP Status Code:** `400 Bad Request`

**Implementation Note:**
While this validation ensures data consistency, it may not accommodate all international naming conventions. Consider this limitation when implementing user-facing applications.

### Username and Email Uniqueness Constraints

The API enforces uniqueness constraints on both username and email fields to prevent duplicate accounts and ensure proper user identification.

#### Uniqueness Validation Process

**Database Constraints:**
- **Username**: Unique constraint at database level
- **Email**: Unique constraint at database level
- **Validation Timing**: Checked during user registration before account creation

**Validation Steps:**
1. **Format Validation**: Username and email format checked first
2. **Existence Check**: Database queried for existing records
3. **Constraint Enforcement**: Unique constraint prevents duplicate entries
4. **Error Response**: Specific error message returned for duplicates

**Username Uniqueness:**
- Case-sensitive comparison
- No automatic normalization applied
- Maximum length: 255 characters
- Must be unique across all user accounts

**Email Uniqueness:**
- Case-insensitive comparison (handled by database)
- Normalized to lowercase for storage
- Maximum length: 255 characters
- Must be unique across all user accounts

**Error Responses:**

**Duplicate Username:**
```json
{
  "detail": "Username already exists."
}
```

**Duplicate Email:**
```json
{
  "detail": "Email already exists."
}
```

**HTTP Status Code:** `400 Bad Request`

### Validation Error Messages and HTTP Status Codes

This section provides a comprehensive reference for all validation error scenarios, their corresponding error messages, and HTTP status codes.

#### Authentication and User Registration Errors

| Validation Failure | Error Message | HTTP Status | Description |
|-------------------|---------------|-------------|-------------|
| Invalid first name characters | "Invalid characters in first name field." | 400 | First name contains non-alphanumeric characters |
| Invalid last name characters | "Invalid characters in last name field." | 400 | Last name contains non-alphanumeric characters |
| Invalid email format | "Invalid email address." | 400 | Email doesn't match required regex pattern |
| Weak password | "Password must be at least 10 characters long, contain at least one uppercase letter, one lowercase letter, three digits, and one special character." | 400 | Password doesn't meet complexity requirements |
| Duplicate username | "Username already exists." | 400 | Username is already registered in the system |
| Duplicate email | "Email already exists." | 400 | Email address is already registered |
| Missing authorization header | "Missing or invalid authorization header" | 401 | Authorization header not provided or malformed |
| Invalid JWT token | "Invalid token" | 401 | JWT token is expired, malformed, or invalid |
| Insufficient permissions | "Insufficient permissions" | 403 | User lacks required role for the operation |

#### Book and Purchase Validation Errors

| Validation Failure | Error Message | HTTP Status | Description |
|-------------------|---------------|-------------|-------------|
| Book not found | "Book not found" | 404 | Requested book ID doesn't exist |
| Duplicate purchase | "User already owns this book." | 400 | User attempting to purchase already owned book |
| DRM access denied | "Access Denied: Purchase required to access this book." | 403 | User trying to access unowned book content |
| Missing book file | "Book file is missing from server." | 500 | Book file not found on filesystem |
| Invalid book ID format | "Invalid book ID format" | 400 | Book ID is not a valid integer |
| Empty search query | "Search query cannot be empty" | 400 | Search endpoint called with empty query parameter |

#### Database and System Errors

| Error Scenario | Error Message | HTTP Status | Description |
|---------------|---------------|-------------|-------------|
| Database connection failure | "Database connection error" | 500 | Unable to connect to database |
| User creation failure | "Failed to create user." | 500 | Database error during user registration |
| Purchase creation failure | "Failed to create purchase." | 500 | Database error during book purchase |
| Role assignment failure | "Failed to assign role to user" | 500 | Auth0 API error during role assignment |
| Token refresh failure | "Failed to refresh token" | 500 | Auth0 token refresh operation failed |

#### Validation Best Practices for API Consumers

**Client-Side Validation:**
- Implement client-side validation matching server requirements
- Provide real-time feedback for password complexity
- Validate email format before submission
- Check name fields for invalid characters

**Error Handling:**
- Parse error messages for user-friendly display
- Implement retry logic for 500-level errors
- Handle 401 errors with automatic token refresh
- Provide clear feedback for validation failures

**Security Considerations:**
- Never expose sensitive validation logic to clients
- Implement rate limiting for registration attempts
- Log validation failures for security monitoring
- Use HTTPS for all validation-sensitive operations

**Example Client Implementation:**
```javascript
// Client-side password validation
function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){3,})(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
  return regex.test(password);
}

// Client-side email validation
function validateEmail(email) {
  const regex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
  return regex.test(email);
}

// Client-side name validation
function validateName(name) {
  return /^[a-zA-Z0-9]+$/.test(name);
}
```

---

## Error Handling

The Bookstore Backend API implements comprehensive error handling with standardized HTTP status codes, detailed error messages, and specific guidance for different error scenarios. Understanding these error patterns is essential for building robust client applications that can gracefully handle various failure conditions.

### HTTP Status Codes

The API uses standard HTTP status codes to indicate the success or failure of requests. Each status code category represents a different type of response condition.

#### 2xx Success Codes

**200 OK**
- **Usage**: Successful GET, PUT, PATCH requests
- **Response**: Contains requested data or confirmation of successful operation
- **Example Endpoints**: `/books/`, `/auth/user`, `/books/my-books`

**201 Created**
- **Usage**: Successful POST requests that create new resources
- **Response**: Contains created resource data and location information
- **Example Endpoints**: `/books/purchase/{book_id}` (creates new purchase record)

#### 4xx Client Error Codes

**400 Bad Request**
- **Cause**: Invalid request format, malformed JSON, or validation failures
- **Common Scenarios**:
  - Invalid JSON syntax in request body
  - Missing required fields in request payload
  - Field validation failures (password complexity, email format, etc.)
  - Invalid parameter values or types
- **Response Format**: Contains detailed validation error messages
- **Client Action**: Fix request format or validation issues before retrying

**401 Unauthorized**
- **Cause**: Missing, invalid, or expired authentication credentials
- **Common Scenarios**:
  - Missing Authorization header
  - Invalid JWT token format
  - Expired access token
  - Token signature verification failure
  - Invalid Auth0 configuration
- **Response Format**: Generic error message for security reasons
- **Client Action**: Obtain valid authentication token or refresh expired token

**403 Forbidden**
- **Cause**: Valid authentication but insufficient permissions for the requested resource
- **Common Scenarios**:
  - User lacks required role for admin endpoints
  - Attempting to access another user's private resources
  - DRM protection preventing unauthorized book access
  - Role-based access control restrictions
- **Response Format**: Indicates insufficient permissions without exposing system details
- **Client Action**: Verify user permissions or request appropriate access level

**404 Not Found**
- **Cause**: Requested resource does not exist
- **Common Scenarios**:
  - Invalid book ID in URL path
  - Non-existent user ID for role management
  - Accessing deleted or unavailable resources
- **Response Format**: Indicates resource not found
- **Client Action**: Verify resource identifiers and availability

**422 Unprocessable Entity**
- **Cause**: Request is well-formed but contains semantic errors
- **Common Scenarios**:
  - Business logic validation failures
  - Constraint violations (duplicate username/email)
  - Invalid state transitions
- **Response Format**: Detailed validation error information
- **Client Action**: Address semantic issues in request data

#### 5xx Server Error Codes

**500 Internal Server Error**
- **Cause**: Unexpected server-side failures
- **Common Scenarios**:
  - Database connection failures
  - Auth0 service unavailability
  - Unhandled application exceptions
  - File system access errors
- **Response Format**: Generic error message (details logged server-side)
- **Client Action**: Retry request after brief delay; contact support if persistent

**502 Bad Gateway**
- **Cause**: Upstream service failures
- **Common Scenarios**:
  - Auth0 service temporarily unavailable
  - Database proxy failures
- **Response Format**: Gateway error indication
- **Client Action**: Retry request with exponential backoff

**503 Service Unavailable**
- **Cause**: Server temporarily unable to handle requests
- **Common Scenarios**:
  - Planned maintenance windows
  - Resource exhaustion
  - Rate limiting activation
- **Response Format**: Service unavailability notice
- **Client Action**: Retry after delay indicated in Retry-After header

### Error Response Format

All API errors follow a consistent JSON response format to ensure predictable error handling across all endpoints.

#### Standard Error Response Structure

```json
{
  "detail": "Human-readable error message describing the specific issue"
}
```

#### Error Response Characteristics

**Consistency**: All endpoints use the same error response format
**Clarity**: Error messages are descriptive and actionable
**Security**: Sensitive information is never exposed in error messages
**Localization**: Error messages are in English (localization support planned)

#### Example Error Responses

**Validation Error (400):**
```json
{
  "detail": "Password must be at least 10 characters long and contain at least one uppercase letter, one lowercase letter, three digits, and one special character"
}
```

**Authentication Error (401):**
```json
{
  "detail": "Missing or invalid authorization header"
}
```

**Permission Error (403):**
```json
{
  "detail": "Insufficient permissions"
}
```

**Resource Not Found (404):**
```json
{
  "detail": "Book not found"
}
```

**Server Error (500):**
```json
{
  "detail": "Internal server error"
}
```

### Common Error Scenarios

#### Authentication Error Scenarios

**Missing Authorization Header**
- **HTTP Status**: 401 Unauthorized
- **Trigger**: Request to protected endpoint without Authorization header
- **Response**: `{"detail": "Missing or invalid authorization header"}`
- **Resolution**: Include `Authorization: Bearer {token}` header in request
- **Prevention**: Implement automatic header inclusion in API client

**Invalid Token Format**
- **HTTP Status**: 401 Unauthorized
- **Trigger**: Malformed JWT token in Authorization header
- **Response**: `{"detail": "Invalid token"}`
- **Resolution**: Verify token format and obtain new token if corrupted
- **Prevention**: Validate token format before making requests

**Expired Access Token**
- **HTTP Status**: 401 Unauthorized
- **Trigger**: JWT token past expiration time (typically 24 hours)
- **Response**: `{"detail": "Invalid token"}`
- **Resolution**: Use refresh token to obtain new access token via `/auth/refresh-token`
- **Prevention**: Implement automatic token refresh before expiration

**Invalid Token Signature**
- **HTTP Status**: 401 Unauthorized
- **Trigger**: JWT token with invalid or tampered signature
- **Response**: `{"detail": "Invalid token"}`
- **Resolution**: Obtain new token through authentication flow
- **Prevention**: Secure token storage and transmission

**Auth0 Service Unavailable**
- **HTTP Status**: 500 Internal Server Error
- **Trigger**: Auth0 service temporarily unavailable during token validation
- **Response**: `{"detail": "Internal server error"}`
- **Resolution**: Retry request after brief delay
- **Prevention**: Implement retry logic with exponential backoff

#### Authorization Error Scenarios

**Insufficient Role Permissions**
- **HTTP Status**: 403 Forbidden
- **Trigger**: User lacks required role for admin endpoints (admin/sudo_admin)
- **Response**: `{"detail": "Insufficient permissions"}`
- **Resolution**: Request role assignment from super administrator
- **Prevention**: Check user roles before attempting admin operations

**DRM Access Denied**
- **HTTP Status**: 403 Forbidden
- **Trigger**: Attempting to access book content without ownership
- **Response**: `{"detail": "Access denied. You do not own this book."}`
- **Resolution**: Purchase the book before attempting to access content
- **Prevention**: Verify ownership using `/books/check-ownership/{book_id}` before access attempts

**Cross-User Resource Access**
- **HTTP Status**: 403 Forbidden
- **Trigger**: Attempting to access another user's private resources
- **Response**: `{"detail": "Insufficient permissions"}`
- **Resolution**: Access only resources owned by authenticated user
- **Prevention**: Implement proper user context validation in client applications

#### Validation Error Scenarios

**Password Complexity Failure**
- **HTTP Status**: 400 Bad Request
- **Trigger**: Password not meeting complexity requirements during user creation
- **Response**: `{"detail": "Password must be at least 10 characters long and contain at least one uppercase letter, one lowercase letter, three digits, and one special character"}`
- **Resolution**: Update password to meet all complexity requirements
- **Prevention**: Implement client-side password validation with real-time feedback

**Invalid Email Format**
- **HTTP Status**: 400 Bad Request
- **Trigger**: Email address not matching required format pattern
- **Response**: `{"detail": "Invalid email format"}`
- **Resolution**: Provide valid email address in correct format
- **Prevention**: Use client-side email validation with regex pattern matching

**Username/Email Already Exists**
- **HTTP Status**: 422 Unprocessable Entity
- **Trigger**: Attempting to create user with existing username or email
- **Response**: `{"detail": "Username already exists"}` or `{"detail": "Email already exists"}`
- **Resolution**: Choose different username or email address
- **Prevention**: Implement availability checking during user input

**Invalid Name Characters**
- **HTTP Status**: 400 Bad Request
- **Trigger**: Name fields containing non-alphanumeric characters
- **Response**: `{"detail": "Name can only contain alphanumeric characters"}`
- **Resolution**: Remove special characters and spaces from name fields
- **Prevention**: Implement input filtering for name fields

**Missing Required Fields**
- **HTTP Status**: 400 Bad Request
- **Trigger**: Request missing required fields in JSON payload
- **Response**: `{"detail": "Field 'field_name' is required"}`
- **Resolution**: Include all required fields in request payload
- **Prevention**: Validate request completeness before submission

#### DRM and Ownership Error Scenarios

**Book Not Owned**
- **HTTP Status**: 403 Forbidden
- **Trigger**: Attempting to read book content without purchase
- **Response**: `{"detail": "Access denied. You do not own this book."}`
- **Resolution**: Purchase book using `/books/purchase/{book_id}` endpoint
- **Prevention**: Check ownership status before attempting content access

**Invalid Book ID**
- **HTTP Status**: 404 Not Found
- **Trigger**: Requesting book with non-existent ID
- **Response**: `{"detail": "Book not found"}`
- **Resolution**: Verify book ID exists in catalog
- **Prevention**: Validate book IDs against current catalog

**File Access Error**
- **HTTP Status**: 500 Internal Server Error
- **Trigger**: Server unable to access book file (missing, corrupted, or permission issues)
- **Response**: `{"detail": "Internal server error"}`
- **Resolution**: Contact support for file availability issues
- **Prevention**: Regular file system integrity checks

**Purchase Already Exists**
- **HTTP Status**: 422 Unprocessable Entity
- **Trigger**: Attempting to purchase already-owned book
- **Response**: `{"detail": "Book already purchased"}`
- **Resolution**: Access book through `/books/read/{book_id}` instead
- **Prevention**: Check ownership before offering purchase option

### Troubleshooting Guide

#### Authentication Issues

**Problem**: Receiving 401 errors despite having valid credentials
**Diagnosis Steps**:
1. Verify Authorization header format: `Authorization: Bearer {token}`
2. Check token expiration using JWT decoder
3. Validate Auth0 configuration (domain, audience, client ID)
4. Test token with `/auth/user` endpoint

**Common Solutions**:
- Refresh expired tokens using `/auth/refresh-token`
- Re-authenticate if refresh token is expired
- Verify Auth0 application configuration
- Check for token corruption during storage/transmission

**Problem**: Authentication works but role-based endpoints return 403
**Diagnosis Steps**:
1. Verify user roles using `/auth/roles/{user_id}` endpoint
2. Check required roles for specific endpoints in documentation
3. Confirm role assignment in Auth0 dashboard

**Common Solutions**:
- Request role assignment from super administrator
- Verify role IDs match expected values (admin: rol_3rIPylnLOf4V0LHJ, sudo_admin: rol_Rse83znIx3ekyIHp)
- Clear cached role information and re-authenticate

#### Validation Issues

**Problem**: Receiving validation errors despite seemingly correct data
**Diagnosis Steps**:
1. Review exact validation requirements in documentation
2. Test individual fields against validation patterns
3. Check for hidden characters or encoding issues
4. Verify JSON structure and field names

**Common Solutions**:
- Use provided regex patterns for client-side validation
- Trim whitespace from input fields
- Ensure proper JSON encoding (UTF-8)
- Match field names exactly as documented

**Problem**: Unique constraint violations for username/email
**Diagnosis Steps**:
1. Verify uniqueness requirements in documentation
2. Test with different values to confirm constraint
3. Check for case sensitivity in validation

**Common Solutions**:
- Choose different username or email address
- Implement availability checking during user input
- Consider case-insensitive uniqueness if appropriate

#### DRM and Access Issues

**Problem**: Unable to access purchased book content
**Diagnosis Steps**:
1. Verify purchase using `/books/my-purchases` endpoint
2. Check ownership using `/books/check-ownership/{book_id}`
3. Confirm book ID matches purchased book
4. Test with different book to isolate issue

**Common Solutions**:
- Ensure book was successfully purchased (check purchase history)
- Verify correct book ID in access request
- Re-authenticate if session expired
- Contact support if file access issues persist

**Problem**: Purchase endpoint returning errors
**Diagnosis Steps**:
1. Verify book exists using `/books/{book_id}`
2. Check if book already owned using ownership endpoint
3. Confirm authentication and user context

**Common Solutions**:
- Verify book ID exists in catalog
- Check if book already purchased (duplicate purchase prevention)
- Ensure valid authentication for purchase operation

#### Server and Network Issues

**Problem**: Intermittent 500 errors across multiple endpoints
**Diagnosis Steps**:
1. Check API health using `/health` endpoint
2. Monitor error patterns (specific endpoints, time-based)
3. Verify network connectivity and DNS resolution
4. Test with different client applications

**Common Solutions**:
- Implement retry logic with exponential backoff
- Check for service maintenance announcements
- Verify client timeout settings are appropriate
- Contact support if errors persist across multiple clients

**Problem**: Slow response times or timeouts
**Diagnosis Steps**:
1. Test different endpoints to isolate performance issues
2. Monitor response times across different operations
3. Check network latency and bandwidth
4. Verify client timeout configurations

**Common Solutions**:
- Increase client timeout values for large operations
- Implement request caching where appropriate
- Use pagination for large data sets
- Consider geographic proximity to API servers

#### Client Implementation Best Practices

**Error Handling Strategy**:
```javascript
async function makeAPIRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    // Handle different error scenarios
    if (response.status === 401) {
      // Token expired or invalid - attempt refresh
      await refreshToken();
      // Retry original request with new token
      return makeAPIRequest(url, options);
    }

    if (response.status === 403) {
      // Insufficient permissions - redirect to appropriate page
      handleInsufficientPermissions();
      return;
    }

    if (response.status >= 400 && response.status < 500) {
      // Client error - parse and display error message
      const errorData = await response.json();
      throw new Error(errorData.detail);
    }

    if (response.status >= 500) {
      // Server error - implement retry logic
      throw new Error('Server error - please try again later');
    }

    return await response.json();
  } catch (error) {
    // Handle network errors and other exceptions
    console.error('API request failed:', error);
    throw error;
  }
}
```

**Retry Logic Implementation**:
```javascript
async function makeRequestWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await makeAPIRequest(url, options);
    } catch (error) {
      if (attempt === maxRetries || error.status < 500) {
        throw error;
      }
      
      // Exponential backoff for server errors
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

**Token Management**:
```javascript
class TokenManager {
  constructor() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  async getValidToken() {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    // Check if token is expired (decode JWT and check exp claim)
    if (this.isTokenExpired(this.accessToken)) {
      await this.refreshAccessToken();
    }

    return this.accessToken;
  }

  async refreshAccessToken() {
    try {
      const response = await fetch('/auth/refresh-token', {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        
        localStorage.setItem('access_token', this.accessToken);
        localStorage.setItem('refresh_token', this.refreshToken);
      } else {
        // Refresh failed - redirect to login
        this.clearTokens();
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearTokens();
      window.location.href = '/login';
    }
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true; // Assume expired if can't decode
    }
  }
}
```

---

## Security & DRM

The Bookstore Backend API implements comprehensive Digital Rights Management (DRM) and security mechanisms to protect digital content and ensure that only authorized users can access purchased books. The system combines Auth0 JWT authentication with ownership verification, secure file handling, and comprehensive audit logging to create a robust content protection system.

### Book Access Authorization

The book access authorization system is the core of the DRM implementation, ensuring that users can only access books they have legitimately purchased. This multi-step process validates user identity, verifies ownership, and provides secure access to protected content.

#### Complete Authorization Flow

**Step 1: Authentication Validation**
```
1. Extract JWT token from Authorization header
2. Validate token signature using Auth0 JWKS endpoint
3. Verify token claims (issuer, audience, expiration)
4. Extract user ID from token 'sub' claim
```

**Step 2: Ownership Verification**
```
1. Query purchases table for user_id + book_id combination
2. Check if purchase record exists in database
3. Log ownership check result for audit purposes
4. Return authorization decision
```

**Step 3: File Path Resolution**
```
1. Retrieve book filepath from books table
2. Sanitize filename to prevent path traversal attacks
3. Construct secure full path within protected directory
4. Verify file exists on filesystem
```

**Step 4: Secure File Delivery**
```
1. Serve file through FastAPI FileResponse
2. Set appropriate content-type headers
3. Log file access for audit trail
4. Return file content to authorized user
```

#### Authorization Code Implementation

The authorization process is implemented in the `authorize_book_access` function:

```python
async def authorize_book_access(user_id: str, book_id: int) -> Dict:
    """
    Authorize a user's access to a book (DRM check).
    
    Returns:
        Dictionary with authorization result and file path
        
    Raises:
        HTTPException: If user doesn't own the book (403 Forbidden)
    """
    logger.info(f"🔐 DRM Check: User {user_id} requesting access to book {book_id}")
    
    # Step 1: Check if user owns the book
    owns_book = await check_user_owns_book(user_id, book_id)
    
    # Step 2: If user doesn't own the book, deny access
    if not owns_book:
        logger.warning(f"❌ ACCESS DENIED: User {user_id} tried to access book {book_id} without purchase")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Purchase required to access this book."
        )
    
    # Step 3: User owns the book, get the file path
    logger.info(f"✅ ACCESS GRANTED: User {user_id} authorized for book {book_id}")
    filepath = await get_book_filepath(book_id)
    
    return {
        "authorized": True,
        "filepath": filepath,
        "book_id": book_id,
        "user_id": user_id
    }
```

#### DRM-Protected Endpoint Example

The `/books/read/{book_id}` endpoint demonstrates the complete DRM flow:

```http
GET /books/read/1 HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (User owns book):**
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: attachment; filename="book_file.pdf"

[PDF file content]
```

**Access Denied Response (User doesn't own book):**
```json
{
  "detail": "Access Denied: Purchase required to access this book."
}
```

### Ownership Verification

The ownership verification system is the foundation of the DRM protection, ensuring that only users who have purchased a book can access its content. This system maintains a secure audit trail and prevents unauthorized access attempts.

#### Database Schema for Ownership

**Purchases Table Structure:**
```sql
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,  -- Auth0 user identifier
    book_id INTEGER NOT NULL REFERENCES books(id),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)  -- Prevent duplicate purchases
);
```

**Key Design Decisions:**
- **Auth0 User ID**: Uses Auth0's unique user identifier instead of local user table
- **Unique Constraint**: Prevents duplicate purchase records for same user/book combination
- **Foreign Key**: Ensures referential integrity with books table
- **Timestamp**: Records when purchase was made for audit purposes

#### Ownership Check Process

**Database Query Implementation:**
```python
async def check_user_owns_book(user_id: str, book_id: int) -> bool:
    """
    Check if a user has purchased (owns) a specific book.
    This is the core DRM check!
    """
    async with get_session() as session:
        result = await session.execute(
            select(Purchase).where(
                Purchase.user_id == user_id,
                Purchase.book_id == book_id
            )
        )
        purchase = result.scalars().first()
        
        owns_book = purchase is not None
        
        if owns_book:
            logger.info(f"✅ DRM CHECK PASSED: User {user_id} owns book {book_id}")
        else:
            logger.warning(f"❌ DRM CHECK FAILED: User {user_id} does not own book {book_id}")
        
        return owns_book
```

#### Ownership Verification Scenarios

**Scenario 1: Valid Ownership**
```
User ID: auth0|507f1f77bcf86cd799439011
Book ID: 1
Database Query Result: Purchase record found
Authorization Result: ✅ ACCESS GRANTED
Log Entry: "DRM CHECK PASSED: User auth0|507f1f77bcf86cd799439011 owns book 1"
```

**Scenario 2: No Ownership**
```
User ID: auth0|507f1f77bcf86cd799439011
Book ID: 2
Database Query Result: No purchase record found
Authorization Result: ❌ ACCESS DENIED (403 Forbidden)
Log Entry: "DRM CHECK FAILED: User auth0|507f1f77bcf86cd799439011 does not own book 2"
```

**Scenario 3: Database Error**
```
User ID: auth0|507f1f77bcf86cd799439011
Book ID: 1
Database Query Result: Connection timeout/error
Authorization Result: ❌ SERVER ERROR (500 Internal Server Error)
Log Entry: "Error checking book ownership: [error details]"
```

#### Purchase Creation Process

**Creating Ownership Records:**
```python
async def create_purchase(user_id: str, book_id: int):
    """
    Create a purchase record (give user access to a book).
    """
    # Check if purchase already exists
    existing_purchase = await get_purchase_record(user_id, book_id)
    if existing_purchase:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already owns this book."
        )
    
    # Verify book exists
    book = await get_book_by_id(book_id)
    
    # Create purchase
    purchase = Purchase(
        user_id=user_id,
        book_id=book_id
    )
    
    async with get_session() as session:
        session.add(purchase)
        await session.commit()
        await session.refresh(purchase)
        logger.info(f"✅ Purchase created: User {user_id} now owns book {book_id}")
    
    return purchase
```

### Secure File Path Handling

The system implements multiple layers of security to prevent path traversal attacks and ensure that users can only access files they are authorized to read. This includes filename sanitization, directory restrictions, and secure path construction.

#### Path Traversal Prevention

**Security Measures Implemented:**

1. **Filename Sanitization**
   ```python
   # Extract only the filename, removing any directory components
   filename = os.path.basename(auth_result["filepath"])
   ```

2. **Base Directory Restriction**
   ```python
   # Construct path within protected directory only
   base_path = "/app/private_books"  # Secure directory
   full_path = os.path.join(base_path, filename)
   ```

3. **File Existence Verification**
   ```python
   # Verify file exists before serving
   if not os.path.exists(full_path):
       raise HTTPException(
           status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
           detail="Book file is missing from server."
       )
   ```

#### Secure Path Construction

**Complete Implementation:**
```python
async def get_secure_book_path(user_id: str, book_id: int, base_path: str) -> str:
    """
    Get the secure file path for a book after DRM authorization.
    Prevents path traversal attacks.
    """
    # Step 1: Authorize access first (DRM check)
    auth_result = await authorize_book_access(user_id, book_id)
    
    # Step 2: Sanitize filename (prevent path traversal)
    filename = os.path.basename(auth_result["filepath"])
    
    # Step 3: Construct full path within secure directory
    full_path = os.path.join(base_path, filename)
    
    # Step 4: Verify file exists
    if not os.path.exists(full_path):
        logger.error(f"❌ FILE NOT FOUND: {full_path}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Book file is missing from server."
        )
    
    logger.info(f"📖 Serving book from: {full_path}")
    return full_path
```

#### Protected Directory Structure

**File System Organization:**
```
/app/
├── private_books/          # DRM-protected book files
│   ├── 1.pdf              # Book ID 1
│   ├── 2.pdf              # Book ID 2
│   └── ...
├── temp/                  # Temporary files (not protected)
└── src/                   # Application source code
```

**Security Characteristics:**
- **Private Directory**: Books stored outside web-accessible directory
- **Numeric Filenames**: Simple naming convention prevents information disclosure
- **No Direct Access**: Files only accessible through DRM-protected endpoints
- **Separate from Code**: Book files isolated from application code

#### Attack Prevention Examples

**Path Traversal Attack Attempt:**
```
Malicious filepath: "../../../etc/passwd"
After sanitization: "passwd"
Final path: "/app/private_books/passwd"
Result: File not found (safe)
```

**Directory Escape Attempt:**
```
Malicious filepath: "/etc/passwd"
After sanitization: "passwd"
Final path: "/app/private_books/passwd"
Result: File not found (safe)
```

**Relative Path Attack:**
```
Malicious filepath: "../../sensitive_file.txt"
After sanitization: "sensitive_file.txt"
Final path: "/app/private_books/sensitive_file.txt"
Result: File not found (safe)
```

### Access Logging and Audit Trail

The system maintains comprehensive audit logs for all DRM-related activities, providing visibility into access patterns, security events, and potential unauthorized access attempts. These logs are essential for security monitoring and compliance requirements.

#### Logging Architecture

**Daily Rotating File Logger:**
```python
class DailyFileLogger:
    """
    Daily rotating file logger with automatic cleanup.
    - Logs written to ./logs/<YYYY-MM-DD>.log
    - New file created each day
    - Old log files removed after retention period (default 7 days)
    - Thread-safe rollover
    """
```

**Log File Structure:**
```
logs/
├── 2024-01-15.log         # Today's logs
├── 2024-01-14.log         # Yesterday's logs
├── 2024-01-13.log         # Older logs
└── ...                    # Automatic cleanup after 7 days
```

#### DRM Event Logging

**Access Grant Events:**
```
2024-01-15 10:30:15 INFO [app] 🔐 DRM Check: User auth0|507f1f77bcf86cd799439011 requesting access to book 1
2024-01-15 10:30:15 INFO [app] ✅ DRM CHECK PASSED: User auth0|507f1f77bcf86cd799439011 owns book 1
2024-01-15 10:30:15 INFO [app] ✅ ACCESS GRANTED: User auth0|507f1f77bcf86cd799439011 authorized for book 1
2024-01-15 10:30:15 INFO [app] 📖 Serving book from: /app/private_books/1.pdf
```

**Access Denial Events:**
```
2024-01-15 10:35:22 INFO [app] 🔐 DRM Check: User auth0|507f1f77bcf86cd799439011 requesting access to book 2
2024-01-15 10:35:22 WARNING [app] ❌ DRM CHECK FAILED: User auth0|507f1f77bcf86cd799439011 does not own book 2
2024-01-15 10:35:22 WARNING [app] ❌ ACCESS DENIED: User auth0|507f1f77bcf86cd799439011 tried to access book 2 without purchase
```

**Purchase Events:**
```
2024-01-15 10:40:33 INFO [app] ✅ Purchase completed: User auth0|507f1f77bcf86cd799439011 now owns 'The Great Gatsby'
2024-01-15 10:40:33 INFO [app] ✅ Purchase created: User auth0|507f1f77bcf86cd799439011 now owns book 1
```

**Error Events:**
```
2024-01-15 10:45:18 ERROR [app] ❌ FILE NOT FOUND: /app/private_books/missing_book.pdf
2024-01-15 10:45:18 ERROR [app] Error checking book ownership: Database connection timeout
```

#### Authentication Event Logging

**Token Validation Events:**
```
2024-01-15 10:30:10 INFO [app] JWT token validation successful for user auth0|507f1f77bcf86cd799439011
2024-01-15 10:30:10 INFO [app] User roles retrieved: ['admin']
```

**Authentication Failures:**
```
2024-01-15 10:32:45 WARNING [app] Invalid JWT token provided
2024-01-15 10:32:45 WARNING [app] Authentication failed: Token signature verification failed
```

**Role-Based Access Events:**
```
2024-01-15 10:35:12 INFO [app] Role check passed: User has required role 'admin'
2024-01-15 10:35:15 WARNING [app] Role check failed: User lacks required role 'sudo_admin'
```

#### Audit Trail Analysis

**Key Metrics to Monitor:**

1. **Access Patterns**
   - Successful book access attempts per user
   - Most frequently accessed books
   - Peak usage times and patterns

2. **Security Events**
   - Failed DRM checks (potential piracy attempts)
   - Invalid token usage patterns
   - Repeated access denials from same user

3. **System Health**
   - Database connection errors
   - File system access issues
   - Authentication service availability

**Log Analysis Queries:**

**Find Unauthorized Access Attempts:**
```bash
grep "ACCESS DENIED" logs/2024-01-15.log | wc -l
```

**Monitor User Activity:**
```bash
grep "auth0|507f1f77bcf86cd799439011" logs/2024-01-15.log
```

**Track Book Access Patterns:**
```bash
grep "Serving book from" logs/2024-01-15.log | cut -d' ' -f8 | sort | uniq -c
```

#### Compliance and Retention

**Log Retention Policy:**
- **Default Retention**: 7 days for development environments
- **Production Recommendation**: 90+ days for compliance requirements
- **Automatic Cleanup**: Old logs automatically removed based on file modification time
- **Backup Strategy**: Consider archiving logs to external storage for long-term retention

**Privacy Considerations:**
- User IDs are logged but are Auth0 identifiers, not personally identifiable information
- No sensitive user data (passwords, personal details) is logged
- Book titles and IDs are logged for audit purposes
- IP addresses and request details can be added if needed for security monitoring

### Security Best Practices

The API implements multiple layers of security controls and follows industry best practices to protect against common attack vectors. API consumers should also implement complementary security measures to ensure end-to-end protection.

#### JWT Token Security

**Token Validation Best Practices:**

1. **Signature Verification**
   ```python
   # Always verify token signature using Auth0 JWKS
   jwks_client = PyJWKClient(JWKS_URL)
   signing_key = jwks_client.get_signing_key_from_jwt(token).key
   
   decoded = jwt.decode(
       token,
       signing_key,
       algorithms=["RS256"],  # Only allow RS256
       audience=API_AUDIENCE,
       issuer=ISSUER,
       options={"require": ["exp", "iat", "iss", "aud"]}
   )
   ```

2. **Claims Validation**
   - **Issuer (iss)**: Must match Auth0 domain
   - **Audience (aud)**: Must match API audience
   - **Expiration (exp)**: Token must not be expired
   - **Issued At (iat)**: Must be reasonable timestamp

3. **Token Lifecycle Management**
   - Access tokens expire after 24 hours (configurable)
   - Refresh tokens used for obtaining new access tokens
   - Automatic token refresh on expiration
   - Secure token storage in client applications

#### API Consumer Security Guidelines

**Client-Side Token Handling:**

```javascript
// Secure token storage (avoid localStorage for sensitive apps)
class SecureTokenStorage {
  setTokens(accessToken, refreshToken) {
    // Use secure storage mechanism
    sessionStorage.setItem('access_token', accessToken);
    // Consider using secure HTTP-only cookies for refresh tokens
    this.setSecureCookie('refresh_token', refreshToken);
  }
  
  getAccessToken() {
    return sessionStorage.getItem('access_token');
  }
  
  clearTokens() {
    sessionStorage.removeItem('access_token');
    this.clearSecureCookie('refresh_token');
  }
}
```

**Request Security:**

```javascript
// Always use HTTPS in production
const API_BASE_URL = 'https://api.bookstore.example.com';

// Include security headers
const makeSecureRequest = async (endpoint, options = {}) => {
  const token = await tokenManager.getValidToken();
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',  // CSRF protection
      ...options.headers
    }
  });
};
```

#### Server-Side Security Controls

**Security Headers Middleware:**

The API automatically applies security headers to all responses:

```python
class SecurityHeadersMiddleware:
    """
    ASGI middleware that injects security headers into HTTP responses.
    """
    def add_security_headers(self, headers):
        headers.update({
            'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'Referrer-Policy': 'no-referrer-when-downgrade',
            'Permissions-Policy': 'geolocation=(), microphone=()',
            'X-XSS-Protection': '0'  # Modern browsers ignore this, but included for older clients
        })
```

**CORS Configuration:**

```python
# Configure CORS for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://bookstore.example.com"],  # Specific origins only
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

#### DRM Security Considerations

**Content Protection Measures:**

1. **File Access Control**
   - Books stored outside web-accessible directory
   - Access only through authenticated API endpoints
   - Path traversal prevention with filename sanitization
   - File existence verification before serving

2. **Ownership Verification**
   - Database-backed ownership checks for every access
   - Unique constraints prevent duplicate purchases
   - Comprehensive audit logging of all access attempts
   - Real-time authorization for each file request

3. **Session Security**
   - JWT tokens required for all protected operations
   - Token validation on every request
   - Role-based access control for administrative functions
   - Automatic token refresh to maintain sessions

**Limitations and Considerations:**

1. **Client-Side Protection**
   - Once downloaded, files are accessible to the user
   - Consider additional client-side DRM for enhanced protection
   - Watermarking or encryption may be needed for high-value content

2. **Network Security**
   - Always use HTTPS in production environments
   - Consider VPN or additional network security for sensitive content
   - Monitor for unusual download patterns or bulk access

3. **Compliance Requirements**
   - Implement appropriate data retention policies
   - Consider GDPR/privacy requirements for user data
   - Maintain audit logs for compliance reporting

#### Security Monitoring and Alerting

**Recommended Monitoring:**

1. **Failed Authentication Attempts**
   - Multiple failed login attempts from same IP
   - Invalid token usage patterns
   - Unusual geographic access patterns

2. **DRM Violations**
   - Repeated access attempts to non-owned books
   - Bulk download attempts
   - Unusual access patterns outside normal hours

3. **System Security Events**
   - Database connection failures
   - File system access errors
   - Middleware security header failures

**Alert Configuration Examples:**

```python
# Example alert conditions
SECURITY_ALERTS = {
    'failed_drm_checks': {
        'threshold': 10,  # 10 failed attempts
        'window': 300,    # in 5 minutes
        'action': 'block_user_temporarily'
    },
    'invalid_tokens': {
        'threshold': 5,   # 5 invalid tokens
        'window': 60,     # in 1 minute
        'action': 'alert_security_team'
    }
}
```

#### Production Deployment Security

**Environment Configuration:**

```bash
# Production environment variables
AUTH0_DOMAIN=your-production-domain.auth0.com
AUTH0_AUDIENCE=https://api.bookstore.example.com
DATABASE_URL=postgresql://user:pass@prod-db:5432/bookstore
LOG_LEVEL=INFO
CORS_ORIGINS=https://bookstore.example.com,https://admin.bookstore.example.com
```

**Infrastructure Security:**

1. **Database Security**
   - Use connection pooling with authentication
   - Enable SSL/TLS for database connections
   - Regular security updates and patches

2. **Network Security**
   - Use HTTPS/TLS 1.2+ for all communications
   - Implement proper firewall rules
   - Consider API gateway for additional security layers

3. **Container Security**
   - Use minimal base images
   - Regular security scanning of container images
   - Run containers with non-root users when possible

---

## Security Best Practices for API Consumers

This section provides comprehensive security guidelines for developers integrating with the Bookstore Backend API. Following these practices ensures secure implementation and protects both client applications and user data.

### JWT Token Handling Best Practices

Proper JWT token management is critical for maintaining secure API access. Tokens contain sensitive authentication information and must be handled with appropriate security measures.

#### Secure Token Storage

**Client-Side Storage Options:**

1. **Memory Storage (Most Secure)**
   ```javascript
   // Store tokens in memory only (lost on page refresh)
   class MemoryTokenStorage {
     constructor() {
       this.accessToken = null;
       this.refreshToken = null;
     }
     
     setTokens(accessToken, refreshToken) {
       this.accessToken = accessToken;
       this.refreshToken = refreshToken;
     }
     
     getAccessToken() {
       return this.accessToken;
     }
     
     clearTokens() {
       this.accessToken = null;
       this.refreshToken = null;
     }
   }
   ```

2. **Secure HTTP-Only Cookies (Recommended for Web Apps)**
   ```javascript
   // Server-side cookie setting (Node.js/Express example)
   app.post('/auth/callback', (req, res) => {
     const { accessToken, refreshToken } = req.body;
     
     // Set HTTP-only cookies
     res.cookie('access_token', accessToken, {
       httpOnly: true,
       secure: true,      // HTTPS only
       sameSite: 'strict',
       maxAge: 24 * 60 * 60 * 1000  // 24 hours
     });
     
     res.cookie('refresh_token', refreshToken, {
       httpOnly: true,
       secure: true,
       sameSite: 'strict',
       maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days
     });
   });
   ```

3. **SessionStorage (Acceptable for SPAs)**
   ```javascript
   // Use sessionStorage for single-page applications
   class SessionTokenStorage {
     setTokens(accessToken, refreshToken) {
       sessionStorage.setItem('access_token', accessToken);
       // Store refresh token more securely if possible
       sessionStorage.setItem('refresh_token', refreshToken);
     }
     
     getAccessToken() {
       return sessionStorage.getItem('access_token');
     }
     
     clearTokens() {
       sessionStorage.removeItem('access_token');
       sessionStorage.removeItem('refresh_token');
     }
   }
   ```

**❌ Avoid These Storage Methods:**
- **LocalStorage**: Persistent and accessible to all scripts
- **URL Parameters**: Tokens visible in browser history and logs
- **Plain Text Files**: Easily accessible and not encrypted

#### Token Validation and Refresh

**Automatic Token Refresh Implementation:**

```javascript
class TokenManager {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
    this.storage = new SessionTokenStorage();
  }
  
  async getValidToken() {
    let token = this.storage.getAccessToken();
    
    if (!token) {
      throw new Error('No access token available');
    }
    
    // Check if token is expired (decode JWT payload)
    if (this.isTokenExpired(token)) {
      token = await this.refreshAccessToken();
    }
    
    return token;
  }
  
  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      // Check if token expires within next 5 minutes
      return payload.exp < (currentTime + 300);
    } catch (error) {
      return true; // Treat invalid tokens as expired
    }
  }
  
  async refreshAccessToken() {
    const refreshToken = this.storage.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await fetch(`${this.apiBaseUrl}/auth/refresh-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      this.storage.setTokens(data.access_token, data.refresh_token);
      
      return data.access_token;
    } catch (error) {
      // Refresh failed, redirect to login
      this.storage.clearTokens();
      window.location.href = '/login';
      throw error;
    }
  }
}
```

#### Secure API Request Implementation

**Request Wrapper with Security Headers:**

```javascript
class SecureApiClient {
  constructor(baseUrl, tokenManager) {
    this.baseUrl = baseUrl;
    this.tokenManager = tokenManager;
  }
  
  async makeRequest(endpoint, options = {}) {
    const token = await this.tokenManager.getValidToken();
    
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',  // CSRF protection
        'Accept': 'application/json'
      }
    };
    
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, mergedOptions);
      
      if (response.status === 401) {
        // Token might be invalid, try refresh once
        const newToken = await this.tokenManager.refreshAccessToken();
        mergedOptions.headers.Authorization = `Bearer ${newToken}`;
        return fetch(`${this.baseUrl}${endpoint}`, mergedOptions);
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  // Convenience methods
  async get(endpoint) {
    return this.makeRequest(endpoint, { method: 'GET' });
  }
  
  async post(endpoint, data) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}
```

#### Token Security Checklist

**✅ Implementation Checklist:**

- [ ] Store tokens securely (avoid localStorage)
- [ ] Implement automatic token refresh
- [ ] Validate token expiration before requests
- [ ] Handle token refresh failures gracefully
- [ ] Clear tokens on logout
- [ ] Use HTTPS for all token-related communications
- [ ] Implement proper error handling for authentication failures
- [ ] Never log or expose tokens in client-side code
- [ ] Implement token rotation if supported
- [ ] Use secure transport for token exchange

### Rate Limiting Considerations and Recommendations

While the current API implementation does not enforce rate limiting, production deployments should implement appropriate rate limiting to prevent abuse and ensure fair resource usage.

#### Recommended Rate Limiting Strategy

**Tier-Based Rate Limits:**

1. **Public Endpoints (No Authentication)**
   ```
   /health: 100 requests/minute per IP
   /books/: 60 requests/minute per IP
   /books/{book_id}: 120 requests/minute per IP
   /books/search: 30 requests/minute per IP
   ```

2. **Authenticated User Endpoints**
   ```
   /books/my-books: 30 requests/minute per user
   /books/my-purchases: 30 requests/minute per user
   /books/purchase/{book_id}: 5 requests/minute per user
   /books/read/{book_id}: 10 requests/minute per user
   ```

3. **Administrative Endpoints**
   ```
   /auth/set-role/{user_id}: 10 requests/minute per admin
   /auth/roles/{user_id}: 60 requests/minute per admin
   ```

#### Client-Side Rate Limiting Implementation

**Request Queue with Rate Limiting:**

```javascript
class RateLimitedApiClient {
  constructor(baseUrl, tokenManager, requestsPerMinute = 30) {
    this.baseUrl = baseUrl;
    this.tokenManager = tokenManager;
    this.requestQueue = [];
    this.requestTimes = [];
    this.maxRequestsPerMinute = requestsPerMinute;
    this.processing = false;
  }
  
  async queueRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        endpoint,
        options,
        resolve,
        reject,
        timestamp: Date.now()
      });
      
      this.processQueue();
    });
  }
  
  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    while (this.requestQueue.length > 0) {
      // Check if we can make a request
      if (!this.canMakeRequest()) {
        // Wait until we can make the next request
        const waitTime = this.getWaitTime();
        await this.sleep(waitTime);
        continue;
      }
      
      const request = this.requestQueue.shift();
      
      try {
        const response = await this.makeSecureRequest(
          request.endpoint, 
          request.options
        );
        this.recordRequest();
        request.resolve(response);
      } catch (error) {
        request.reject(error);
      }
    }
    
    this.processing = false;
  }
  
  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Remove old request times
    this.requestTimes = this.requestTimes.filter(time => time > oneMinuteAgo);
    
    return this.requestTimes.length < this.maxRequestsPerMinute;
  }
  
  getWaitTime() {
    if (this.requestTimes.length === 0) return 0;
    
    const oldestRequest = Math.min(...this.requestTimes);
    const waitUntil = oldestRequest + 60000; // One minute after oldest request
    return Math.max(0, waitUntil - Date.now());
  }
  
  recordRequest() {
    this.requestTimes.push(Date.now());
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### Rate Limiting Best Practices

**Client Implementation Guidelines:**

1. **Respect Rate Limits**
   ```javascript
   // Check response headers for rate limit information
   const checkRateLimit = (response) => {
     const remaining = response.headers.get('X-RateLimit-Remaining');
     const resetTime = response.headers.get('X-RateLimit-Reset');
     
     if (remaining && parseInt(remaining) < 5) {
       console.warn('Approaching rate limit, slowing down requests');
     }
   };
   ```

2. **Implement Exponential Backoff**
   ```javascript
   class BackoffApiClient {
     async makeRequestWithBackoff(endpoint, options = {}, maxRetries = 3) {
       for (let attempt = 0; attempt <= maxRetries; attempt++) {
         try {
           const response = await this.makeRequest(endpoint, options);
           
           if (response.status === 429) { // Too Many Requests
             if (attempt === maxRetries) throw new Error('Rate limit exceeded');
             
             const backoffTime = Math.pow(2, attempt) * 1000; // Exponential backoff
             await this.sleep(backoffTime);
             continue;
           }
           
           return response;
         } catch (error) {
           if (attempt === maxRetries) throw error;
           await this.sleep(Math.pow(2, attempt) * 1000);
         }
       }
     }
   }
   ```

3. **Cache Responses When Appropriate**
   ```javascript
   class CachedApiClient {
     constructor() {
       this.cache = new Map();
       this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
     }
     
     async getCachedOrFetch(endpoint, options = {}) {
       const cacheKey = `${endpoint}:${JSON.stringify(options)}`;
       const cached = this.cache.get(cacheKey);
       
       if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
         return cached.data;
       }
       
       const response = await this.makeRequest(endpoint, options);
       const data = await response.json();
       
       this.cache.set(cacheKey, {
         data,
         timestamp: Date.now()
       });
       
       return data;
     }
   }
   ```

#### Server-Side Rate Limiting Recommendations

**Production Implementation Suggestions:**

1. **Use Redis for Distributed Rate Limiting**
   ```python
   # Example using Redis and FastAPI
   import redis
   from fastapi import HTTPException, Request
   
   redis_client = redis.Redis(host='localhost', port=6379, db=0)
   
   async def rate_limit_middleware(request: Request, call_next):
       client_ip = request.client.host
       user_id = getattr(request.state, 'user_id', None)
       
       # Use user ID if authenticated, otherwise IP
       key = f"rate_limit:{user_id or client_ip}"
       
       current_requests = redis_client.incr(key)
       if current_requests == 1:
           redis_client.expire(key, 60)  # 1 minute window
       
       if current_requests > 60:  # 60 requests per minute
           raise HTTPException(
               status_code=429,
               detail="Rate limit exceeded"
           )
       
       response = await call_next(request)
       response.headers["X-RateLimit-Remaining"] = str(60 - current_requests)
       return response
   ```

2. **Different Limits for Different Endpoints**
   ```python
   RATE_LIMITS = {
       '/books/read/': {'requests': 10, 'window': 60},      # 10/minute for downloads
       '/books/purchase/': {'requests': 5, 'window': 60},   # 5/minute for purchases
       '/books/': {'requests': 60, 'window': 60},           # 60/minute for browsing
   }
   ```

### CORS Policy and Cross-Origin Request Handling

The API implements Cross-Origin Resource Sharing (CORS) to control which web applications can access the API from browsers. Proper CORS configuration is essential for security and functionality.

#### Current CORS Configuration

**Production CORS Settings:**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bookstore.example.com",      # Main web application
        "https://admin.bookstore.example.com", # Admin dashboard
        "https://mobile.bookstore.example.com" # Mobile web app
    ],
    allow_credentials=True,  # Allow cookies and authorization headers
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
        "X-Requested-With",
        "X-CSRF-Token"
    ],
    expose_headers=[
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset"
    ]
)
```

**Development CORS Settings:**

```python
# More permissive for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",    # React development server
        "http://localhost:8080",    # Vue development server
        "http://127.0.0.1:3000",    # Alternative localhost
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### CORS Security Best Practices

**1. Restrict Origins in Production**

```python
# ❌ Never use in production
allow_origins=["*"]  # Allows any origin

# ✅ Use specific origins
allow_origins=[
    "https://yourdomain.com",
    "https://app.yourdomain.com"
]
```

**2. Validate Origin Headers**

```python
# Custom CORS validation middleware
async def validate_cors_origin(request: Request, call_next):
    origin = request.headers.get("origin")
    allowed_origins = [
        "https://bookstore.example.com",
        "https://admin.bookstore.example.com"
    ]
    
    if origin and origin not in allowed_origins:
        return JSONResponse(
            status_code=403,
            content={"detail": "Origin not allowed"}
        )
    
    response = await call_next(request)
    return response
```

**3. Handle Preflight Requests Properly**

```python
# Ensure OPTIONS requests are handled correctly
@app.options("/{path:path}")
async def options_handler(request: Request):
    return Response(
        status_code=200,
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Max-Age": "86400"  # Cache preflight for 24 hours
        }
    )
```

#### Client-Side CORS Handling

**Proper Request Configuration:**

```javascript
// Ensure credentials are included for authenticated requests
const apiClient = {
  async makeRequest(url, options = {}) {
    const defaultOptions = {
      credentials: 'include',  // Include cookies and auth headers
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    
    return fetch(url, mergedOptions);
  }
};
```

**Handle CORS Errors Gracefully:**

```javascript
class CorsAwareApiClient {
  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(endpoint, options);
      return response;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('CORS')) {
        throw new Error(
          'CORS error: This request is not allowed from your domain. ' +
          'Please contact support if this is unexpected.'
        );
      }
      throw error;
    }
  }
}
```

#### CORS Troubleshooting Guide

**Common CORS Issues and Solutions:**

1. **"Access to fetch at '...' from origin '...' has been blocked by CORS policy"**
   - **Cause**: Origin not in allowed origins list
   - **Solution**: Add origin to CORS configuration or use proper domain

2. **"Request header field authorization is not allowed"**
   - **Cause**: Authorization header not in allowed headers
   - **Solution**: Add "Authorization" to `allow_headers`

3. **"Credentials flag is 'true', but the 'Access-Control-Allow-Credentials' header is ''"**
   - **Cause**: `allow_credentials=False` in CORS config
   - **Solution**: Set `allow_credentials=True`

4. **Preflight requests failing**
   - **Cause**: OPTIONS method not properly handled
   - **Solution**: Ensure OPTIONS requests return proper CORS headers

### Security Headers and Their Purposes

The API automatically applies comprehensive security headers to protect against common web vulnerabilities. Understanding these headers helps developers implement complementary client-side security measures.

#### Implemented Security Headers

**1. Strict-Transport-Security (HSTS)**

```http
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

**Purpose**: Forces browsers to use HTTPS for all future requests to the domain
**Protection**: Prevents protocol downgrade attacks and cookie hijacking
**Configuration**:
- `max-age=63072000`: 2 years in seconds
- `includeSubDomains`: Apply to all subdomains
- `preload`: Eligible for browser preload lists

**Client Implementation**:
```javascript
// Ensure all API calls use HTTPS
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.bookstore.example.com'
  : 'http://localhost:8000';
```

**2. X-Content-Type-Options**

```http
X-Content-Type-Options: nosniff
```

**Purpose**: Prevents browsers from MIME-type sniffing
**Protection**: Stops execution of malicious content disguised as other file types
**Impact**: Browsers will only execute files with correct Content-Type headers

**Client Considerations**:
```javascript
// Ensure proper content types in requests
fetch('/api/books', {
  headers: {
    'Content-Type': 'application/json',  // Explicit content type
    'Accept': 'application/json'
  }
});
```

**3. X-Frame-Options**

```http
X-Frame-Options: DENY
```

**Purpose**: Prevents the API from being embedded in frames/iframes
**Protection**: Mitigates clickjacking attacks
**Options**:
- `DENY`: Never allow framing
- `SAMEORIGIN`: Allow framing from same origin only
- `ALLOW-FROM uri`: Allow framing from specific URI

**4. Referrer-Policy**

```http
Referrer-Policy: no-referrer-when-downgrade
```

**Purpose**: Controls how much referrer information is sent with requests
**Protection**: Prevents sensitive information leakage through referrer headers
**Behavior**: Sends full referrer for HTTPS→HTTPS, no referrer for HTTPS→HTTP

**Alternative Policies**:
```http
Referrer-Policy: strict-origin-when-cross-origin  # More restrictive
Referrer-Policy: no-referrer                      # Most restrictive
```

**5. Permissions-Policy (Feature Policy)**

```http
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Purpose**: Controls which browser features can be used
**Protection**: Prevents unauthorized access to device capabilities
**Configuration**: Disables geolocation, microphone, and camera access

**6. X-XSS-Protection**

```http
X-XSS-Protection: 0
```

**Purpose**: Controls browser XSS filtering (legacy header)
**Modern Approach**: Disabled (`0`) because modern CSP is more effective
**Note**: Modern browsers ignore this header in favor of Content Security Policy

#### Content Security Policy (CSP) Recommendations

**Recommended CSP for API Consumers:**

```html
<!-- Add to HTML head for web applications -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  connect-src 'self' https://api.bookstore.example.com https://kahf-bookstore.us.auth0.com;
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' https:;
  frame-ancestors 'none';
">
```

**CSP for API Responses (Future Enhancement):**

```python
# Potential addition to security headers middleware
def add_csp_header(headers):
    headers['Content-Security-Policy'] = (
        "default-src 'none'; "
        "frame-ancestors 'none'; "
        "base-uri 'none';"
    )
```

#### Security Headers Validation

**Client-Side Header Verification:**

```javascript
class SecurityHeaderValidator {
  validateResponse(response) {
    const requiredHeaders = [
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy'
    ];
    
    const missingHeaders = requiredHeaders.filter(
      header => !response.headers.has(header)
    );
    
    if (missingHeaders.length > 0) {
      console.warn('Missing security headers:', missingHeaders);
    }
    
    // Validate HSTS header
    const hsts = response.headers.get('strict-transport-security');
    if (hsts && !hsts.includes('max-age=')) {
      console.warn('Invalid HSTS header format');
    }
    
    return missingHeaders.length === 0;
  }
}
```

**Server-Side Header Testing:**

```python
# Test security headers in API tests
def test_security_headers():
    response = client.get("/health")
    
    assert response.status_code == 200
    assert "strict-transport-security" in response.headers
    assert "x-content-type-options" in response.headers
    assert "x-frame-options" in response.headers
    assert response.headers["x-content-type-options"] == "nosniff"
    assert response.headers["x-frame-options"] == "DENY"
```

### API Security Checklist for Developers

This comprehensive checklist helps developers ensure secure implementation when integrating with the Bookstore Backend API.

#### Authentication and Authorization

**✅ Token Management**
- [ ] Store JWT tokens securely (avoid localStorage)
- [ ] Implement automatic token refresh
- [ ] Handle token expiration gracefully
- [ ] Clear tokens on logout
- [ ] Validate token format before sending requests
- [ ] Never log or expose tokens in client code
- [ ] Use HTTPS for all authentication flows
- [ ] Implement proper error handling for 401/403 responses

**✅ OAuth2 Flow Implementation**
- [ ] Validate Auth0 callback responses
- [ ] Handle OAuth2 errors appropriately
- [ ] Implement CSRF protection for callback endpoints
- [ ] Validate state parameter in OAuth2 flow
- [ ] Store user information securely after authentication
- [ ] Implement proper logout flow

**✅ Role-Based Access Control**
- [ ] Check user roles before showing UI elements
- [ ] Handle role changes during active sessions
- [ ] Implement graceful degradation for insufficient permissions
- [ ] Cache role information appropriately
- [ ] Validate roles on both client and server side

#### API Request Security

**✅ Request Configuration**
- [ ] Always use HTTPS in production
- [ ] Include proper Content-Type headers
- [ ] Implement request timeout handling
- [ ] Add CSRF protection headers (X-Requested-With)
- [ ] Validate response content types
- [ ] Handle network errors gracefully
- [ ] Implement retry logic with exponential backoff

**✅ Data Validation**
- [ ] Validate all input data before sending
- [ ] Sanitize user input to prevent injection attacks
- [ ] Implement client-side validation (with server-side backup)
- [ ] Handle validation errors from API responses
- [ ] Use proper encoding for special characters
- [ ] Validate file uploads (if applicable)

**✅ Error Handling**
- [ ] Handle all HTTP status codes appropriately
- [ ] Implement user-friendly error messages
- [ ] Log errors for debugging (without sensitive data)
- [ ] Provide fallback behavior for API failures
- [ ] Handle rate limiting (429) responses
- [ ] Implement circuit breaker pattern for resilience

#### Data Protection

**✅ Sensitive Data Handling**
- [ ] Never store passwords or sensitive data locally
- [ ] Encrypt sensitive data in transit and at rest
- [ ] Implement proper data retention policies
- [ ] Handle PII according to privacy regulations
- [ ] Secure file downloads and prevent unauthorized access
- [ ] Implement proper session management

**✅ Client-Side Security**
- [ ] Implement Content Security Policy (CSP)
- [ ] Validate and sanitize all user inputs
- [ ] Protect against XSS attacks
- [ ] Implement proper CORS handling
- [ ] Use secure communication protocols
- [ ] Regularly update dependencies for security patches

#### Production Deployment

**✅ Environment Configuration**
- [ ] Use environment variables for configuration
- [ ] Separate development and production configurations
- [ ] Implement proper logging (without sensitive data)
- [ ] Configure monitoring and alerting
- [ ] Use secure deployment practices
- [ ] Implement health checks and monitoring

**✅ Performance and Reliability**
- [ ] Implement caching strategies
- [ ] Handle rate limiting appropriately
- [ ] Implement connection pooling
- [ ] Monitor API performance and errors
- [ ] Implement graceful degradation
- [ ] Plan for disaster recovery

#### Security Testing

**✅ Testing Checklist**
- [ ] Test authentication flows thoroughly
- [ ] Verify role-based access control
- [ ] Test error handling scenarios
- [ ] Validate input sanitization
- [ ] Test rate limiting behavior
- [ ] Verify CORS configuration
- [ ] Test security headers implementation
- [ ] Perform penetration testing

**✅ Code Review**
- [ ] Review all authentication code
- [ ] Check for hardcoded secrets or tokens
- [ ] Validate error handling implementation
- [ ] Review data validation logic
- [ ] Check for potential security vulnerabilities
- [ ] Verify logging doesn't expose sensitive data

#### Monitoring and Maintenance

**✅ Security Monitoring**
- [ ] Monitor for unusual authentication patterns
- [ ] Track failed authentication attempts
- [ ] Monitor API usage patterns
- [ ] Set up alerts for security events
- [ ] Regularly review access logs
- [ ] Implement automated security scanning

**✅ Maintenance**
- [ ] Keep dependencies updated
- [ ] Regularly rotate secrets and keys
- [ ] Review and update security policies
- [ ] Conduct regular security audits
- [ ] Update documentation with security changes
- [ ] Train team on security best practices

#### Compliance and Documentation

**✅ Documentation**
- [ ] Document security implementation
- [ ] Maintain incident response procedures
- [ ] Document data handling practices
- [ ] Keep security policies up to date
- [ ] Document API integration security requirements

**✅ Compliance**
- [ ] Ensure GDPR compliance (if applicable)
- [ ] Implement data retention policies
- [ ] Maintain audit trails
- [ ] Document privacy practices
- [ ] Implement user consent mechanisms (if required)

---

*Security is an ongoing process. Regularly review and update your security implementation as threats evolve and new best practices emerge.*
   - Database access logging and monitoring

2. **File System Security**
   - Restrict file system permissions
   - Regular backup of book files
   - Monitor disk usage and file integrity
   - Consider encryption at rest for sensitive content

3. **Network Security**
   - Use reverse proxy (nginx/Apache) with security headers
   - Implement rate limiting at infrastructure level
   - Configure firewall rules for API access
   - Monitor network traffic for anomalies

---

## Operational Guide

### Health Monitoring

The API provides health monitoring capabilities to ensure system availability and proper functioning.

#### Health Monitoring Implementation

The API implements comprehensive health monitoring through the `/health` endpoint (documented in the [System Endpoints](#system-endpoints) section). This endpoint provides real-time status information about the service and its dependencies.

**Monitoring Strategy:**
- **Service Health**: Basic API responsiveness and availability
- **Database Connectivity**: PostgreSQL connection status and query performance
- **Auth0 Integration**: Authentication service accessibility and response times
- **System Resources**: Memory usage, CPU utilization (when applicable)

**Health Check Frequency:**
- **Load Balancers**: Every 30 seconds
- **Monitoring Systems**: Every 60 seconds
- **Alerting Systems**: Every 2-5 minutes with escalation policies

**Response Time Expectations:**
- **Normal Operation**: < 100ms response time
- **Degraded Performance**: 100ms - 1000ms (with warnings)
- **Service Issues**: > 1000ms or timeout (alerts triggered)

### Configuration

The API uses environment variables for configuration management. All sensitive configuration should be managed through environment variables rather than hardcoded values.

#### Required Environment Variables

**Database Configuration:**
```bash
# PostgreSQL database connection
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/kahf
DB_POOL_SIZE=10                    # Connection pool size (default: 10)
DB_MAX_OVERFLOW=20                 # Max overflow connections (default: 20)
DB_TIMEOUT=30                      # Connection timeout in seconds (default: 30)
```

**Auth0 Configuration:**
```bash
# Auth0 OAuth2 settings
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret
AUTH0_DOMAIN=your_domain.auth0.com
AUTH0_AUDIENCE=https://your_domain.auth0.com/api/v2/
AUTH0_CALLBACK_URL=http://localhost:8000/auth/callback
AUTH0_ALGORITHMS=RS256              # JWT signing algorithm (default: RS256)
AUTH_REDIRECT_URI=http://localhost:8000/auth/callback
```

**Security Configuration:**
```bash
# Session and security settings
SESSION_SECRET=your_very_secret_session_key_here
PUBLIC_EXPONENT=65537              # RSA public exponent (default: 65537)
KEY_SIZE=3072                      # RSA key size (default: 3072)
```

#### Configuration Validation

**Startup Validation:**
- All required environment variables are validated at application startup
- Missing required variables will cause the application to fail to start
- Invalid database URLs will be detected during database connection initialization

**Configuration Security:**
- Never commit `.env` files containing real credentials to version control
- Use different configurations for development, staging, and production environments
- Rotate secrets regularly, especially `SESSION_SECRET` and Auth0 credentials

**Environment-Specific Settings:**

**Development Environment:**
```bash
# Development-specific settings
AUTH0_CALLBACK_URL=http://localhost:8000/auth/callback
AUTH_REDIRECT_URI=http://localhost:8000/auth/callback
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/kahf_dev
```

**Production Environment:**
```bash
# Production-specific settings (use HTTPS)
AUTH0_CALLBACK_URL=https://api.yourdomain.com/auth/callback
AUTH_REDIRECT_URI=https://api.yourdomain.com/auth/callback
DATABASE_URL=postgresql+asyncpg://user:password@prod-db:5432/kahf_prod
```

### Logging

The API implements a comprehensive logging system with daily log rotation and configurable retention policies.

#### Logging Configuration

**Log File Location:**
- **Directory**: `./logs/` (relative to application root)
- **File Format**: `YYYY-MM-DD.log` (e.g., `2024-01-15.log`)
- **Rotation**: Daily at midnight UTC
- **Retention**: 7 days (configurable)

**Log Levels:**
- **DEBUG**: Detailed diagnostic information (development only)
- **INFO**: General operational messages and important events
- **WARNING**: Potentially harmful situations that don't stop operation
- **ERROR**: Error events that don't stop the application
- **CRITICAL**: Serious errors that may cause application termination

#### Key Events Logged

**Authentication Events:**
```
2024-01-15 10:30:15,123 INFO [app] OAuth2 flow initiated for callback URL: http://localhost:8000/auth/callback
2024-01-15 10:30:45,456 INFO [app] User authenticated successfully: auth0|507f1f77bcf86cd799439011
2024-01-15 10:30:45,789 INFO [app] User roles retrieved: ['admin'] for user auth0|507f1f77bcf86cd799439011
2024-01-15 10:31:00,012 WARNING [app] Token refresh attempted with expired refresh token
2024-01-15 10:31:15,345 ERROR [app] Authentication failed: Invalid authorization code
```

**Book Access Events:**
```
2024-01-15 11:00:00,123 INFO [app] Book purchase completed: user=auth0|507f1f77bcf86cd799439011, book_id=1
2024-01-15 11:05:30,456 INFO [app] DRM check passed: user=auth0|507f1f77bcf86cd799439011, book_id=1
2024-01-15 11:05:35,789 INFO [app] Book file accessed: user=auth0|507f1f77bcf86cd799439011, book_id=1, file=/path/to/book.pdf
2024-01-15 11:10:00,012 WARNING [app] DRM check failed: user=auth0|507f1f77bcf86cd799439011, book_id=2 (not owned)
2024-01-15 11:15:00,345 ERROR [app] File access denied: Invalid file path or file not found
```

**System Events:**
```
2024-01-15 08:00:00,123 INFO [app] Application startup completed
2024-01-15 08:00:01,456 INFO [app] Database connection pool initialized: size=10, max_overflow=20
2024-01-15 08:00:02,789 INFO [app] Auth0 JWKS keys loaded successfully
2024-01-15 12:00:00,012 INFO [app] Daily log rotation completed: old logs cleaned up
2024-01-15 23:59:59,345 INFO [app] Health check endpoint accessed: response_time=15ms
```

**Error Events:**
```
2024-01-15 14:30:00,123 ERROR [app] Database connection failed: connection timeout after 30s
2024-01-15 14:30:15,456 ERROR [app] Auth0 API request failed: rate limit exceeded
2024-01-15 14:30:30,789 CRITICAL [app] Unhandled exception in request processing: [stack trace]
```

#### Log Management

**Log Rotation:**
- Automatic daily rotation at midnight UTC
- Old log files are automatically cleaned up after retention period
- Thread-safe rotation prevents log loss during high-traffic periods

**Log Retention:**
- Default retention: 7 days
- Configurable through logger initialization
- Based on file modification time, not filename date

**Log Format:**
```
%(asctime)s %(levelname)s [%(name)s] %(message)s
```

**Example Log Entry:**
```
2024-01-15 10:30:15,123 INFO [app] User authenticated successfully: auth0|507f1f77bcf86cd799439011
```

### Database Schema

The API uses PostgreSQL with a well-defined schema optimized for book management and DRM protection.

#### Core Tables

**Books Table:**
```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    genre VARCHAR(100),
    description TEXT,
    filepath VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

**Table Details:**
- **Primary Key**: `id` (auto-incrementing integer)
- **Required Fields**: `title`, `filepath`
- **Optional Fields**: `author`, `genre`, `description`
- **Timestamps**: Automatic creation timestamp, manual update timestamp
- **File Path**: Stores absolute path to book file for DRM access

**Indexes:**
```sql
CREATE INDEX idx_books_title ON books(title);
```

**Purchases Table (DRM Core):**
```sql
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    book_id INTEGER NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_purchase_book FOREIGN KEY (book_id) 
        REFERENCES books(id) ON DELETE CASCADE,
    
    CONSTRAINT unique_user_book_purchase UNIQUE (user_id, book_id)
);
```

**Table Details:**
- **Primary Key**: `id` (auto-incrementing integer)
- **User Identification**: `user_id` stores Auth0 user ID (format: "auth0|identifier")
- **Book Reference**: Foreign key to books table with cascade delete
- **Purchase Tracking**: Automatic timestamp for purchase date
- **Uniqueness**: Prevents duplicate purchases (one purchase per user per book)

**DRM Indexes (Performance Critical):**
```sql
CREATE INDEX idx_purchases_user_id ON purchases(user_id);
CREATE INDEX idx_purchases_book_id ON purchases(book_id);
CREATE INDEX idx_purchases_user_book ON purchases(user_id, book_id);
```

#### Relationships and Constraints

**Foreign Key Relationships:**
- `purchases.book_id` → `books.id` (CASCADE DELETE)
  - When a book is deleted, all associated purchases are automatically removed
  - Maintains referential integrity for DRM checks

**Unique Constraints:**
- `purchases(user_id, book_id)`: Prevents duplicate purchases
  - Ensures each user can only purchase each book once
  - Critical for DRM integrity and business logic

**Data Integrity Rules:**
- Book titles cannot be null or empty
- File paths must be provided for all books
- User IDs must follow Auth0 format ("auth0|identifier")
- Purchase dates are automatically set and cannot be modified

#### Database Connection Management

**Connection Pool Configuration:**
```python
# Connection pool settings
pool_size=10           # Base number of connections
max_overflow=20        # Additional connections under load
pool_pre_ping=True     # Validates connections before use
```

**Connection Lifecycle:**
- **Session-per-request**: Each API request gets its own database session
- **Automatic Rollback**: Failed transactions are automatically rolled back
- **Connection Validation**: Stale connections are detected and replaced
- **Graceful Shutdown**: Connection pool is properly disposed on application shutdown

### Troubleshooting

Common operational issues and their resolution steps.

#### Authentication Issues

**Problem: "Invalid token" errors**

**Symptoms:**
- 401 Unauthorized responses on protected endpoints
- Users unable to access purchased books
- Token validation failures in logs

**Diagnosis Steps:**
1. Check if Auth0 domain is accessible:
   ```bash
   curl https://your-domain.auth0.com/.well-known/jwks.json
   ```
2. Verify environment variables:
   ```bash
   echo $AUTH0_DOMAIN
   echo $AUTH0_AUDIENCE
   ```
3. Check token expiration:
   - JWT tokens typically expire after 24 hours
   - Look for "exp" claim in token payload

**Resolution:**
- Ensure Auth0 configuration is correct
- Verify system clock is synchronized (JWT validation is time-sensitive)
- Check if Auth0 service is experiencing outages
- Refresh tokens if expired

**Problem: "Insufficient permissions" errors**

**Symptoms:**
- 403 Forbidden responses for admin endpoints
- Users cannot access role-protected features
- Role assignment failures

**Diagnosis Steps:**
1. Verify user roles in Auth0 dashboard
2. Check role assignment logs:
   ```bash
   grep "role" logs/$(date +%Y-%m-%d).log
   ```
3. Test role retrieval endpoint:
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
        http://localhost:8000/auth/roles/$USER_ID
   ```

**Resolution:**
- Assign appropriate roles through Auth0 dashboard or API
- Verify Auth0 Management API permissions
- Check if role IDs match configuration

#### Database Connection Issues

**Problem: Database connection failures**

**Symptoms:**
- 500 Internal Server Error responses
- "Database connection failed" in logs
- Application startup failures

**Diagnosis Steps:**
1. Test database connectivity:
   ```bash
   psql $DATABASE_URL -c "SELECT 1;"
   ```
2. Check connection pool status:
   ```bash
   grep "connection" logs/$(date +%Y-%m-%d).log
   ```
3. Verify database server status:
   ```bash
   docker ps | grep postgres  # if using Docker
   ```

**Resolution:**
- Verify DATABASE_URL format and credentials
- Check if database server is running
- Increase connection timeout if network is slow
- Monitor connection pool usage and adjust pool_size if needed

**Problem: DRM check failures**

**Symptoms:**
- Users cannot access purchased books
- "DRM check failed" messages in logs
- 403 Forbidden on book file access

**Diagnosis Steps:**
1. Verify purchase record exists:
   ```sql
   SELECT * FROM purchases WHERE user_id = 'auth0|user_id' AND book_id = 1;
   ```
2. Check file path accessibility:
   ```bash
   ls -la /path/to/book/file.pdf
   ```
3. Review DRM logs:
   ```bash
   grep "DRM" logs/$(date +%Y-%m-%d).log
   ```

**Resolution:**
- Ensure purchase record exists in database
- Verify file paths are correct and accessible
- Check file permissions for book files
- Validate user ID format matches Auth0 format

#### Performance Issues

**Problem: Slow API responses**

**Symptoms:**
- Response times > 1 second
- Timeout errors from clients
- High CPU or memory usage

**Diagnosis Steps:**
1. Check health endpoint response time:
   ```bash
   time curl http://localhost:8000/health
   ```
2. Monitor database query performance:
   ```bash
   grep "slow query" logs/$(date +%Y-%m-%d).log
   ```
3. Check system resources:
   ```bash
   top -p $(pgrep -f "uvicorn")
   ```

**Resolution:**
- Optimize database queries and add indexes
- Increase connection pool size if needed
- Scale application horizontally
- Implement caching for frequently accessed data

#### Log Management Issues

**Problem: Log files not rotating or growing too large**

**Symptoms:**
- Single log file growing very large
- Disk space issues
- Old log files not being cleaned up

**Diagnosis Steps:**
1. Check log directory:
   ```bash
   ls -la logs/
   ```
2. Verify log rotation configuration
3. Check disk space:
   ```bash
   df -h
   ```

**Resolution:**
- Ensure application has write permissions to logs directory
- Verify log retention settings
- Manually clean up old logs if needed:
   ```bash
   find logs/ -name "*.log" -mtime +7 -delete
   ```

#### Common Error Codes and Solutions

**HTTP 401 - Unauthorized**
- **Cause**: Missing or invalid JWT token
- **Solution**: Obtain new token through OAuth2 flow
- **Prevention**: Implement automatic token refresh

**HTTP 403 - Forbidden**
- **Cause**: Valid token but insufficient permissions
- **Solution**: Assign appropriate roles to user
- **Prevention**: Implement proper role-based access control

**HTTP 404 - Not Found**
- **Cause**: Resource doesn't exist (book, user, etc.)
- **Solution**: Verify resource ID and existence
- **Prevention**: Validate input parameters

**HTTP 500 - Internal Server Error**
- **Cause**: Database connection, Auth0 API, or file system issues
- **Solution**: Check logs for specific error details
- **Prevention**: Implement proper error handling and monitoring

---

## Testing and Validation

This section provides comprehensive guidance for testing the Bookstore Backend API, including testing strategies, example test cases, and validation procedures to ensure proper integration and functionality.

### API Testing Strategies

#### Testing Approach Overview

The API testing strategy follows a multi-layered approach to ensure comprehensive coverage of functionality, security, and performance aspects:

**1. Unit Testing**
- Individual endpoint functionality
- Data model validation
- Authentication and authorization logic
- Error handling scenarios

**2. Integration Testing**
- End-to-end authentication flows
- Database interactions
- Auth0 integration
- DRM protection mechanisms

**3. Security Testing**
- JWT token validation
- Role-based access control
- DRM bypass attempts
- Input validation and sanitization

**4. Performance Testing**
- Response time benchmarks
- Concurrent user scenarios
- Database query optimization
- File serving performance

#### Recommended Testing Tools

**API Testing Tools:**
- **Postman**: Interactive API testing and collection management
- **curl**: Command-line testing and automation scripts
- **HTTPie**: User-friendly command-line HTTP client
- **Insomnia**: REST API client with environment management

**Automated Testing Frameworks:**
- **pytest**: Python testing framework for backend unit tests
- **pytest-asyncio**: Async testing support for FastAPI
- **httpx**: Async HTTP client for integration tests
- **pytest-mock**: Mocking support for external dependencies

**Load Testing Tools:**
- **Apache Bench (ab)**: Simple load testing
- **wrk**: Modern HTTP benchmarking tool
- **Locust**: Python-based load testing framework
- **Artillery**: Node.js load testing toolkit

**Security Testing Tools:**
- **OWASP ZAP**: Web application security scanner
- **Burp Suite**: Professional security testing platform
- **jwt.io**: JWT token debugging and validation
- **Auth0 Dashboard**: Role and permission management testing

### Authentication Flow Testing

#### Complete OAuth2 Flow Test Cases

**Test Case 1: Successful Authentication Flow**

**Objective:** Verify complete OAuth2 authentication flow from initiation to token usage

**Prerequisites:**
- Valid Auth0 configuration
- Test user account in Auth0
- Application callback URL configured

**Test Steps:**

1. **Initiate OAuth2 Flow**
```bash
# Step 1: Get authorization URL
curl -X GET "http://localhost:8000/auth/sso" \
  -H "Accept: application/json"

# Expected Response: 200 OK with auth_url
```

2. **Simulate User Authentication**
```bash
# Step 2: Extract auth_url from response and simulate browser redirect
# (In real testing, use browser automation or manual testing)
# Auth0 will redirect back with authorization code
```

3. **Exchange Authorization Code**
```bash
# Step 3: Exchange code for tokens (replace AUTHORIZATION_CODE)
curl -X GET "http://localhost:8000/auth/callback?code=AUTHORIZATION_CODE" \
  -H "Accept: application/json"

# Expected Response: 200 OK with access_token, refresh_token, and user info
```

4. **Use Access Token**
```bash
# Step 4: Test protected endpoint with token (replace ACCESS_TOKEN)
curl -X GET "http://localhost:8000/books/my-books" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Accept: application/json"

# Expected Response: 200 OK with user's books
```

**Expected Results:**
- All steps return appropriate HTTP status codes
- Tokens are valid JWT format
- Protected endpoints accept valid tokens
- User information is correctly retrieved

**Test Case 2: Invalid Authorization Code**

**Objective:** Verify proper error handling for invalid authorization codes

**Test Steps:**
```bash
# Test with invalid authorization code
curl -X GET "http://localhost:8000/auth/callback?code=invalid_code_123" \
  -H "Accept: application/json"

# Expected Response: 400 Bad Request
# Expected Body: {"detail": "Invalid authorization code"}
```

**Test Case 3: Expired Token Handling**

**Objective:** Verify API behavior with expired access tokens

**Test Steps:**
```bash
# Test with expired token (use jwt.io to create expired token for testing)
curl -X GET "http://localhost:8000/books/my-books" \
  -H "Authorization: Bearer EXPIRED_TOKEN" \
  -H "Accept: application/json"

# Expected Response: 401 Unauthorized
# Expected Body: {"detail": "Token has expired"}
```

**Test Case 4: Token Refresh Flow**

**Objective:** Verify refresh token functionality

**Test Steps:**
```bash
# Test token refresh (replace REFRESH_TOKEN)
curl -X GET "http://localhost:8000/auth/refresh-token" \
  -H "Authorization: Bearer REFRESH_TOKEN" \
  -H "Accept: application/json"

# Expected Response: 200 OK with new access_token and refresh_token
```

#### Role-Based Access Control Testing

**Test Case 5: User Role Access**

**Objective:** Verify user role can access appropriate endpoints

**Test Steps:**
```bash
# Test user endpoints (replace USER_TOKEN)
curl -X GET "http://localhost:8000/books/my-books" \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 200 OK

curl -X GET "http://localhost:8000/books/my-purchases" \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 200 OK

# Test admin endpoint with user token (should fail)
curl -X GET "http://localhost:8000/auth/roles/auth0|user123" \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 403 Forbidden
```

**Test Case 6: Admin Role Access**

**Objective:** Verify admin role can access elevated endpoints

**Test Steps:**
```bash
# Test admin endpoints (replace ADMIN_TOKEN)
curl -X GET "http://localhost:8000/auth/roles/auth0|user123" \
  -H "Authorization: Bearer ADMIN_TOKEN"
# Expected: 200 OK

# Test sudo admin endpoint with admin token (should fail)
curl -X POST "http://localhost:8000/auth/set-role/auth0|user123" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
# Expected: 403 Forbidden
```

**Test Case 7: Super Admin Role Access**

**Objective:** Verify super admin role has full access

**Test Steps:**
```bash
# Test sudo admin endpoints (replace SUDO_ADMIN_TOKEN)
curl -X POST "http://localhost:8000/auth/set-role/auth0|user123" \
  -H "Authorization: Bearer SUDO_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
# Expected: 200 OK

curl -X GET "http://localhost:8000/auth/roles/auth0|user123" \
  -H "Authorization: Bearer SUDO_ADMIN_TOKEN"
# Expected: 200 OK with updated roles
```

### DRM Testing Scenarios

#### Book Access Authorization Testing

**Test Case 8: Successful Book Access**

**Objective:** Verify authorized users can access owned books

**Prerequisites:**
- User has purchased a book
- Valid access token for the user

**Test Steps:**
```bash
# Step 1: Verify book ownership
curl -X GET "http://localhost:8000/books/check-ownership/1" \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 200 OK with ownership confirmation

# Step 2: Access book file
curl -X GET "http://localhost:8000/books/read/1" \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 200 OK with book file content or redirect
```

**Expected Results:**
- Ownership check returns positive confirmation
- Book file is accessible and served correctly
- Access is logged for audit purposes

**Test Case 9: Unauthorized Book Access Attempt**

**Objective:** Verify DRM protection prevents unauthorized access

**Test Steps:**
```bash
# Test access to non-owned book
curl -X GET "http://localhost:8000/books/check-ownership/999" \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 403 Forbidden

curl -X GET "http://localhost:8000/books/read/999" \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 403 Forbidden with DRM error message
```

**Test Case 10: Book Access Without Authentication**

**Objective:** Verify DRM protection requires authentication

**Test Steps:**
```bash
# Test book access without token
curl -X GET "http://localhost:8000/books/read/1"
# Expected: 401 Unauthorized

# Test ownership check without token
curl -X GET "http://localhost:8000/books/check-ownership/1"
# Expected: 401 Unauthorized
```

#### DRM Security Testing

**Test Case 11: Path Traversal Prevention**

**Objective:** Verify protection against path traversal attacks

**Test Steps:**
```bash
# Test various path traversal attempts
curl -X GET "http://localhost:8000/books/read/../../../etc/passwd" \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 400 Bad Request or 404 Not Found

curl -X GET "http://localhost:8000/books/read/1%2E%2E%2F%2E%2E%2Fconfig" \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 400 Bad Request or 404 Not Found
```

**Test Case 12: Direct File Access Prevention**

**Objective:** Verify files cannot be accessed directly without API

**Test Steps:**
```bash
# Attempt direct file access (should be blocked by server configuration)
curl -X GET "http://localhost:8000/private_books/1.pdf"
# Expected: 404 Not Found or 403 Forbidden

# Test with various file extensions
curl -X GET "http://localhost:8000/private_books/1.txt" \
  -H "Authorization: Bearer USER_TOKEN"
# Expected: 404 Not Found (if file doesn't exist) or proper DRM check
```

### Integration Testing Guidelines

#### Database Integration Testing

**Test Case 13: User Purchase Flow Integration**

**Objective:** Test complete purchase flow with database persistence

**Test Steps:**
```bash
# Step 1: Get available books
curl -X GET "http://localhost:8000/books/" \
  -H "Accept: application/json"

# Step 2: Purchase a book
curl -X POST "http://localhost:8000/books/purchase/1" \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json"

# Step 3: Verify purchase in user's library
curl -X GET "http://localhost:8000/books/my-purchases" \
  -H "Authorization: Bearer USER_TOKEN"

# Step 4: Verify ownership
curl -X GET "http://localhost:8000/books/check-ownership/1" \
  -H "Authorization: Bearer USER_TOKEN"
```

**Expected Results:**
- Purchase is recorded in database
- Book appears in user's purchase history
- Ownership verification returns positive result
- All database constraints are maintained

#### Auth0 Integration Testing

**Test Case 14: Auth0 Service Integration**

**Objective:** Verify proper integration with Auth0 services

**Test Environment Setup:**
```bash
# Verify Auth0 configuration
export AUTH0_DOMAIN="kahf-bookstore.us.auth0.com"
export AUTH0_CLIENT_ID="your_test_client_id"
export AUTH0_CLIENT_SECRET="your_test_client_secret"
export AUTH0_AUDIENCE="your_test_audience"
```

**Test Steps:**
```bash
# Test JWKS endpoint accessibility
curl -X GET "https://kahf-bookstore.us.auth0.com/.well-known/jwks.json"
# Expected: 200 OK with public keys

# Test Auth0 Management API connectivity (with management token)
curl -X GET "https://kahf-bookstore.us.auth0.com/api/v2/users/auth0|test_user" \
  -H "Authorization: Bearer MANAGEMENT_API_TOKEN"
# Expected: 200 OK with user data
```

#### Error Handling Integration Testing

**Test Case 15: Database Connection Failure**

**Objective:** Verify graceful handling of database connectivity issues

**Test Simulation:**
```bash
# Simulate database unavailability (stop database service)
# Then test API endpoints

curl -X GET "http://localhost:8000/books/" \
  -H "Accept: application/json"
# Expected: 500 Internal Server Error with appropriate error message

curl -X GET "http://localhost:8000/health"
# Expected: 503 Service Unavailable (if health check includes DB)
```

### API Validation Checklist

#### Pre-Deployment Validation

**Authentication and Authorization Checklist:**
- [ ] OAuth2 flow completes successfully for new users
- [ ] OAuth2 flow completes successfully for existing users
- [ ] JWT tokens are properly validated on all protected endpoints
- [ ] Role-based access control works for all role combinations
- [ ] Token refresh mechanism functions correctly
- [ ] Invalid tokens are properly rejected with 401 status
- [ ] Insufficient permissions return 403 status
- [ ] Auth0 integration handles API rate limits gracefully

**Endpoint Functionality Checklist:**
- [ ] All public endpoints are accessible without authentication
- [ ] All protected endpoints require valid authentication
- [ ] All admin endpoints require appropriate roles
- [ ] Request validation works for all input parameters
- [ ] Response formats match documented schemas
- [ ] Error responses include appropriate status codes and messages
- [ ] Pagination works correctly for list endpoints (if implemented)

**DRM and Security Checklist:**
- [ ] Book ownership verification works correctly
- [ ] Unauthorized users cannot access protected book files
- [ ] Path traversal attacks are prevented
- [ ] Direct file access is blocked
- [ ] Access attempts are properly logged
- [ ] File serving respects user permissions
- [ ] DRM errors provide appropriate feedback without exposing system details

**Data Validation Checklist:**
- [ ] User registration validates all required fields
- [ ] Password complexity requirements are enforced
- [ ] Email format validation works correctly
- [ ] Username uniqueness is enforced
- [ ] Email uniqueness is enforced
- [ ] Name field validation (alphanumeric only) works
- [ ] Database constraints prevent invalid data insertion
- [ ] Foreign key relationships are maintained

**Performance and Reliability Checklist:**
- [ ] Health endpoint responds within acceptable time limits
- [ ] API responses are within performance benchmarks
- [ ] Database queries are optimized
- [ ] File serving performance is acceptable
- [ ] Concurrent user scenarios work correctly
- [ ] Memory usage remains stable under load
- [ ] Error handling doesn't cause memory leaks

#### Quality Assurance Testing Protocol

**Automated Testing Requirements:**
```python
# Example pytest configuration for API testing
# tests/conftest.py

import pytest
import httpx
from fastapi.testclient import TestClient
from app.server import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers():
    # Mock or obtain valid JWT token for testing
    return {"Authorization": "Bearer test_token"}

@pytest.fixture
def admin_headers():
    # Mock or obtain admin JWT token for testing
    return {"Authorization": "Bearer admin_token"}
```

**Example Test Implementation:**
```python
# tests/test_authentication.py

def test_sso_endpoint(client):
    """Test OAuth2 initiation endpoint"""
    response = client.get("/auth/sso")
    assert response.status_code == 200
    assert "auth_url" in response.json()
    assert "kahf-bookstore.us.auth0.com" in response.json()["auth_url"]

def test_protected_endpoint_without_auth(client):
    """Test protected endpoint requires authentication"""
    response = client.get("/books/my-books")
    assert response.status_code == 401

def test_protected_endpoint_with_auth(client, auth_headers):
    """Test protected endpoint with valid authentication"""
    response = client.get("/books/my-books", headers=auth_headers)
    assert response.status_code == 200

def test_admin_endpoint_with_user_token(client, auth_headers):
    """Test admin endpoint rejects user token"""
    response = client.get("/auth/roles/test_user", headers=auth_headers)
    assert response.status_code == 403
```

**Manual Testing Checklist:**
- [ ] Complete OAuth2 flow using browser
- [ ] Test all endpoints using Postman or similar tool
- [ ] Verify error messages are user-friendly
- [ ] Test edge cases and boundary conditions
- [ ] Verify logging captures appropriate information
- [ ] Test with different user roles and permissions
- [ ] Validate response times under normal load
- [ ] Test file download functionality end-to-end

**Security Testing Checklist:**
- [ ] JWT token validation with various invalid tokens
- [ ] Role escalation attempts are blocked
- [ ] SQL injection attempts are prevented
- [ ] Path traversal attempts are blocked
- [ ] Cross-site scripting (XSS) prevention
- [ ] Cross-site request forgery (CSRF) protection
- [ ] Rate limiting effectiveness (if implemented)
- [ ] Input sanitization for all user inputs

#### Continuous Integration Testing

**CI/CD Pipeline Testing Requirements:**
```yaml
# Example GitHub Actions workflow for API testing
name: API Testing
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: test_password
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
    - uses: actions/checkout@v2
    - name: Set up Python
      uses: actions/setup-python@v2
      with:
        python-version: 3.10
    
    - name: Install dependencies
      run: |
        pip install poetry
        poetry install
    
    - name: Run tests
      run: |
        poetry run pytest tests/ -v --cov=app
    
    - name: Run security tests
      run: |
        poetry run bandit -r app/
    
    - name: Test API endpoints
      run: |
        poetry run python -m pytest tests/integration/ -v
```

**Deployment Validation Steps:**
1. **Pre-deployment Testing:**
   - Run full test suite in staging environment
   - Verify Auth0 configuration for production
   - Test database migrations and data integrity
   - Validate environment variable configuration

2. **Post-deployment Validation:**
   - Verify health endpoint accessibility
   - Test OAuth2 flow with production Auth0 settings
   - Validate SSL certificate and HTTPS configuration
   - Test key user workflows end-to-end

3. **Monitoring and Alerting:**
   - Set up monitoring for API response times
   - Configure alerts for authentication failures
   - Monitor DRM access patterns for anomalies
   - Track error rates and performance metrics

---

*This documentation is automatically generated and maintained. Last updated: November 16, 2024*
*For questions or issues, please contact the development team.*