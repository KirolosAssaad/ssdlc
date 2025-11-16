/**
 * React Query client configuration with optimized settings
 * for the KAHF Ebook Store application
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'
import { parseError, logError, ErrorType } from '@/utils/errorHandling'

// Create a custom error handler for queries
const handleQueryError = (error: unknown, query: any) => {
  const parsedError = parseError(error)
  
  // Log the error with context
  logError(parsedError, `Query: ${JSON.stringify(query.queryKey)}`)
  
  // Handle specific error types
  switch (parsedError.type) {
    case ErrorType.AUTHENTICATION:
      console.warn('Authentication error in query, user may need to re-login')
      // Don't show toast here as it will be handled by the error handler hook
      break
      
    case ErrorType.AUTHORIZATION:
      console.warn('Authorization error in query, user may lack permissions')
      break
      
    case ErrorType.NETWORK:
      console.warn('Network error in query, connection issues detected')
      break
      
    case ErrorType.SERVER:
      console.error('Server error in query')
      break
      
    case ErrorType.RATE_LIMIT:
      console.warn('Rate limit exceeded in query')
      break
      
    default:
      console.error('Unknown error in query:', parsedError.message)
  }
}

// Create a custom error handler for mutations
const handleMutationError = (error: unknown) => {
  const parsedError = parseError(error)
  
  // Log the error with context
  logError(parsedError, 'Mutation error')
  
  // Handle specific error types for mutations
  switch (parsedError.type) {
    case ErrorType.AUTHENTICATION:
      console.warn('Authentication error in mutation')
      break
      
    case ErrorType.AUTHORIZATION:
      console.warn('Authorization error in mutation')
      break
      
    case ErrorType.VALIDATION:
      console.warn('Validation error in mutation:', parsedError.details)
      break
      
    case ErrorType.NETWORK:
      console.warn('Network error in mutation')
      break
      
    case ErrorType.SERVER:
      console.error('Server error in mutation')
      break
      
    default:
      console.error('Unknown error in mutation:', parsedError.message)
  }
}

// Create query cache with error handling
const queryCache = new QueryCache({
  onError: handleQueryError,
})

// Create mutation cache with error handling
const mutationCache = new MutationCache({
  onError: handleMutationError,
})

// Create and configure the QueryClient
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time (now called gcTime) - how long data stays in cache
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry configuration
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        
        // Retry up to 3 times for other errors
        return failureCount < 3
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount if data is stale
      refetchOnMount: true,
      
      // Network mode - fail fast when offline
      networkMode: 'online',
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
})

// Query key factory for consistent query keys
export const createQueryKeys = {
  // Book-related keys
  books: {
    all: ['books'] as const,
    lists: () => [...createQueryKeys.books.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...createQueryKeys.books.lists(), { filters }] as const,
    details: () => [...createQueryKeys.books.all, 'detail'] as const,
    detail: (id: number) => [...createQueryKeys.books.details(), id] as const,
    search: (query: string) => [...createQueryKeys.books.all, 'search', query] as const,
    filter: (filters: Record<string, unknown>) => [...createQueryKeys.books.all, 'filter', filters] as const,
  },
  
  // User-related keys
  user: {
    all: ['user'] as const,
    books: () => [...createQueryKeys.user.all, 'books'] as const,
    purchases: () => [...createQueryKeys.user.all, 'purchases'] as const,
    ownership: (bookId: number) => [...createQueryKeys.user.all, 'ownership', bookId] as const,
  },
  
  // Admin-related keys
  admin: {
    all: ['admin'] as const,
    users: () => [...createQueryKeys.admin.all, 'users'] as const,
    userRoles: (userId: string) => [...createQueryKeys.admin.all, 'users', userId, 'roles'] as const,
    health: () => [...createQueryKeys.admin.all, 'health'] as const,
  },
  
  // API connectivity
  api: {
    connectivity: () => ['api', 'connectivity'] as const,
  },
}

// Helper function to invalidate related queries
export const invalidateRelatedQueries = {
  afterPurchase: (bookId: number) => {
    queryClient.invalidateQueries({ queryKey: createQueryKeys.user.books() })
    queryClient.invalidateQueries({ queryKey: createQueryKeys.user.purchases() })
    queryClient.invalidateQueries({ queryKey: createQueryKeys.user.ownership(bookId) })
  },
  
  afterAuth: () => {
    queryClient.invalidateQueries({ queryKey: createQueryKeys.user.all })
  },
  
  afterLogout: () => {
    queryClient.removeQueries({ queryKey: createQueryKeys.user.all })
    queryClient.removeQueries({ queryKey: createQueryKeys.admin.all })
  },
  
  afterRoleChange: (userId: string) => {
    queryClient.invalidateQueries({ queryKey: createQueryKeys.admin.userRoles(userId) })
    queryClient.invalidateQueries({ queryKey: createQueryKeys.admin.users() })
  },
}

// Prefetch helpers
export const prefetchHelpers = {
  book: (bookId: number) => {
    return queryClient.prefetchQuery({
      queryKey: createQueryKeys.books.detail(bookId),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  },
  
  ownership: (bookId: number) => {
    return queryClient.prefetchQuery({
      queryKey: createQueryKeys.user.ownership(bookId),
      staleTime: 1 * 60 * 1000, // 1 minute
    })
  },
  
  userBooks: () => {
    return queryClient.prefetchQuery({
      queryKey: createQueryKeys.user.books(),
      staleTime: 2 * 60 * 1000, // 2 minutes
    })
  },
}

// Cache management helpers
export const cacheHelpers = {
  getCachedBook: (bookId: number) => {
    return queryClient.getQueryData(createQueryKeys.books.detail(bookId))
  },
  
  getCachedOwnership: (bookId: number) => {
    return queryClient.getQueryData(createQueryKeys.user.ownership(bookId))
  },
  
  setCachedOwnership: (bookId: number, data: unknown) => {
    queryClient.setQueryData(createQueryKeys.user.ownership(bookId), data)
  },
  
  removeCachedOwnership: (bookId: number) => {
    queryClient.removeQueries({ queryKey: createQueryKeys.user.ownership(bookId) })
  },
  
  clearUserCache: () => {
    queryClient.removeQueries({ queryKey: createQueryKeys.user.all })
  },
  
  clearAllCache: () => {
    queryClient.clear()
  },
}

export default queryClient