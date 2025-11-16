/**
 * API Error Handler Service
 * Provides centralized error handling for all API operations
 */

// AxiosError interface for type safety (would be imported from axios if available)
import { 
  ErrorType, 
  ApiError, 
  parseError, 
  logError, 
  withRetry,
  RetryOptions 
} from '@/utils/errorHandling'

export interface ApiErrorHandlerOptions {
  context?: string
  showToast?: boolean
  logError?: boolean
  retryable?: boolean
  maxRetries?: number
  onError?: (error: ApiError) => void
  onRetry?: (attempt: number) => void
  onSuccess?: () => void
}

export class ApiErrorHandler {
  private static instance: ApiErrorHandler
  private errorCallbacks: Map<string, (error: ApiError) => void> = new Map()

  private constructor() {}

  static getInstance(): ApiErrorHandler {
    if (!ApiErrorHandler.instance) {
      ApiErrorHandler.instance = new ApiErrorHandler()
    }
    return ApiErrorHandler.instance
  }

  /**
   * Register a global error callback for specific error types
   */
  registerErrorCallback(errorType: ErrorType, callback: (error: ApiError) => void): void {
    this.errorCallbacks.set(errorType, callback)
  }

  /**
   * Unregister error callback
   */
  unregisterErrorCallback(errorType: ErrorType): void {
    this.errorCallbacks.delete(errorType)
  }

  /**
   * Handle API errors with comprehensive processing
   */
  async handleApiError(
    error: unknown, 
    options: ApiErrorHandlerOptions = {}
  ): Promise<never> {
    const {
      context,
      logError: shouldLog = true,
      onError
    } = options

    // Parse the error
    const parsedError = parseError(error)

    // Log the error if requested
    if (shouldLog) {
      logError(parsedError, context)
    }

    // Call registered callback for this error type
    const callback = this.errorCallbacks.get(parsedError.type)
    if (callback) {
      callback(parsedError as any)
    }

    // Call custom error handler if provided
    if (onError) {
      onError(parsedError as any)
    }

    // Create enhanced API error
    const apiError = new ApiError(
      parsedError.type,
      parsedError.message,
      parsedError.statusCode,
      parsedError.details,
      parsedError.retryable
    )

    throw apiError
  }

  /**
   * Execute API operation with comprehensive error handling and retry logic
   */
  async executeWithErrorHandling<T>(
    operation: () => Promise<T>,
    options: ApiErrorHandlerOptions & RetryOptions = {}
  ): Promise<T> {
    const {
      context,
      showToast = true,
      logError: shouldLog = true,
      retryable = false,
      maxRetries = 3,
      onError,
      onRetry,
      onSuccess,
      ...retryOptions
    } = options

    const executeOperation = async (): Promise<T> => {
      try {
        const result = await operation()
        
        if (onSuccess) {
          onSuccess()
        }
        
        return result
      } catch (error) {
        await this.handleApiError(error, {
          context,
          showToast,
          logError: shouldLog,
          onError
        })
        
        // This line should never be reached due to handleApiError throwing
        throw error
      }
    }

    if (retryable && maxRetries > 1) {
      return withRetry(executeOperation, {
        maxAttempts: maxRetries,
        retryCondition: (error) => error.retryable || false,
        ...retryOptions
      })
    }

    return executeOperation()
  }

  /**
   * Create context-specific error handler
   */
  createContextHandler(context: string, defaultOptions: Partial<ApiErrorHandlerOptions> = {}) {
    return {
      handle: (error: unknown, options: Partial<ApiErrorHandlerOptions> = {}) => {
        return this.handleApiError(error, {
          ...defaultOptions,
          ...options,
          context
        })
      },
      
      execute: <T>(
        operation: () => Promise<T>, 
        options: Partial<ApiErrorHandlerOptions & RetryOptions> = {}
      ) => {
        return this.executeWithErrorHandling(operation, {
          ...defaultOptions,
          ...options,
          context
        })
      }
    }
  }

