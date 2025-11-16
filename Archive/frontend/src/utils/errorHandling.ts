/**
 * Comprehensive error handling utilities
 * Provides standardized error handling, user-friendly messages, and retry mechanisms
 */

// Note: AxiosError type would be imported from axios if available
interface AxiosError extends Error {
  response?: {
    status?: number
    data?: any
  }
  code?: string
}

export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  VALIDATION = 'VALIDATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  RATE_LIMIT = 'RATE_LIMIT',
  DRM = 'DRM',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError {
  type: ErrorType
  message: string
  originalError?: Error
  statusCode?: number
  details?: any
  retryable?: boolean
  userMessage?: string
}

export class ApiError extends Error {
  public readonly type: ErrorType
  public readonly statusCode?: number
  public readonly details?: any
  public readonly retryable: boolean
  public readonly userMessage: string

  constructor(
    type: ErrorType,
    message: string,
    statusCode?: number,
    details?: any,
    retryable: boolean = false
  ) {
    super(message)
    this.name = 'ApiError'
    this.type = type
    this.statusCode = statusCode
    this.details = details
    this.retryable = retryable
    this.userMessage = this.generateUserMessage()
  }

  private generateUserMessage(): string {
    switch (this.type) {
      case ErrorType.NETWORK:
        return 'Unable to connect to the server. Please check your internet connection and try again.'
      
      case ErrorType.AUTHENTICATION:
        return 'Your session has expired. Please log in again to continue.'
      
      case ErrorType.AUTHORIZATION:
        return 'You don\'t have permission to access this content. Please contact support if you believe this is an error.'
      
      case ErrorType.VALIDATION:
        return 'The information provided is invalid. Please check your input and try again.'
      
      case ErrorType.NOT_FOUND:
        return 'The requested content could not be found. It may have been moved or deleted.'
      
      case ErrorType.SERVER:
        return 'A server error occurred. Our team has been notified and is working to fix the issue.'
      
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment before trying again.'
      
      case ErrorType.DRM:
        return 'Unable to access protected content. Please ensure you have proper permissions.'
      
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.'
    }
  }
}

/**
 * Parse and categorize errors from various sources
 */
export const parseError = (error: unknown): AppError => {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return {
      type: error.type,
      message: error.message,
      originalError: error,
      statusCode: error.statusCode,
      details: error.details,
      retryable: error.retryable,
      userMessage: error.userMessage
    }
  }

  // Handle Axios-like errors (check for response property)
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError
    const statusCode = axiosError.response?.status
    const responseData = axiosError.response?.data

    let type: ErrorType
    let retryable = false

    switch (statusCode) {
      case 400:
        type = ErrorType.VALIDATION
        break
      case 401:
        type = ErrorType.AUTHENTICATION
        break
      case 403:
        type = ErrorType.AUTHORIZATION
        break
      case 404:
        type = ErrorType.NOT_FOUND
        break
      case 429:
        type = ErrorType.RATE_LIMIT
        retryable = true
        break
      case 500:
      case 502:
      case 503:
      case 504:
        type = ErrorType.SERVER
        retryable = true
        break
      default:
        if (axiosError.code === 'NETWORK_ERROR' || axiosError.code === 'ECONNABORTED') {
          type = ErrorType.NETWORK
          retryable = true
        } else {
          type = ErrorType.UNKNOWN
        }
    }

    const apiError = new ApiError(
      type,
      responseData?.message || axiosError.message,
      statusCode,
      responseData,
      retryable
    )

    return {
      type: apiError.type,
      message: apiError.message,
      originalError: axiosError,
      statusCode: apiError.statusCode,
      details: apiError.details,
      retryable: apiError.retryable,
      userMessage: apiError.userMessage
    }
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      originalError: error,
      retryable: false,
      userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
    }
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN,
      message: error,
      retryable: false,
      userMessage: error
    }
  }

  // Handle unknown error types
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unknown error occurred',
    retryable: false,
    userMessage: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export interface RetryOptions {
  maxAttempts?: number
  baseDelay?: number
  maxDelay?: number
  backoffFactor?: number
  retryCondition?: (error: AppError) => boolean
}

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    retryCondition = (error) => error.retryable
  } = options

  let lastError: AppError

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = parseError(error)

      // Don't retry if this is the last attempt or error is not retryable
      if (attempt === maxAttempts || !retryCondition(lastError)) {
        throw lastError
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      )

      console.warn(`Operation failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms:`, lastError.message)

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * Error logging utility
 */
export const logError = (error: AppError, context?: string) => {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    type: error.type,
    message: error.message,
    statusCode: error.statusCode,
    details: error.details,
    stack: error.originalError?.stack,
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  console.error('Application Error:', logData)

  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: sendToErrorReportingService(logData)
  }
}

/**
 * User-friendly error messages for common scenarios
 */
export const getErrorMessage = (error: unknown, context?: string): string => {
  const parsedError = parseError(error)
  
  // Add context-specific messages
  if (context) {
    switch (context) {
      case 'book-purchase':
        if (parsedError.type === ErrorType.AUTHENTICATION) {
          return 'Please log in to purchase books.'
        }
        if (parsedError.type === ErrorType.AUTHORIZATION) {
          return 'You don\'t have permission to purchase this book.'
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
    }
  }

  return parsedError.userMessage || parsedError.message
}

/**
 * Check if error should trigger a logout
 */
export const shouldLogout = (error: AppError): boolean => {
  return error.type === ErrorType.AUTHENTICATION && 
         (error.statusCode === 401 || error.message.includes('token'))
}

/**
 * Check if error indicates network connectivity issues
 */
export const isNetworkError = (error: AppError): boolean => {
  if (error.type === ErrorType.NETWORK) {
    return true
  }
  
  if (error.originalError && 
      typeof error.originalError === 'object' &&
      'code' in error.originalError) {
    const code = (error.originalError as any).code
    return code === 'NETWORK_ERROR' || code === 'ECONNABORTED'
  }
  
  return false
}

/**
 * Format error for display in UI components
 */
export const formatErrorForDisplay = (error: unknown, context?: string) => {
  const parsedError = parseError(error)
  
  return {
    title: getErrorTitle(parsedError.type),
    message: getErrorMessage(error, context),
    type: parsedError.type,
    retryable: parsedError.retryable,
    statusCode: parsedError.statusCode
  }
}

const getErrorTitle = (type: ErrorType): string => {
  switch (type) {
    case ErrorType.NETWORK:
      return 'Connection Error'
    case ErrorType.AUTHENTICATION:
      return 'Authentication Required'
    case ErrorType.AUTHORIZATION:
      return 'Access Denied'
    case ErrorType.VALIDATION:
      return 'Invalid Input'
    case ErrorType.NOT_FOUND:
      return 'Not Found'
    case ErrorType.SERVER:
      return 'Server Error'
    case ErrorType.RATE_LIMIT:
      return 'Rate Limited'
    case ErrorType.DRM:
      return 'Content Protection Error'
    default:
      return 'Error'
  }
}