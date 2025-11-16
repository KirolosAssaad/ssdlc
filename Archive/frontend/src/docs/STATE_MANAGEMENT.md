# State Management Documentation

## Overview

The KAHF Ebook Store Frontend implements a comprehensive state management system that combines React Query for server state management with Zustand for client state management. This hybrid approach provides optimal performance, caching, and user experience.

## Architecture

### Core Components

1. **React Query** - Server state management and caching
2. **Zustand** - Client state management
3. **Custom Hooks** - Integration layer between React Query and Zustand
4. **Data Synchronization** - Automatic sync between server and client state

### State Structure

```
Application State
├── Server State (React Query)
│   ├── Books Data
│   ├── User Books
│   ├── Purchases
│   ├── Ownership Information
│   └── Admin Data
└── Client State (Zustand)
    ├── Authentication State
    ├── Books State (local filtering, selection)
    ├── UI State (modals, notifications, loading)
    └── Purchases State (ownership cache, purchase status)
```

## Stores

### 1. Authentication Store (`authStore.ts`)

Manages user authentication state and token handling.

```typescript
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  // Actions...
}
```

**Key Features:**
- Secure token management
- Auth0 integration
- Automatic token refresh
- Error handling

### 2. Books Store (`booksStore.ts`)

Manages book-related client state including filters and selections.

```typescript
interface BooksState {
  books: Book[]
  myBooks: Book[]
  filteredBooks: Book[]
  filters: BookFilters
  searchQuery: string
  selectedBook: Book | null
  // Loading and error states...
}
```

**Key Features:**
- Book filtering and search
- Local book state management
- Loading and error state tracking
- Book selection management

### 3. UI Store (`uiStore.ts`)

Manages global UI state including modals, notifications, and loading states.

```typescript
interface UIState {
  isGlobalLoading: boolean
  isModalOpen: boolean
  notifications: Notification[]
  isMobileMenuOpen: boolean
  theme: 'light' | 'dark' | 'system'
  // Actions...
}
```

**Key Features:**
- Global loading states
- Modal management
- Notification system
- Theme management
- Mobile navigation state

### 4. Purchases Store (`purchasesStore.ts`)

Manages purchase-related state and ownership information.

```typescript
interface PurchasesState {
  purchases: Purchase[]
  ownedBooks: Set<number>
  ownershipCache: Map<number, OwnershipResponse>
  isPurchasing: Set<number>
  // Error states...
}
```

**Key Features:**
- Purchase tracking
- Ownership caching
- Purchase operation states
- Optimistic updates support

## Custom Hooks

### Integration Hooks (`useIntegratedBooks.ts`)

These hooks integrate React Query with Zustand stores for seamless state management:

- `useIntegratedBooks()` - Syncs book data between React Query and Zustand
- `useIntegratedMyBooks()` - Manages user's book collection
- `useIntegratedBookSearch()` - Handles book search with state sync
- `useIntegratedPurchaseBook()` - Manages book purchases with optimistic updates

### Data Synchronization (`useDataSync.ts`)

Provides centralized data synchronization and cache management:

```typescript
const {
  invalidateBooks,
  invalidateUserData,
  refreshAllData,
  syncAfterAuth,
  syncAfterPurchase,
  prefetchBook,
  getCachedBook
} = useDataSync()
```

### Loading and Error Management (`useLoadingError.ts`)

Centralized loading and error state management:

```typescript
const {
  setLoading,
  setError,
  handleAsyncOperation,
  retryFailedQueries,
  getBookLoadingStates,
  hasCriticalErrors
} = useLoadingError()
```

## React Query Configuration

### Query Client Setup

The query client is configured with optimized defaults:

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
})
```

### Query Keys

Consistent query key structure using a factory pattern:

```typescript
const createQueryKeys = {
  books: {
    all: ['books'] as const,
    detail: (id: number) => [...createQueryKeys.books.all, id] as const,
    search: (query: string) => [...createQueryKeys.books.all, 'search', query] as const,
  },
  user: {
    books: () => ['user', 'books'] as const,
    purchases: () => ['user', 'purchases'] as const,
    ownership: (bookId: number) => ['user', 'ownership', bookId] as const,
  },
}
```

## Optimistic Updates

### Purchase Flow

The purchase system implements optimistic updates for better UX:

1. **Optimistic Update**: Immediately update UI to show book as owned
2. **Server Request**: Send purchase request to backend
3. **Success**: Update with real server data
4. **Error**: Revert optimistic changes and show error

```typescript
const usePurchaseBook = () => {
  return useMutation({
    onMutate: async (bookId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.ownership(bookId) })
      
      // Snapshot previous value
      const previousOwnership = queryClient.getQueryData(queryKeys.ownership(bookId))
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.ownership(bookId), {
        ...previousOwnership,
        owns_book: true,
        purchase_date: new Date().toISOString(),
      })
      
      return { previousOwnership }
    },
    onError: (error, bookId, context) => {
      // Revert on error
      if (context?.previousOwnership) {
        queryClient.setQueryData(queryKeys.ownership(bookId), context.previousOwnership)
      }
    },
  })
}
```

## Cache Management

### Invalidation Strategy

Strategic cache invalidation ensures data consistency:

```typescript
// After successful purchase
invalidateRelatedQueries.afterPurchase(bookId)

// After authentication change
invalidateRelatedQueries.afterAuth()

// After logout
invalidateRelatedQueries.afterLogout()
```

### Prefetching

Proactive data loading for better performance:

```typescript
// Prefetch book details on hover
const handleBookHover = (bookId: number) => {
  prefetchHelpers.book(bookId)
}

