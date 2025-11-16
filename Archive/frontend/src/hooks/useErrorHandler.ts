/**
 * Comprehensive error handling hook
 * Integrates all error handling utilities and provides a unified interface
 */

import { useCallback } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { 
  parseError, 
  logError, 
  shouldLogout, 
  isNetworkError, 
  formatErrorForDisplay,
  withRetry,
  ErrorType,
  AppError
} from '@/utils/errorHandling'
import { useToast } from '@/components/common/Toast'
import { useUIActions } from '@/store/uiStore'
import { useNetworkStatus } from './useNetworkStatus'

interface ErrorHandlerOptions {
  showToast?: boolean
  showGlobalError?: boolean
  logError?: boolean
  context?: string
  retryable?: boolean
  onRetry?: () => void
  onError?: (error: AppError) => void
}

export const useErrorHandler = () => {
  const { logout } = useAuth0()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showError, showWarning, showSuccess } = useToast()
  const { setGlobalError, setGlobalLoading } = useUIActions()
  const { isOnline, checkServerConnectivity } = useNetworkStatus()

  /**
   * Handle errors with comprehensive error processing
   */
  const handleError = useCallback(async (
    error: unknown,
    options: ErrorHandlerOptions = {}
  ) => {
    const {
      showToast = true,
      showGlobalError = false,
      logError: shouldLog = true,
      context,
      retryable = false,
      onRetry,
      onError
    } = options

    // Parse the error
    const parsedError = parseError(error)

    // Log the error if requested
    if (shouldLog) {
      logError(parsedError, context)
    }

    // Call custom error handler if provided
    if (onError) {
      onError(parsedError)
    }

    // Handle authentication errors
    if (shouldLogout(parsedError)) {
      showWarning(
        'Session Expired',
        'Your session has expired. Please log in again.',
        5000
      )
      
      // Clear all cached data
      queryClient.clear()
      
      // Logout user
      await logout({ 
        logoutParams: { 
          returnTo: window.location.origin 
        } 
      })
      return
    }

    // Handle network errors
    if (isNetworkError(parsedError)) {
      const canReachServer = await checkServerConnectivity()
      
      if (!isOnline) {
        showWarning(
          'No Internet Connection',
          'Please check your internet connection and try again.',
          7000
        )
      } else if (!canReachServer) {
        showError(
          'Server Unreachable',
          'Unable to connect to the server. Please try again later.',
          7000
        )
      } else {
        showError(
          'Network Error',
          'A network error occurred. Please try again.',
          5000
        )
      }
      
      if (showGlobalError) {
        setGlobalError('Network connectivity issues detected')
      }
      return
    }

    // Handle authorization errors
    if (parsedError.type === ErrorType.AUTHORIZATION) {
      if (parsedError.statusCode === 403) {
        showError(
          'Access Denied',
          'You don\'t have permission to perform this action.',
          5000
        )
        
        // Optionally redirect to home or appropriate page
        if (context === 'admin') {
          navigate('/')
        }
      }
      return
    }

    // Handle not found errors
    if (parsedError.type === ErrorType.NOT_FOUND) {
      showError(
        'Not Found',
        'The requested content could not be found.',
        5000
      )
      
      // Optionally redirect to appropriate page
      if (context === 'book-details') {
        navigate('/catalog')
      }
      return
    }

    // Handle rate limiting
    if (parsedError.type === ErrorType.RATE_LIMIT) {
      showWarning(
        'Rate Limited',
        'Too many requests. Please wait a moment before trying again.',
        7000
      )
      return
    }

    // Handle DRM errors
    if (parsedError.type === ErrorType.DRM) {
      showError(
        'Content Protection Error',
        'Unable to access protected content. Please try again or contact support.',
        7000
      )
      return
    }

    // Format error for display
    const displayError = formatErrorForDisplay(error, context)

    // Show toast notification
    if (showToast) {
      if (retryable && onRetry) {
        // Show error with retry option
        showError(
          displayError.title,
          `${displayError.message} Click to retry.`,
          10000
        )
      } else {
        showError(displayError.title, displayError.message)
      }
    }

    // Set global error if requested
    if (showGlobalError) {
      setGlobalError(displayError.message)
    }
  }, [
    logout,
    navigate,
    queryClient,
    showError,
    showWarning,
    showSuccess,
    setGlobalError,
    isOnline,
    checkServerConnectivity
  ])

  /**
   * Handle async operations with comprehensive error handling
   */
  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions & {
      loadingMessage?: string
      successMessage?: string
      successTitle?: string
    } = {}
  ): Promise<T | null> => {
    const {
      loadingMessage = 'Loading...',
      successMessage,
      successTitle = 'Success',
      showToast = true,
      context,
      retryable = false
    } = options

    try {
      // Set loading state
      setGlobalLoading(true, loadingMessage)

      // Execute operation
      const result = await operation()

      // Show success message if provided
      if (successMessage && showToast) {
        showSuccess(successTitle, successMessage)
      }

      return result
    } catch (error) {
      await handleError(error, {
        ...options,
        context,
        retryable
      })
      return null
    } finally {
      setGlobalLoading(false)
    }
  }, [handleError, setGlobalLoading, showSuccess])

  /**
   * Handle async operations with retry capability
   */
  const handleAsyncOperationWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    options: ErrorHandlerOptions & {
      maxRetries?: number
      retryDelay?: number
      loadingMessage?: string
      successMessage?: string
    } = {}
  ): Promise<T | null> => {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      loadingMessage = 'Loading...',
      successMessage,
      context
    } = options

    try {
      setGlobalLoading(true, loadingMessage)

      const result = await withRetry(operation, {
        maxAttempts: maxRetries,
        baseDelay: retryDelay,
        retryCondition: (error) => error.retryable || false
      })

      if (successMessage) {
        showSuccess('Success', successMessage)
      }

      return result
    } catch (error) {
      await handleError(error, {
        ...options,
        context,
        retryable: false // Don't show retry option since we already retried
      })
      return null
    } finally {
      setGlobalLoading(false)
    }
  }, [handleError, setGlobalLoading, showSuccess])

  /**
   * Create error handler for specific contexts
   */
  const createContextualErrorHandler = useCallback((
    context: string,
    defaultOptions: Partial<ErrorHandlerOptions> = {}
  ) => {
    return (error: unknown, options: Partial<ErrorHandlerOptions> = {}) => {
      return handleError(error, {
        ...defaultOptions,
        ...options,
        context
      })
    }
  }, [handleError])

  /**
   * Handle query errors (for React Query)
   */
  const handleQueryError = useCallback((
    error: unknown,
    context?: string
  ) => {
    return handleError(error, {
      showToast: true,
      showGlobalError: false,
      logError: true,
      context,
      retryable: true
    })
  }, [handleError])

  /**
   * Handle mutation errors (for React Query)
   */
  const handleMutationError = useCallback((
    error: unknown,
    context?: string
  ) => {
    return handleError(error, {
      showToast: true,
      showGlobalError: false,
      logError: true,
      context,
      retryable: false
    })
  }, [handleError])

  /**
   * Clear all error states
   */
  const clearErrors = useCallback(() => {
    setGlobalError(null)
    // Clear any other error states as needed
  }, [setGlobalError])

  /**
   * Check if error requires user action
   */
  const requiresUserAction = useCallback((error: unknown): boolean => {
    const parsedError = parseError(error)
    
    return parsedError.type === ErrorType.AUTHENTICATION ||
           parsedError.type === ErrorType.AUTHORIZATION ||
           parsedError.type === ErrorType.VALIDATION
  }, [])

  /**
   * Get user-friendly error message
   */
  const getErrorMessage = useCallback((error: unknown, context?: string): string => {
    const displayError = formatErrorForDisplay(error, context)
    return displayError.message
  }, [])

  return {
    handleError,
    handleAsyncOperation,
    handleAsyncOperationWithRetry,
    createContextualErrorHandler,
    handleQueryError,
    handleMutationError,
    clearErrors,
    requiresUserAction,
    getErrorMessage
  }
}

// Specific error handlers for common use cases
export const useBookErrorHandler = () => {
  const { createContextualErrorHandler } = useErrorHandler()
  
  return {
    handleBookLoadError: createContextualErrorHandler('book-loading'),
    handleBookPurchaseError: createContextualErrorHandler('book-purchase'),
    handleBookReadError: createContextualErrorHandler('book-reading'),
    handleLibraryError: createContextualErrorHandler('library-access')
  }
}

export const useAuthErrorHandler = () => {
  const { createContextualErrorHandler } = useErrorHandler()
  
  return {
    handleLoginError: createContextualErrorHandler('login'),
    handleLogoutError: createContextualErrorHandler('logout'),
    handleTokenError: createContextualErrorHandler('token-refresh')
  }
}

export const useAdminErrorHandler = () => {
  const { createContextualErrorHandler } = useErrorHandler()
  
  return {
    handleUserManagementError: createContextualErrorHandler('admin-user-management'),
    handleSystemHealthError: createContextualErrorHandler('admin-system-health'),
    handleRoleAssignmentError: createContextualErrorHandler('admin-role-assignment')
  }
}

export default useErrorHandler