# BookVault - Digital Ebook Store

A modern React-based ebook store application that allows users to browse, purchase, and download digital books with device registration for secure access.

## Features

### 🏠 Landing Page
- Browse available books without authentication
- Search and filter functionality by title, author, and genre
- Responsive book grid with detailed information
- Call-to-action for user registration

### 🔐 Authentication System
- **Login Page**: Secure user authentication with email/password
- **Signup Page**: User registration with form validation
- **Forgot Password**: Password reset functionality with email verification

### 👤 User Account Management
- **Profile Tab**: View and edit personal information
- **Library Tab**: Access purchased books and download options
- **Settings Tab**: Device management and account security
- Account statistics and purchase history

### 📚 Book Management
- Book cards with cover images, ratings, and descriptions
- Purchase functionality for authenticated users
- Download access for registered devices
- One-device restriction policy

### 🎨 Design System
- Custom color palette: `#f3ebde`, `#39231f`, `#964722`, `#f1bc72`
- Responsive design with mobile-first approach
- Consistent component styling and interactions
- Modern UI with smooth transitions and hover effects

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios with interceptors
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Package Manager**: pnpm

## Project Structure

```
src/
├── api/
│   ├── services/
│   │   ├── authService.ts
│   │   ├── bookService.ts
│   │   └── userService.ts
│   ├── config.ts
│   ├── types.ts
│   └── index.ts
├── components/
│   ├── Layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   └── BookCard/
│       └── BookCard.tsx
├── context/
│   └── AuthContext.tsx
├── data/
│   └── mockBooks.ts
├── pages/
│   ├── Landing/
│   │   └── Landing.tsx
│   ├── Auth/
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   └── ForgotPassword.tsx
│   └── Account/
│       └── Account.tsx
├── styles/
│   └── globals.css
├── types/
│   └── index.ts
├── utils/
│   └── errorHandler.ts
├── App.tsx
└── main.tsx
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager

### Installation

1. Navigate to the frontend directory:
```bash
cd ssdlc-frontent
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Configure your API endpoint in `.env`:
```bash
VITE_API_BASE_URL=http://localhost:3000/api
```

5. Start the development server:
```bash
pnpm dev
```

6. Open your browser and visit `http://localhost:5173`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint

## Key Features Implementation

### Authentication Flow
- Context-based state management for user authentication
- Protected routes for authenticated-only pages
- Persistent login state using localStorage
- Form validation and error handling

### Device Registration
- One-device policy enforcement
- Device management in user settings
- Secure book download access

### Responsive Design
- Mobile-first CSS approach
- Flexible grid layouts
- Adaptive navigation and components

### Mock Data
- Sample book collection with realistic data
- User authentication simulation
- Purchase and library management

## Future Enhancements

- Backend API integration
- Real payment processing
- Advanced search and filtering
- Book recommendations
- Reading progress tracking
- Social features (reviews, ratings)
- Multi-language support

## Color Palette

- **Cream**: `#f3ebde` - Background and light elements
- **Dark Brown**: `#39231f` - Primary text and headers
- **Medium Brown**: `#964722` - Primary buttons and accents
- **Gold**: `#f1bc72` - Secondary buttons and highlights
## API Inte
gration

### Architecture
The application uses a service-based architecture for API communication:

- **Axios Configuration**: Centralized HTTP client with interceptors
- **Service Layer**: Separate services for auth, books, and user management
- **Mock Fallbacks**: All API calls include mock data fallbacks for development
- **Error Handling**: Comprehensive error handling with user-friendly messages

### API Services

#### AuthService
- `login(credentials)` - User authentication
- `signup(userData)` - User registration
- `forgotPassword(email)` - Password reset request
- `logout()` - User logout
- `getCurrentUser()` - Get current user from storage
- `isAuthenticated()` - Check authentication status

#### BookService
- `getBooks(params)` - Fetch books with filtering and pagination
- `getBookById(id)` - Get single book details
- `purchaseBook(data)` - Purchase a book
- `getDownloadUrl(bookId)` - Get download URL for purchased book
- `getUserPurchasedBooks()` - Get user's purchased books

#### UserService
- `updateProfile(data)` - Update user profile
- `registerDevice(data)` - Register device for downloads
- `unregisterDevice()` - Unregister current device
- `changePassword(current, new)` - Change user password
- `deleteAccount()` - Delete user account

### Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Environment
VITE_NODE_ENV=development

# App Configuration
VITE_APP_NAME=BookVault
VITE_APP_VERSION=1.0.0
```

### Mock Data Fallbacks

All API services include mock data fallbacks that:
- Simulate realistic API response times
- Provide consistent data structure
- Enable full application testing without backend
- Log warnings when using fallback data
- Maintain state in localStorage for persistence

### Error Handling

The application includes comprehensive error handling:
- HTTP status code mapping
- Validation error display
- Network error recovery
- User-friendly error messages
- Automatic token refresh handling