// Prefetch ownership data
const handleOwnershipCheck = (bookId: number) => {
  prefetchHelpers.ownership(bookId)
}
```

## Error Handling

### Global Error Handling

Centralized error handling with user-friendly messages:

```typescript
const handleQueryError = (error: unknown) => {
  if (error instanceof Error) {
    if (error.message.includes('401')) {
      // Handle authentication errors
    } else if (error.message.includes('403')) {
      // Handle authorization errors
    } else if (error.message.includes('500')) {
      // Handle server errors
    }
  }
}
```

### Retry Logic

Smart retry logic with exponential backoff:

```typescript
retry: (failureCount, error) => {
  // Don't retry on 4xx errors (client errors)
  if (error instanceof Error && error.message.includes('4')) {
    return false
  }
  
  // Retry up to 3 times for other errors
  return failureCount < 3
},

retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
```

## Usage Examples

### Basic Book Management

```typescript
const BookCatalog = () => {
  // Use integrated hooks for automatic state sync
  useIntegratedBooks()
  
  // Access Zustand state directly
  const { books, isLoading, error } = useBooks()
  const { filters, updateFilters } = useBookFilters()
  
  // Handle search
  const handleSearch = (query: string) => {
    updateFilters({ searchQuery: query })
  }
  
  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      {isLoading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
      <BookGrid books={books} />
    </div>
  )
}
```

### Purchase Management

```typescript
const BookCard = ({ book }: { book: Book }) => {
  const { isBookOwned, isPurchasingBook } = usePurchaseOperations()
  const { purchaseBook } = useIntegratedPurchaseBook()
  
  const isOwned = isBookOwned(book.id)
  const isPurchasing = isPurchasingBook(book.id)
  
  const handlePurchase = () => {
    purchaseBook(book.id)
  }
  
  return (
    <div>
      <h3>{book.title}</h3>
      <p>{book.author}</p>
      {isOwned ? (
        <button>Read</button>
      ) : (
        <button 
          onClick={handlePurchase} 
          disabled={isPurchasing}
        >
          {isPurchasing ? 'Purchasing...' : 'Purchase'}
        </button>
      )}
    </div>
  )
}
```

### Error Handling

```typescript
const MyComponent = () => {
  const { handleAsyncOperation } = useLoadingError()
  
  const performAction = async () => {
    await handleAsyncOperation(
      () => apiService.someOperation(),
      {
        loadingMessage: 'Processing...',
        successMessage: 'Operation completed!',
        errorMessage: 'Operation failed',
      }
    )
  }
  
  return <button onClick={performAction}>Perform Action</button>
}
```

## Performance Considerations

### Optimization Strategies

1. **Selective Re-renders**: Zustand stores are designed to minimize re-renders
2. **Query Deduplication**: React Query automatically deduplicates identical requests
3. **Background Refetching**: Stale data is refetched in the background
4. **Optimistic Updates**: Immediate UI feedback for better perceived performance
5. **Prefetching**: Proactive data loading for anticipated user actions

### Memory Management

1. **Garbage Collection**: Unused queries are automatically garbage collected
2. **Cache Size Limits**: Configurable cache size limits prevent memory leaks
3. **Selective Invalidation**: Only invalidate specific queries when needed
4. **Cleanup on Unmount**: Automatic cleanup of subscriptions and timers

## Testing

### Testing Strategies

1. **Unit Tests**: Test individual hooks and store actions
2. **Integration Tests**: Test hook interactions with React Query
3. **Mock Data**: Use MSW for consistent API mocking
4. **State Assertions**: Verify state changes and side effects

### Example Test

```typescript
describe('useIntegratedBooks', () => {
  it('should sync books data between React Query and Zustand', async () => {
    const { result } = renderHook(() => useIntegratedBooks(), {
      wrapper: createTestWrapper(),
    })
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined()
    })
    
    // Verify Zustand store is updated
    const booksStore = useBooksStore.getState()
    expect(booksStore.books).toEqual(result.current.data)
  })
})
```

## Best Practices

### Do's

1. **Use Integrated Hooks**: Always use integrated hooks for server data
2. **Centralize Error Handling**: Use the error handling hooks for consistent UX
3. **Implement Optimistic Updates**: For better perceived performance
4. **Prefetch Strategically**: Anticipate user actions and prefetch data
5. **Handle Loading States**: Always provide loading feedback to users

### Don'ts

1. **Don't Mix State Sources**: Avoid mixing React Query and Zustand for the same data
2. **Don't Ignore Errors**: Always handle and display errors appropriately
3. **Don't Over-invalidate**: Be selective about cache invalidation
4. **Don't Forget Cleanup**: Ensure proper cleanup of subscriptions and timers
5. **Don't Block UI**: Use background refetching and optimistic updates

## Troubleshooting

### Common Issues

1. **Stale Data**: Check staleTime configuration and invalidation logic
2. **Memory Leaks**: Verify proper cleanup and garbage collection settings
3. **Race Conditions**: Use React Query's built-in race condition handling
4. **Authentication Errors**: Ensure proper token refresh and error handling
5. **Network Errors**: Implement proper retry logic and offline handling

### Debugging Tools

1. **React Query Devtools**: Inspect query state and cache
2. **Zustand Devtools**: Monitor store state changes
3. **Network Tab**: Verify API requests and responses
4. **Console Logging**: Strategic logging for debugging state changes

This state management system provides a robust foundation for the KAHF Ebook Store Frontend, ensuring optimal performance, user experience, and maintainability.