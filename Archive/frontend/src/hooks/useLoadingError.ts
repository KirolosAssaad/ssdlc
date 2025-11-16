/**
 * Hook for managing loading and error states throughout the application
 * Provides centralized loading and error state management with automatic cleanup
 */

import { useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useUIActions, useGlobalError, useLoading } from '@/store'
import { queryKeys } from './useApiService'

interface LoadingState {
  isLoading: boolean
  message?: string
}

interface ErrorState {
  hasError: boolean
  error?: Error | null
  message?: string
}

export const useLoadingError = () => {
  const queryClient = useQueryClient()
  const { setGlobalLoading, addNotification, setGlobalError } = useUIActions()
  const { error: globalError, clearError } = useGlobalError()
  const { isLoading: globalLoading } = useLoading()

  /**
   * Set global loading state with optional message
   */
  const setLoading = useCallback((loading: boolean, message?: string) => {
    setGlobalLoading(loading, message)
  }, [setGlobalLoading])

  /**
   * Set global error state
   */
  const setError = useCallback((error: string | Error | null) => {
    const errorMessage = error instanceof Error ? error.message : error
    setGlobalError(errorMessage)
    
    if (errorMessage) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
        duration: 5000,
      })
    }
  }, [setGlobalError, addNotification])

  /**
   * Clear global error state
   */
  const clearGlobalError = useCallback(() => {
    clearError()
  }, [clearError])

  /**
   * Get loading state for specific operations
   */
  const getLoadingState = useCallback((operation: string): LoadingState => {
    const query = queryClient.getQueryState([operation])
    const isLoading = query?.fetchStatus === 'fetching'

    return { isLoading }
  }, [queryClient])

  /**
   * Get error state for specific operations
   */
  const getErrorState = useCallback((operation: string): ErrorState => {
    const query = queryClient.getQueryState([operation])
    const error = query?.error as Error | null
    
    return {
      hasError: !!error,
      error,
      message: error?.message,
    }
  }, [queryClient])

  /**
   * Get combined loading state for multiple operations
   */
  const getCombinedLoadingState = useCallback((operations: string[]): LoadingState => {
    const isLoading = operations.some(operation => {
      const query = queryClient.getQueryState([operation])
      return query?.fetchStatus === 'fetching'
    })

    return { isLoading }
  }, [queryClient])

  /**
   * Get combined error state for multiple operations
   */
  const getCombinedErrorState = useCallback((operations: string[]): ErrorState => {
    const errors = operations.map(operation => {
      const query = queryClient.getQueryState([operation])
      return query?.error as Error | null
    }).filter(Boolean)

    const hasError = errors.length > 0
    const error = errors[0] || null
    
    return {
      hasError,
      error,
      message: error?.message,
    }
  }, [queryClient])

  /**
   * Handle async operation with loading and error states
   */
  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      loadingMessage?: string
      successMessage?: string
      errorMessage?: string
      showNotifications?: boolean
    }
  ): Promise<T | null> => {
    const {
      loadingMessage = 'Loading...',
      successMessage,
      errorMessage,
      showNotifications = true,
    } = options || {}

    try {
      setLoading(true, loadingMessage)
      clearGlobalError()

      const result = await operation()

      if (successMessage && showNotifications) {
        addNotification({
          type: 'success',
          title: 'Success',
          message: successMessage,
          duration: 3000,
        })
      }

      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : (errorMessage || 'Operation failed')
      
      if (showNotifications) {
        setError(message)
      }
      
      console.error('Async operation failed:', error)
      return null
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearGlobalError, addNotification, setError])

  /**
   * Retry failed queries with loading state
   */
  const retryFailedQueries = useCallback(async (queryKeys?: string[][]) => {
    try {
      setLoading(true, 'Retrying failed operations...')
      
      if (queryKeys) {
        // Retry specific queries
        await Promise.all(
          queryKeys.map(key => queryClient.refetchQueries({ queryKey: key }))
        )
      } else {
        // Retry all failed queries
        await queryClient.refetchQueries({
          predicate: (query) => query.state.status === 'error'
        })
      }

      addNotification({
        type: 'success',
        title: 'Retry successful',
        message: 'Failed operations have been retried',
        duration: 3000,
      })
    } catch (error) {
      setError('Failed to retry operations')
    } finally {
      setLoading(false)
    }
  }, [queryClient, setLoading, addNotification, setError])

  /**
   * Get loading states for common book operations
   */
  const getBookLoadingStates = useCallback(() => {
    return {
      books: queryClient.getQueryState(queryKeys.books)?.fetchStatus === 'fetching',
      myBooks: queryClient.getQueryState(queryKeys.myBooks)?.fetchStatus === 'fetching',
      purchases: queryClient.getQueryState(queryKeys.myPurchases)?.fetchStatus === 'fetching',
      search: queryClient.getQueriesData({ queryKey: ['books', 'search'] })
        .some(([queryKey]) => {
          const queryState = queryClient.getQueryState(queryKey)
          return queryState?.fetchStatus === 'fetching'
        }),
    }
  }, [queryClient])

  /**
   * Get error states for common book operations
   */
  const getBookErrorStates = useCallback(() => {
    return {
      books: queryClient.getQueryState(queryKeys.books)?.error as Error | null,
      myBooks: queryClient.getQueryState(queryKeys.myBooks)?.error as Error | null,
      purchases: queryClient.getQueryState(queryKeys.myPurchases)?.error as Error | null,
    }
  }, [queryClient])

  /**
   * Check if any critical operations are failing
   */
  const hasCriticalErrors = useCallback(() => {
    const criticalQueries = [
      queryKeys.books,
      queryKeys.myBooks,
      queryKeys.myPurchases,
    ]

    return criticalQueries.some(queryKey => {
      const query = queryClient.getQueryState(queryKey)
      return query?.status === 'error'
    })
  }, [queryClient])

  /**
   * Auto-retry failed queries on mount
   */
  useEffect(() => {
    const failedQueries = queryClient.getQueryCache().getAll()
      .filter(query => query.state.status === 'error')

    if (failedQueries.length > 0) {
      console.log(`Found ${failedQueries.length} failed queries, auto-retrying...`)
      
      // Auto-retry after a short delay
      const timer = setTimeout(() => {
        retryFailedQueries()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [queryClient, retryFailedQueries])

  return {
    // Global state
    globalLoading,
    globalError,
    
    // State management
    setLoading,
    setError,
    clearGlobalError,
    
    // Query state helpers
    getLoadingState,
    getErrorState,
    getCombinedLoadingState,
    getCombinedErrorState,
    
    // Operation helpers
    handleAsyncOperation,
    retryFailedQueries,
    
    // Book-specific helpers
    getBookLoadingStates,
    getBookErrorStates,
    hasCriticalErrors,
  }
}