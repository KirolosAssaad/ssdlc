/**
 * Hook for managing data synchronization between React Query and Zustand stores
 * Provides centralized cache invalidation and data synchronization
 */

import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useBooksActions, usePurchasesActions, useUIActions } from '@/store'
import { queryKeys } from './useApiService'

export const useDataSync = () => {
  const queryClient = useQueryClient()
  const { clearErrors: clearBooksErrors } = useBooksActions()
  const { clearErrors: clearPurchasesErrors } = usePurchasesActions()
  const { clearNotifications, addNotification } = useUIActions()

  /**
   * Invalidate all book-related queries
   */
  const invalidateBooks = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.books })
    queryClient.invalidateQueries({ queryKey: ['books'] })
  }, [queryClient])

  /**
   * Invalidate user-specific queries
   */
  const invalidateUserData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.myBooks })
    queryClient.invalidateQueries({ queryKey: queryKeys.myPurchases })
    queryClient.invalidateQueries({ queryKey: ['user'] })
  }, [queryClient])

  /**
   * Invalidate ownership queries for a specific book
   */
  const invalidateBookOwnership = useCallback((bookId: number) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.ownership(bookId) })
  }, [queryClient])

  /**
   * Invalidate all ownership queries
   */
  const invalidateAllOwnership = useCallback(() => {
    queryClient.invalidateQueries({ 
      predicate: (query) => {
        return query.queryKey[0] === 'user' && query.queryKey[1] === 'ownership'
      }
    })
  }, [queryClient])

  /**
   * Invalidate admin-related queries
   */
  const invalidateAdminData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users })
    queryClient.invalidateQueries({ queryKey: queryKeys.systemHealth })
    queryClient.invalidateQueries({ queryKey: ['admin'] })
  }, [queryClient])

  /**
   * Clear all cached data and reset stores
   */
  const clearAllData = useCallback(() => {
    queryClient.clear()
    clearBooksErrors()
    clearPurchasesErrors()
    clearNotifications()
  }, [queryClient, clearBooksErrors, clearPurchasesErrors, clearNotifications])

  /**
   * Refresh all data (invalidate and refetch)
   */
  const refreshAllData = useCallback(async () => {
    try {
      addNotification({
        type: 'info',
        title: 'Refreshing data...',
        duration: 2000,
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.books }),
        queryClient.invalidateQueries({ queryKey: queryKeys.myBooks }),
        queryClient.invalidateQueries({ queryKey: queryKeys.myPurchases }),
      ])

      addNotification({
        type: 'success',
        title: 'Data refreshed successfully',
        duration: 3000,
      })
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Failed to refresh data',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration: 5000,
      })
    }
  }, [queryClient, addNotification])

  /**
   * Sync data after authentication changes
   */
  const syncAfterAuth = useCallback(async (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      // User logged in - fetch user-specific data
      await Promise.all([
        queryClient.prefetchQuery({
          queryKey: queryKeys.myBooks,
          staleTime: 0, // Force fresh fetch
        }),
        queryClient.prefetchQuery({
          queryKey: queryKeys.myPurchases,
          staleTime: 0, // Force fresh fetch
        }),
      ])
    } else {
      // User logged out - clear user-specific data
      queryClient.removeQueries({ queryKey: ['user'] })
      queryClient.removeQueries({ queryKey: ['admin'] })
      clearPurchasesErrors()
    }
  }, [queryClient, clearPurchasesErrors])

  /**
   * Sync data after a successful purchase
   */
  const syncAfterPurchase = useCallback(async (bookId: number) => {
    // Invalidate related queries to ensure fresh data
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.myBooks }),
      queryClient.invalidateQueries({ queryKey: queryKeys.myPurchases }),
      queryClient.invalidateQueries({ queryKey: queryKeys.ownership(bookId) }),
    ])
  }, [queryClient])

  /**
   * Prefetch book data (useful for hover effects, navigation)
   */
  const prefetchBook = useCallback((bookId: number) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.book(bookId),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }, [queryClient])

  /**
   * Prefetch ownership data
   */
  const prefetchOwnership = useCallback((bookId: number) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.ownership(bookId),
      staleTime: 1 * 60 * 1000, // 1 minute
    })
  }, [queryClient])

  /**
   * Get cached data without triggering a fetch
   */
  const getCachedBook = useCallback((bookId: number) => {
    return queryClient.getQueryData(queryKeys.book(bookId))
  }, [queryClient])

  const getCachedOwnership = useCallback((bookId: number) => {
    return queryClient.getQueryData(queryKeys.ownership(bookId))
  }, [queryClient])

  const getCachedBooks = useCallback(() => {
    return queryClient.getQueryData(queryKeys.books)
  }, [queryClient])

  const getCachedMyBooks = useCallback(() => {
    return queryClient.getQueryData(queryKeys.myBooks)
  }, [queryClient])

  /**
   * Check if data is stale and needs refetching
   */
  const isDataStale = useCallback((queryKey: unknown[]) => {
    const query = queryClient.getQueryState(queryKey)
    return !query || query.dataUpdatedAt < Date.now() - (5 * 60 * 1000) // 5 minutes
  }, [queryClient])

  /**
   * Get loading states for multiple queries
   */
  const getLoadingStates = useCallback(() => {
    return {
      books: queryClient.getQueryState(queryKeys.books)?.fetchStatus === 'fetching',
      myBooks: queryClient.getQueryState(queryKeys.myBooks)?.fetchStatus === 'fetching',
      purchases: queryClient.getQueryState(queryKeys.myPurchases)?.fetchStatus === 'fetching',
    }
  }, [queryClient])

  /**
   * Get error states for multiple queries
   */
  const getErrorStates = useCallback(() => {
    return {
      books: queryClient.getQueryState(queryKeys.books)?.error,
      myBooks: queryClient.getQueryState(queryKeys.myBooks)?.error,
      purchases: queryClient.getQueryState(queryKeys.myPurchases)?.error,
    }
  }, [queryClient])

  return {
    // Invalidation methods
    invalidateBooks,
    invalidateUserData,
    invalidateBookOwnership,
    invalidateAllOwnership,
    invalidateAdminData,
    
    // Data management
    clearAllData,
    refreshAllData,
    syncAfterAuth,
    syncAfterPurchase,
    
    // Prefetching
    prefetchBook,
    prefetchOwnership,
    
    // Cache access
    getCachedBook,
    getCachedOwnership,
    getCachedBooks,
    getCachedMyBooks,
    
    // Utility methods
    isDataStale,
    getLoadingStates,
    getErrorStates,
  }
}