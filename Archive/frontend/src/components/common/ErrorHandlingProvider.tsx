/**
 * Error Handling Provider component
 * Provides comprehensive error handling context and integration
 */

import React, { createContext, useContext, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { useErrorHandler } from '@/hooks/useErrorHandler'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { ErrorType, parseError } from '@/utils/errorHandling'
import { useToast } from './Toast'

interface ErrorHandlingContextType {
  handleError: (error: unknown, context?: string) => Promise<void>
  handleAsyncOperation: <T>(
    operation: () => Promise<T>,
    options?: {
      context?: string
      successMessage?: string
      loadingMessage?: string
    }
  ) => Promise<T | null>
  clearErrors: () => void
  isOnline: boolean
}

const ErrorHandlingContext = createContext<ErrorHandlingContextType | null>(null)

interface ErrorHandlingProviderProps {
  children: React.ReactNode
}

export const ErrorHandlingProvider: React.FC<ErrorHandlingProviderProps> = ({ children }) => {
  const { logout } = useAuth0()
  const queryClient = useQueryClient()
  const { showError, showWarning, showSuccess } = useToast()
  const { isOnline, checkServerConnectivity } = useNetworkStatus()
  const { 
    handleError: baseHandleError, 
    clearErrors: baseClearErrors 
  } = useErrorHandler()

  // Enhanced error handler with context-aware messaging
  const handleError = useCallback(async (error: unknown, context?: string) => {
    const parsedError = parseError(error)
    
    // Handle specific error types with context-aware messages
    switch (parsedError.type) {
      case ErrorType.NETWORK:
        if (!isOnline) {
          showWarning(
            'No Internet Connection',
            'Please check your internet connection and try again.',
            7000
          )
        } else {
          const canReachServer = await checkServerConnectivity()
          if (!canReachServer) {
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
        }
        break

      case ErrorType.AUTHENTICATION:
        showWarning(
          'Session Expired',
          'Your session has expired. Please log in again.',
          5000
        )
        // Clear cached data and logout
        queryClient.clear()
        setTimeout(() => {
          logout({ 
            logoutParams: { 
              returnTo: window.location.origin 
            } 
          })
        }, 2000)
        break

      case ErrorType.AUTHORIZATION:
        if (context === 'book-purchase') {
          showError(
            'Purchase Not Allowed',
            'You don\'t have permission to purchase this book.',
            5000
          )
        } else if (context === 'book-reading') {
          showError(
            'Access Denied',
            'You don\'t own this book. Please purchase it first.',
            5000
          )
        } else if (context === 'admin') {
          showError(
            'Admin Access Required',
            'You don\'t have administrator privileges.',
            5000
          )
        } else {
          showError(
            'Access Denied',
            'You don\'t have permission to perform this action.',
            5000
          )
        }
        break

      case ErrorType.NOT_FOUND:
        if (context === 'book-details') {
          showError(
            'Book Not Found',
            'The requested book could not be found.',
            5000
          )
        } else {
          showError(
            'Not Found',
            'The requested content could not be found.',
            5000
          )
        }
        break

      case ErrorType.RATE_LIMIT:
        showWarning(
          'Rate Limited',
          'Too many requests. Please wait a moment before trying again.',
          7000
        )
        break

      case ErrorType.DRM:
        showError(
          'Content Protection Error',
          'Unable to access protected content. Please try again or contact support.',
          7000
        )
        break

      case ErrorType.VALIDATION:
        if (context === 'book-purchase') {
          showError(
            'Purchase Error',
            'Invalid purchase request. Please try again.',
            5000
          )
        } else {
          showError(
            'Invalid Input',
            'Please check your input and try again.',
            5000
          )
        }
        break

      default:
        // Use the base error handler for other cases
        await baseHandleError(error, { context })
    }
  }, [
    isOnline,
    checkServerConnectivity,
    showError,
    showWarning,
    queryClient,
    logout,
    baseHandleError
  ])

  // Enhanced async operation handler
  const handleAsyncOperation = useCallback(async (
    operation: () => Promise<any>,
    options: {
      context?: string
      successMessage?: string
      loadingMessage?: string
    } = {}
  ): Promise<any> => {
    const { context, successMessage } = options

    try {
      const result = await operation()
      
      if (successMessage) {
        showSuccess('Success', successMessage, 3000)
      }
      
      return result
    } catch (error) {
      await handleError(error, context)
      return null
    }
  }, [handleError, showSuccess])

  // Clear all error states
  const clearErrors = useCallback(() => {
    baseClearErrors()
  }, [baseClearErrors])

  // Set up global error handlers
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      handleError(event.reason, 'unhandled-promise')
      event.preventDefault()
    }

    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global JavaScript error:', event.error)
      handleError(event.error, 'global-error')
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleGlobalError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleGlobalError)
    }
  }, [handleError])

  const contextValue: ErrorHandlingContextType = {
    handleError,
    handleAsyncOperation,
    clearErrors,
    isOnline
  }

  return (
    <ErrorHandlingContext.Provider value={contextValue}>
      {children}
    </ErrorHandlingContext.Provider>
  )
}

// Hook to use error handling context
export const useErrorHandlingContext = (): ErrorHandlingContextType => {
  const context = useContext(ErrorHandlingContext)
  if (!context) {
    throw new Error('useErrorHandlingContext must be used within an ErrorHandlingProvider')
  }
  return context
}

export default ErrorHandlingProvider