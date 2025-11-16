# Authentication System

This directory contains the authentication system implementation for the KAHF Ebook Store Frontend.

## Components

### LoginButton
- Provides OAuth2 login functionality via Auth0
- Shows loading state during authentication
- Customizable styling via className prop

### LogoutButton  
- Handles logout from both Auth0 and local state
- Clears tokens and redirects to home page
- Shows loading state during logout process

### ProtectedRoute
- Wraps components that require authentication
- Supports role-based access control
- Shows appropriate fallback UI for unauthorized users
- Displays loading state while Auth0 initializes

### AuthProvider
- Wraps Auth0Provider with custom configuration
- Integrates Auth0 with Zustand store
- Handles automatic token management

## Services

### TokenManager
- Secure JWT token storage in memory
- Automatic token expiration checking
- Token refresh functionality
- Secure token clearing on logout

## Store

### AuthStore (Zustand)
- Manages authentication state
- Integrates with Auth0 user data
- Provides convenient hooks for auth operations
- Handles login/logout state transitions

## Hooks

### useAuthIntegration
- Syncs Auth0 state with Zustand store
- Handles automatic token refresh
- Manages user data transformation
- Provides error handling

### useRoleAccess
- Provides role-based access control utilities
- Checks user permissions
- Supports admin and sudo_admin roles
- Convenient role checking methods

## Features Implemented

✅ Auth0 OAuth2 Integration  
✅ Secure JWT Token Management  
✅ Role-based Access Control  
✅ Automatic Token Refresh  
✅ Zustand State Management  
✅ Loading States  
✅ Error Handling  
✅ Memory-based Token Storage  
✅ User Profile Integration  

## Usage Example

```tsx
import { LoginButton, LogoutButton, ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/store/authStore'
import { useRoleAccess } from '@/hooks/useRoleAccess'

function MyComponent() {
  const { isAuthenticated, user } = useAuth()
  const { isAdmin } = useRoleAccess()

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <LogoutButton />
          {isAdmin && <AdminPanel />}
        </div>
      ) : (
        <LoginButton />
      )}
    </div>
  )
}

// Protected route example
function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['admin', 'sudo_admin']}>
      <AdminContent />
    </ProtectedRoute>
  )
}
```

## Security Features

- Tokens stored in memory (not localStorage/sessionStorage)
- Automatic token refresh before expiration
- Role-based access control
- Secure logout that clears all tokens
- HTTPS enforcement in production
- Proper error handling without exposing sensitive data