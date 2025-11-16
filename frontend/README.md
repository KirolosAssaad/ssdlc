# BookVault Frontend

A modern, secure ebook store frontend with DRM (Digital Rights Management) functionality built with React, Vite, and Tailwind CSS.

## Features

### 🔐 Security & DRM
- **Advanced DRM Protection**: All ebooks are protected by digital rights management
- **Secure Authentication**: OAuth2 with Auth0 integration
- **JWT Token Management**: Automatic token refresh and secure storage
- **Ownership Verification**: Server-side verification before file access

### 📚 Book Management
- **Browse Catalog**: Explore thousands of available ebooks
- **Advanced Search**: Search by title, author, or genre
- **Smart Filtering**: Filter books by genre and author
- **Personal Library**: Manage your purchased books
- **Instant Downloads**: Secure, DRM-protected file downloads

### 🎨 User Experience
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with custom color palette
- **Fast Performance**: Optimized with Vite and React 19
- **Accessibility**: Built with accessibility best practices

## Color Palette

The application uses a warm, book-inspired color scheme:
- **Cream**: `#f3ebde` - Primary background and light elements
- **Brown**: `#964722` - Primary brand color and accents
- **Dark Brown**: `#39231f` - Text and dark elements

## Technology Stack

- **React 19** - Modern React with latest features
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful, customizable icons
- **Headless UI** - Unstyled, accessible UI components

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm package manager

### Installation

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   # or
   pnpm install
   ```

2. **Configure environment**:
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
# or
pnpm build
```

## Project Structure

```
frontend/
├── public/
│   ├── book-icon.svg          # Custom favicon
│   └── ...
├── src/
│   ├── components/
│   │   ├── Books/
│   │   │   ├── BookCard.jsx   # Individual book display
│   │   │   └── BookGrid.jsx   # Grid layout for books
│   │   ├── Layout/
│   │   │   ├── Header.jsx     # Navigation header
│   │   │   ├── Footer.jsx     # Site footer
│   │   │   └── Layout.jsx     # Main layout wrapper
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication state management
│   ├── pages/
│   │   ├── Home.jsx          # Landing page
│   │   ├── Login.jsx         # Authentication page
│   │   ├── Catalog.jsx       # Book catalog with search/filter
│   │   ├── Library.jsx       # User's personal library
│   │   ├── BookDetail.jsx    # Individual book details
│   │   └── Search.jsx        # Search results page
│   ├── services/
│   │   └── api.js            # API client and endpoints
│   ├── App.jsx               # Main application component
│   ├── main.jsx              # Application entry point
│   └── index.css             # Global styles and Tailwind imports
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies and scripts
```

## Key Components

### Authentication Flow
1. **Login Initiation**: User clicks "Sign In" → redirected to Auth0
2. **OAuth Callback**: Auth0 redirects back with authorization code
3. **Token Exchange**: Frontend exchanges code for JWT tokens
4. **Secure Storage**: Tokens stored in localStorage with automatic refresh

### DRM Protection
1. **Ownership Check**: Server verifies user owns the book
2. **Secure Download**: Files served only to authorized users
3. **Access Logging**: All access attempts are logged for security
4. **File Protection**: Books are served with appropriate security headers

### Book Management
- **Public Catalog**: Browse all available books without authentication
- **Search & Filter**: Advanced search with genre and author filtering
- **Purchase Flow**: Secure book purchasing with immediate access
- **Personal Library**: View and download owned books

## API Integration

The frontend integrates with the BookVault Backend API:

### Authentication Endpoints
- `GET /auth/sso` - Initiate OAuth2 flow
- `GET /auth/callback` - Handle OAuth2 callback
- `GET /auth/user` - Get current user info
- `GET /auth/refresh-token` - Refresh access token

### Book Endpoints
- `GET /books/` - Get all books (public)
- `GET /books/{id}` - Get specific book (public)
- `GET /books/my-books` - Get user's owned books
- `POST /books/purchase/{id}` - Purchase a book
- `GET /books/read/{id}` - Download book (DRM protected)
- `GET /books/search` - Search books
- `GET /books/filter/author/{author}` - Filter by author
- `GET /books/filter/genre/{genre}` - Filter by genre

## Security Features

### Client-Side Security
- **Token Management**: Automatic refresh and secure storage
- **Route Protection**: Protected routes require authentication
- **Input Validation**: Client-side validation for all forms
- **XSS Prevention**: Proper input sanitization

### DRM Implementation
- **Ownership Verification**: Check ownership before showing download options
- **Secure Downloads**: Files downloaded through authenticated API calls
- **Access Control**: UI elements hidden/shown based on ownership status
- **Error Handling**: Graceful handling of unauthorized access attempts

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow React best practices
- Implement proper error boundaries
- Use TypeScript-style prop validation (comments)

### State Management
- Use React Context for global state (authentication)
- Local state for component-specific data
- Proper cleanup of effects and subscriptions

### Performance
- Lazy loading for routes (can be implemented)
- Optimized images and assets
- Efficient re-rendering with proper dependencies
- Caching of API responses where appropriate

## Deployment

### Environment Variables
Set the following environment variables for production:
```env
VITE_API_BASE_URL=https://your-api-domain.com
```

### Build Process
1. Install dependencies: `npm install`
2. Build for production: `npm run build`
3. Deploy the `dist` folder to your hosting service

### Hosting Recommendations
- **Vercel**: Automatic deployments with Git integration
- **Netlify**: Easy static site hosting with form handling
- **AWS S3 + CloudFront**: Scalable hosting with CDN
- **GitHub Pages**: Free hosting for open source projects

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and test thoroughly
4. Commit with descriptive messages: `git commit -m "Add new feature"`
5. Push to your branch: `git push origin feature/new-feature`
6. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the API documentation in `backend/API_DOCUMENTATION.md`
- Review the component documentation in source files
- Create an issue in the repository for bugs or feature requests

---

**BookVault** - Secure Digital Reading Experience