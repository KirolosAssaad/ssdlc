/**
 * Fallback UI components for different error states
 * Provides user-friendly error displays with retry options
 */

import React from 'react'
import {
  ExclamationTriangleIcon,
  WifiIcon,
  LockClosedIcon,
  DocumentMagnifyingGlassIcon,
  ServerIcon,
  ArrowPathIcon,
  HomeIcon
} from '@heroicons/react/24/outline'
import { ErrorType } from '@/utils/errorHandling'

interface ErrorFallbackProps {
  error?: Error | string
  errorType?: ErrorType
  title?: string
  message?: string
  onRetry?: () => void
  onGoHome?: () => void
  showRetry?: boolean
  showGoHome?: boolean
  className?: string
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorType,
  title,
  message,
  onRetry,
  onGoHome,
  showRetry = true,
  showGoHome = true,
  className = ''
}) => {
  const getErrorDetails = () => {
    if (title && message) {
      return { title, message, icon: ExclamationTriangleIcon }
    }

    switch (errorType) {
      case ErrorType.NETWORK:
        return {
          title: 'Connection Problem',
          message: 'Unable to connect to the server. Please check your internet connection and try again.',
          icon: WifiIcon
        }
      
      case ErrorType.AUTHENTICATION:
        return {
          title: 'Authentication Required',
          message: 'Your session has expired. Please log in again to continue.',
          icon: LockClosedIcon
        }
      
      case ErrorType.AUTHORIZATION:
        return {
          title: 'Access Denied',
          message: 'You don\'t have permission to access this content.',
          icon: LockClosedIcon
        }
      
      case ErrorType.NOT_FOUND:
        return {
          title: 'Content Not Found',
          message: 'The content you\'re looking for could not be found.',
          icon: DocumentMagnifyingGlassIcon
        }
      
      case ErrorType.SERVER:
        return {
          title: 'Server Error',
          message: 'A server error occurred. Our team has been notified and is working to fix the issue.',
          icon: ServerIcon
        }
      
      case ErrorType.RATE_LIMIT:
        return {
          title: 'Too Many Requests',
          message: 'You\'ve made too many requests. Please wait a moment before trying again.',
          icon: ExclamationTriangleIcon
        }
      
      default:
        return {
          title: 'Something Went Wrong',
          message: error instanceof Error ? error.message : (error || 'An unexpected error occurred.'),
          icon: ExclamationTriangleIcon
        }
    }
  }

  const { title: errorTitle, message: errorMessage, icon: Icon } = getErrorDetails()

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
        <Icon className="w-8 h-8 text-red-600" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {errorTitle}
      </h3>
      
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        {errorMessage}
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kahf-primary hover:bg-kahf-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kahf-primary"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            Try Again
          </button>
        )}
        
        {showGoHome && onGoHome && (
          <button
            onClick={onGoHome}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kahf-primary"
          >
            <HomeIcon className="w-4 h-4 mr-2" />
            Go Home
          </button>
        )}
      </div>
    </div>
  )
}

// Specific error fallback components
export const NetworkErrorFallback: React.FC<Omit<ErrorFallbackProps, 'errorType'>> = (props) => (
  <ErrorFallback {...props} errorType={ErrorType.NETWORK} />
)

export const AuthErrorFallback: React.FC<Omit<ErrorFallbackProps, 'errorType'>> = (props) => (
  <ErrorFallback {...props} errorType={ErrorType.AUTHENTICATION} />
)

export const NotFoundErrorFallback: React.FC<Omit<ErrorFallbackProps, 'errorType'>> = (props) => (
  <ErrorFallback {...props} errorType={ErrorType.NOT_FOUND} />
)

export const ServerErrorFallback: React.FC<Omit<ErrorFallbackProps, 'errorType'>> = (props) => (
  <ErrorFallback {...props} errorType={ErrorType.SERVER} />
)

// Loading error state component
interface LoadingErrorStateProps {
  isLoading: boolean
  error?: Error | string
  errorType?: ErrorType
  onRetry?: () => void
  loadingMessage?: string
  children: React.ReactNode
  fallbackClassName?: string
}

export const LoadingErrorState: React.FC<LoadingErrorStateProps> = ({
  isLoading,
  error,
  errorType,
  onRetry,
  loadingMessage = 'Loading...',
  children,
  fallbackClassName
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-kahf-primary"></div>
          <span className="text-sm text-gray-600">{loadingMessage}</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorFallback
        error={error}
        errorType={errorType}
        onRetry={onRetry}
        className={fallbackClassName}
      />
    )
  }

  return <>{children}</>
}

// Empty state component
interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = DocumentMagnifyingGlassIcon,
  title,
  message,
  action,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        {message}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kahf-primary hover:bg-kahf-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kahf-primary"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default ErrorFallback