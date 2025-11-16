# API Service Documentation

## Overview

The API Service provides a comprehensive HTTP client for interacting with the KAHF Ebook Store backend API. It includes authentication handling, error management, retry logic, and full TypeScript support.

## Features

- **Authentication Integration**: Seamless integration with Auth0 tokens via TokenManager
- **Error Handling**: Comprehensive error handling with custom ApiServiceError class
- **Retry Logic**: Exponential backoff retry for transient failures
- **TypeScript Support**: Full type safety with proper interfaces
- **React Query Integration**: Custom hooks for optimal caching and state management

## Basic Usage

### Direct API Service Usage

```typescript
import apiService from '@/services/api'

// Get all books
const books = await apiService.getBooks()

// Search books
const searchResults = await apiService.searchBooks('fiction')

// Purchase a book (requires authentication)
const purchaseResult = await apiService.purchaseBook(123)
```

### Using React Query Hooks (Recommended)

```typescript
import { useBooks, usePurchaseBook } from '@/hooks/useApiService'

function BookCatalog() {
  const { data: books, isLoading, error } = useBooks()
  const purchaseBook = usePurchaseBook()

  const handlePurchase = (bookId: number) => {
    purchaseBook.mutate(bookId)
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {books?.map(book => (
        <div key={book.id}>
          <h3>{book.title}</h3>
          <button onClick={() => handlePurchase(book.id)}>
            Purchase
          </button>
        </div>
      ))}
    </div>
  )
}
```

## API Methods

### Book Operations

- `getBooks()`: Fetch all available books
- `getBook(id)`: Fetch a specific book by ID
- `searchBooks(query)`: Search books by title, author, or genre
- `filterBooksByAuthor(author)`: Filter books by author
- `filterBooksByGenre(genre)`: Filter books by genre
- `filterBooks(filters)`: Filter books with multiple criteria

### User Operations (Requires Authentication)

- `getMyBooks()`: Get books owned by current user
- `getMyPurchases()`: Get purchase history
- `purchaseBook(bookId)`: Purchase a book
- `checkOwnership(bookId)`: Check if user owns a book

### DRM Operations (Requires Authentication)

- `getBookContent(bookId)`: Get protected book content as Blob

### Admin Operations (Requires Admin Role)

- `getUserRoles(userId)`: Get user roles
- `setUserRole(userId, role)`: Set user role
- `getUsers()`: Get all users
- `getSystemHealth()`: Get system health status

### Utility Methods

- `testConnection()`: Test API connectivity
- `getBaseURL()`: Get API base URL
- `isAuthenticated()`: Check authentication status

## Error Handling

The API service uses a custom `ApiServiceError` class that includes:

- `status`: HTTP status code
- `message`: Error message
- `details`: Additional error details

```typescript
try {
  const book = await apiService.getBook(123)
} catch (error) {
  if (error instanceof ApiServiceError) {
    console.log(`HTTP ${error.status}: ${error.message}`)
    console.log('Details:', error.details)
  }
}
```

## Retry Logic

The service automatically retries failed requests with:

- **Exponential backoff**: Delays increase exponentially
- **Jitter**: Random delay added to prevent thundering herd
- **Configurable**: Max retries, delays, and retryable status codes
- **Smart retry**: Only retries on transient errors (5xx, 408, 429)

## Authentication

Authentication is handled automatically through the TokenManager:

1. Tokens are stored securely in memory
2. Authorization headers are added automatically
3. Token expiration is checked before requests
4. 401 errors trigger re-authentication flow

## React Query Integration

Custom hooks provide:

- **Caching**: Intelligent caching with configurable stale times
- **Loading States**: Built-in loading and error states
- **Optimistic Updates**: Immediate UI updates for better UX
- **Cache Invalidation**: Automatic cache updates after mutations
- **Prefetching**: Preload data for better performance

## Configuration

The API service is configured through environment variables:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Testing

Use the integration test utilities for development:

```typescript
import { runAllIntegrationTests } from '@/services/apiServiceIntegrationTest'

// Run in development console
runAllIntegrationTests()
```

## Best Practices

1. **Use React Query hooks** instead of direct API calls in components
2. **Handle loading and error states** in your UI
3. **Implement optimistic updates** for better user experience
4. **Use prefetching** for data users are likely to need
5. **Handle authentication errors** gracefully
6. **Test API integration** during development

## Examples

### Book Catalog with Search

```typescript
function BookCatalog() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: books } = useSearchBooks(searchQuery)
  
  return (
    <div>
      <input 
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search books..."
      />
      {books?.map(book => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  )
}
```

### Purchase Flow with Optimistic Updates

```typescript
function PurchaseButton({ bookId }: { bookId: number }) {
  const { data: ownership } = useBookOwnership(bookId)
  const purchaseBook = usePurchaseBook()
  
  const handlePurchase = () => {
    purchaseBook.mutate(bookId, {
      onSuccess: () => {
        toast.success('Book purchased successfully!')
      },
      onError: (error) => {
        toast.error(`Purchase failed: ${error.message}`)
      }
    })
  }
  
  if (ownership?.owns_book) {
    return <button>Read Book</button>
  }
  
  return (
    <button 
      onClick={handlePurchase}
      disabled={purchaseBook.isPending}
    >
      {purchaseBook.isPending ? 'Purchasing...' : 'Purchase'}
    </button>
  )
}
```

### Admin Panel

```typescript
function AdminPanel() {
  const { data: users } = useUsers()
  const { data: health } = useSystemHealth()
  const setUserRole = useSetUserRole()
  
  return (
    <div>
      <h2>System Health</h2>
      <p>Status: {health?.status}</p>
      
      <h2>Users</h2>
      {users?.map(user => (
        <div key={user.id}>
          <span>{user.email}</span>
          <button onClick={() => setUserRole.mutate({ 
            userId: user.id, 
            role: 'admin' 
          })}>
            Make Admin
          </button>
        </div>
      ))}
    </div>
  )
}
```

This API service provides a robust foundation for all frontend-backend communication in the KAHF Ebook Store application.