  /**
   * Get user-friendly error message for API errors
   */
  getErrorMessage(error: unknown, context?: string): string {
    const parsedError = parseError(error)
    
    // Context-specific messages
    if (context) {
      switch (context) {
        case 'book-purchase':
          if (parsedError.type === ErrorType.AUTHENTICATION) {
            return 'Please log in to purchase books.'
          }
          if (parsedError.type === ErrorType.AUTHORIZATION) {
            return 'You don\'t have permission to purchase this book.'
          }
          if (parsedError.type === ErrorType.VALIDATION) {
            return 'Invalid purchase request. Please try again.'
          }
          break
          
        case 'book-reading':
          if (parsedError.type === ErrorType.AUTHORIZATION) {
            return 'You don\'t own this book. Please purchase it first.'
          }
          if (parsedError.type === ErrorType.DRM) {
            return 'Unable to load book content. Please try again or contact support.'
          }
          break
          
        case 'library-access':
          if (parsedError.type === ErrorType.AUTHENTICATION) {
            return 'Please log in to access your library.'
          }
          break
          
        case 'admin':
          if (parsedError.type === ErrorType.AUTHORIZATION) {
            return 'You don\'t have administrator privileges.'
          }
          break
      }
    }

    return parsedError.userMessage || parsedError.message
  }

  /**
   * Check if error should trigger specific actions
   */
  shouldTriggerAction(error: unknown, action: 'logout' | 'redirect' | 'refresh'): boolean {
    const parsedError = parseError(error)
    
    switch (action) {
      case 'logout':
        return parsedError.type === ErrorType.AUTHENTICATION && 
               (parsedError.statusCode === 401 || parsedError.message.includes('token'))
      
      case 'redirect':
        return parsedError.type === ErrorType.NOT_FOUND ||
               (parsedError.type === ErrorType.AUTHORIZATION && parsedError.statusCode === 403)
      
      case 'refresh':
        return parsedError.type === ErrorType.SERVER ||
               parsedError.type === ErrorType.NETWORK
      
      default:
        return false
    }
  }

  /**
   * Get recommended recovery actions for error
   */
  getRecoveryActions(error: unknown): Array<{
    label: string
    action: () => void
    primary?: boolean
  }> {
    const parsedError = parseError(error)
    const actions: Array<{ label: string; action: () => void; primary?: boolean }> = []

    switch (parsedError.type) {
      case ErrorType.NETWORK:
        actions.push({
          label: 'Check Connection',
          action: () => window.location.reload(),
          primary: true
        })
        break

      case ErrorType.AUTHENTICATION:
        actions.push({
          label: 'Log In Again',
          action: () => window.location.href = '/login',
          primary: true
        })
        break

      case ErrorType.AUTHORIZATION:
        actions.push({
          label: 'Go Home',
          action: () => window.location.href = '/',
          primary: true
        })
        break

      case ErrorType.NOT_FOUND:
        actions.push({
          label: 'Go Back',
          action: () => window.history.back()
        })
        actions.push({
          label: 'Go Home',
          action: () => window.location.href = '/',
          primary: true
        })
        break

      case ErrorType.SERVER:
        actions.push({
          label: 'Try Again',
          action: () => window.location.reload(),
          primary: true
        })
        break

      case ErrorType.RATE_LIMIT:
        actions.push({
          label: 'Wait and Retry',
          action: () => setTimeout(() => window.location.reload(), 60000),
          primary: true
        })
        break

      default:
        actions.push({
          label: 'Refresh Page',
          action: () => window.location.reload(),
          primary: true
        })
    }

    return actions
  }
}

// Create and export singleton instance
export const apiErrorHandler = ApiErrorHandler.getInstance()

// Convenience functions for common use cases
export const handleBookError = apiErrorHandler.createContextHandler('book-operations')
export const handleAuthError = apiErrorHandler.createContextHandler('authentication')
export const handleAdminError = apiErrorHandler.createContextHandler('admin-operations')
export const handlePurchaseError = apiErrorHandler.createContextHandler('book-purchase')
export const handleLibraryError = apiErrorHandler.createContextHandler('library-access')

export default apiErrorHandler