/**
 * Custom hooks for using the API service with React Query
 * These hooks provide proper caching, loading states, and error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiService from '@/services/api'
import type { BookFilters, OwnershipResponse } from '@/types'

// Query keys for React Query caching
export const queryKeys = {
  books: ['books'] as const,
  book: (id: number) => ['books', id] as const,
  searchBooks: (query: string) => ['books', 'search', query] as const,
  filterBooks: (filters: BookFilters) => ['books', 'filter', filters] as const,
  myBooks: ['user', 'books'] as const,
  myPurchases: ['user', 'purchases'] as const,
  ownership: (bookId: number) => ['user', 'ownership', bookId] as const,
  userRoles: (userId: string) => ['admin', 'users', userId, 'roles'] as const,
  systemHealth: ['admin', 'health'] as const,
  users: ['admin', 'users'] as const,
}

// =============================================================================
// BOOK QUERIES
// =============================================================================

/**
 * Hook to fetch all books
 */
export const useBooks = () => {
  return useQuery({
    queryKey: queryKeys.books,
    queryFn: () => apiService.getBooks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

/**
 * Hook to fetch a specific book
 */
export const useBook = (id: number) => {
  return useQuery({
    queryKey: queryKeys.book(id),
    queryFn: () => apiService.getBook(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
  })
}

/**
 * Hook to search books
 */
export const useSearchBooks = (query: string) => {
  return useQuery({
    queryKey: queryKeys.searchBooks(query),
    queryFn: () => apiService.searchBooks(query),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  })
}

/**
 * Hook to filter books
 */
export const useFilterBooks = (filters: BookFilters) => {
  return useQuery({
    queryKey: queryKeys.filterBooks(filters),
    queryFn: () => apiService.filterBooks(filters),
    enabled: !!(filters.author || filters.genre || filters.searchQuery),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

// =============================================================================
// USER QUERIES
// =============================================================================

/**
 * Hook to fetch user's books
 */
export const useMyBooks = () => {
  return useQuery({
    queryKey: queryKeys.myBooks,
    queryFn: () => apiService.getMyBooks(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  })
}

/**
 * Hook to fetch user's purchase history
 */
export const useMyPurchases = () => {
  return useQuery({
    queryKey: queryKeys.myPurchases,
    queryFn: () => apiService.getMyPurchases(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  })
}

/**
 * Hook to check book ownership
 */
export const useBookOwnership = (bookId: number) => {
  return useQuery({
    queryKey: queryKeys.ownership(bookId),
    queryFn: () => apiService.checkOwnership(bookId),
    enabled: !!bookId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  })
}

// =============================================================================
// ADMIN QUERIES
// =============================================================================

/**
 * Hook to fetch user roles (admin only)
 */
export const useUserRoles = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userRoles(userId),
    queryFn: () => apiService.getUserRoles(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  })
}

/**
 * Hook to fetch system health (admin only)
 */
export const useSystemHealth = () => {
  return useQuery({
    queryKey: queryKeys.systemHealth,
    queryFn: () => apiService.getSystemHealth(),
    staleTime: 30 * 1000, // 30 seconds
    retry: 2,
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}

/**
 * Hook to fetch all users (admin only)
 */
export const useUsers = () => {
  return useQuery({
    queryKey: queryKeys.users,
    queryFn: () => apiService.getUsers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  })
}

// =============================================================================
// MUTATIONS
// =============================================================================

/**
 * Hook to purchase a book with optimistic updates
 */
export const usePurchaseBook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookId: number) => apiService.purchaseBook(bookId),
    onMutate: async (bookId) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: queryKeys.ownership(bookId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.myBooks })
      await queryClient.cancelQueries({ queryKey: queryKeys.myPurchases })

      // Snapshot the previous values
      const previousOwnership = queryClient.getQueryData(queryKeys.ownership(bookId))
      const previousMyBooks = queryClient.getQueryData(queryKeys.myBooks)
      const previousPurchases = queryClient.getQueryData(queryKeys.myPurchases)

      // Optimistically update ownership
      queryClient.setQueryData(
        queryKeys.ownership(bookId),
        (old: OwnershipResponse | undefined) => {
          if (old) {
            return {
              ...old,
              owns_book: true,
              purchase_date: new Date().toISOString(),
            }
          }
          return old
        }
      )

      // Return a context object with the snapshotted values
      return { previousOwnership, previousMyBooks, previousPurchases, bookId }
    },
    onSuccess: (data, bookId) => {
      // Update with real data from server
      queryClient.setQueryData(
        queryKeys.ownership(bookId),
        (old: OwnershipResponse | undefined) => {
          if (old && data.success) {
            return {
              ...old,
              owns_book: true,
              purchase_date: new Date().toISOString(),
              purchase_id: data.purchase_id,
            }
          }
          return old
        }
      )

      // Invalidate and refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.myBooks })
      queryClient.invalidateQueries({ queryKey: queryKeys.myPurchases })
    },
    onError: (error, bookId, context) => {
      console.error('Purchase failed:', error)
      
      // Revert optimistic updates on error
      if (context?.previousOwnership) {
        queryClient.setQueryData(queryKeys.ownership(bookId), context.previousOwnership)
      }
      if (context?.previousMyBooks) {
        queryClient.setQueryData(queryKeys.myBooks, context.previousMyBooks)
      }
      if (context?.previousPurchases) {
        queryClient.setQueryData(queryKeys.myPurchases, context.previousPurchases)
      }
    },
  })
}

/**
 * Hook to set user role (sudo_admin only)
 */
export const useSetUserRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      apiService.setUserRole(userId, role),
    onSuccess: (_, { userId }) => {
      // Invalidate user roles query
      queryClient.invalidateQueries({ queryKey: queryKeys.userRoles(userId) })
      queryClient.invalidateQueries({ queryKey: queryKeys.users })
    },
    onError: error => {
      console.error('Role assignment failed:', error)
    },
  })
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Hook to test API connectivity
 */
export const useApiConnectivity = () => {
  return useQuery({
    queryKey: ['api', 'connectivity'],
    queryFn: () => apiService.testConnection(),
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    refetchInterval: 60 * 1000, // Check every minute
  })
}

/**
 * Hook to get API service instance (for direct access when needed)
 */
export const useApiService = () => {
  return {
    apiService,
    isAuthenticated: apiService.isAuthenticated(),
    baseURL: apiService.getBaseURL(),
  }
}

/**
 * Hook for prefetching book data (useful for hover effects, etc.)
 */
export const usePrefetchBook = () => {
  const queryClient = useQueryClient()

  return (bookId: number) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.book(bookId),
      queryFn: () => apiService.getBook(bookId),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }
}

/**
 * Hook for optimistic updates when purchasing books
 */
export const useOptimisticPurchase = () => {
  const queryClient = useQueryClient()

  return {
    startOptimisticPurchase: (bookId: number) => {
      // Optimistically update ownership
      queryClient.setQueryData(
        queryKeys.ownership(bookId),
        (old: OwnershipResponse | undefined) => {
          if (old) {
            return {
              ...old,
              owns_book: true,
              purchase_date: new Date().toISOString(),
            }
          }
          return old
        }
      )
    },
    revertOptimisticPurchase: (bookId: number) => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: queryKeys.ownership(bookId) })
    },
  }
}
