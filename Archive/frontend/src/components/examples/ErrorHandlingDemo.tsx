/**
 * Error Handling Demo Component
 * Demonstrates comprehensive error handling patterns and usage
 */

import React, { useState } from 'react'
import { 
  ErrorRecovery, 
  RetryButton, 
  ErrorFallback, 
  LoadingErrorState,
  useErrorHandlingContext,
  useToast
} from '@/components/common'
import { useBookErrorHandler } from '@/hooks/useErrorHandler'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { ErrorType } from '@/utils/errorHandling'
import apiService from '@/services/api'

export const ErrorHandlingDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [simulatedErrorType, setSimulatedErrorType] = useState<ErrorType>(ErrorType.NETWORK)

  const { handleError, handleAsyncOperation } = useErrorHandlingContext()
  const { handleBookLoadError } = useBookErrorHandler()
  const { showSuccess, showError, showWarning } = useToast()
  const { isOnline } = useNetworkStatus()

  // Simulate different types of errors
  const simulateError = (errorType: ErrorType) => {
    const errors = {
      [ErrorType.NETWORK]: new Error('Network connection failed'),
      [ErrorType.AUTHENTICATION]: new Error('Authentication token expired'),
      [ErrorType.AUTHORIZATION]: new Error('Access denied - insufficient permissions'),
      [ErrorType.NOT_FOUND]: new Error('Resource not found'),
      [ErrorType.SERVER]: new Error('Internal server error'),
      [ErrorType.RATE_LIMIT]: new Error('Too many requests'),
      [ErrorType.DRM]: new Error('DRM validation failed'),
      [ErrorType.VALIDATION]: new Error('Invalid input data'),
      [ErrorType.UNKNOWN]: new Error('Unknown error occurred')
    }

    const error = errors[errorType]
    ;(error as any).type = errorType
    return error
  }

  // Example: Basic error handling
  const handleBasicError = async () => {
    try {
      setIsLoading(true)
      throw simulateError(simulatedErrorType)
    } catch (error) {
      await handleError(error, 'demo-basic')
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  // Example: Async operation with error handling
  const handleAsyncOperationDemo = async () => {
    const result = await handleAsyncOperation(
      async () => {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (Math.random() > 0.5) {
          throw simulateError(simulatedErrorType)
        }
        
        return 'Operation successful!'
      },
      {
        context: 'demo-async',
        successMessage: 'Async operation completed successfully!',
        loadingMessage: 'Processing async operation...'
      }
    )

    if (result) {
      console.log('Result:', result)
    }
  }

  // Example: Book-specific error handling
  const handleBookOperation = async () => {
    try {
      setIsLoading(true)
      
      // Simulate book loading error
      throw simulateError(ErrorType.AUTHORIZATION)
    } catch (error) {
      await handleBookLoadError(error, { 
        showToast: true,
        context: 'book-demo'
      })
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  // Example: API operation with retry
  const handleApiOperationWithRetry = async () => {
    let attempts = 0
    
    const operation = async () => {
      attempts++
      console.log(`Attempt ${attempts}`)
      
      if (attempts < 3) {
        throw simulateError(ErrorType.NETWORK)
      }
      
      return await apiService.getBooks()
    }

    try {
      setIsLoading(true)
      const books = await operation()
      showSuccess('Success', `Loaded ${books.length} books after ${attempts} attempts`)
    } catch (error) {
      await handleError(error, 'api-retry-demo')
      setError(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  // Example: Manual retry with RetryButton
  const handleManualRetry = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    if (Math.random() > 0.3) {
      throw simulateError(ErrorType.SERVER)
    }
    
    setError(null)
    showSuccess('Retry Successful', 'Operation completed successfully!')
  }

  // Clear error state
  const clearError = () => {
    setError(null)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Error Handling Demo
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Error Type Selector */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Select Error Type to Simulate
            </h2>
            
            <select
              value={simulatedErrorType}
              onChange={(e) => setSimulatedErrorType(e.target.value as ErrorType)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-kahf-primary focus:border-transparent"
            >
              {Object.values(ErrorType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Network Status */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">
              Network Status
            </h2>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Demo Buttons */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={handleBasicError}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Basic Error Handling
          </button>

          <button
            onClick={handleAsyncOperationDemo}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Async Operation
          </button>

          <button
            onClick={handleBookOperation}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Book Operation
          </button>

          <button
            onClick={handleApiOperationWithRetry}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            API with Retry
          </button>
        </div>

        {/* Clear Error Button */}
        {error && (
          <div className="mt-4">
            <button
              onClick={clearError}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Error
            </button>
          </div>
        )}
      </div>

      {/* Error Display Section */}
      {error && (
        <div className="space-y-6">
          {/* Error Fallback Example */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Error Fallback Component
            </h2>
            
            <ErrorFallback
              error={error || undefined}
              errorType={simulatedErrorType}
              onRetry={handleManualRetry}
              onGoHome={() => window.location.href = '/'}
            />
          </div>

          {/* Error Recovery Example */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Error Recovery Component
            </h2>
            
            <ErrorRecovery
              error={error}
              errorType={simulatedErrorType}
              context="demo"
              onRecovery={() => {
                setError(null)
                showSuccess('Recovery Complete', 'Error has been resolved!')
              }}
              onRetry={handleManualRetry}
              autoRecovery={false}
            />
          </div>

          {/* Retry Button Example */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Retry Button Component
            </h2>
            
            <div className="flex items-center space-x-4">
              <RetryButton
                onRetry={handleManualRetry}
                maxRetries={3}
                retryDelay={2000}
                showRetryCount
              />
              
              <span className="text-sm text-gray-600">
                Click to retry the failed operation
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loading Error State Example */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Loading Error State Component
        </h2>
        
        <LoadingErrorState
          isLoading={isLoading}
          error={error || undefined}
          errorType={simulatedErrorType}
          onRetry={handleManualRetry}
          loadingMessage="Loading demo content..."
        >
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-800">
              ✅ Content loaded successfully! No errors to display.
            </p>
          </div>
        </LoadingErrorState>
      </div>

      {/* Toast Notification Examples */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Toast Notifications
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <button
            onClick={() => showSuccess('Success!', 'Operation completed successfully')}
            className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            Success Toast
          </button>
          
          <button
            onClick={() => showError('Error!', 'Something went wrong')}
            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Error Toast
          </button>
          
          <button
            onClick={() => showWarning('Warning!', 'Please be careful')}
            className="px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm"
          >
            Warning Toast
          </button>
          
          <button
            onClick={() => showSuccess('Info', 'Here is some information')}
            className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Info Toast
          </button>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          How to Use Error Handling
        </h2>
        
        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h3 className="font-medium text-gray-800">1. Basic Error Handling:</h3>
            <p>Use <code className="bg-gray-200 px-1 rounded">handleError(error, context)</code> for simple error handling with toast notifications.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800">2. Async Operations:</h3>
            <p>Use <code className="bg-gray-200 px-1 rounded">handleAsyncOperation(operation, options)</code> for operations with loading states and success messages.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800">3. Context-Specific Handlers:</h3>
            <p>Use specialized handlers like <code className="bg-gray-200 px-1 rounded">useBookErrorHandler()</code> for domain-specific error handling.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800">4. Error Recovery:</h3>
            <p>Use <code className="bg-gray-200 px-1 rounded">ErrorRecovery</code> component for automatic error recovery with user feedback.</p>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-800">5. Offline Handling:</h3>
            <p>The system automatically handles offline states and queues operations for when connectivity is restored.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorHandlingDemo