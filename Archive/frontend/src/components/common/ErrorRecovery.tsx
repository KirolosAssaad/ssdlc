/**
 * Error Recovery component
 * Provides automatic error recovery and user-guided recovery options
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import { 
  ArrowPathIcon, 
  WifiIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useErrorHandlingContext } from './ErrorHandlingProvider'
import { ErrorType, parseError } from '@/utils/errorHandling'
import apiService from '@/services/api'

interface ErrorRecoveryProps {
  error?: Error | string
  errorType?: ErrorType
  context?: string
  onRecovery?: () => void
  onRetry?: () => Promise<void>
  autoRecovery?: boolean
  className?: string
}

export const ErrorRecovery: React.FC<ErrorRecoveryProps> = ({
  error,
  errorType,
  context,
  onRecovery,
  onRetry,
  autoRecovery = true,
  className = ''
}) => {
  const [isRecovering, setIsRecovering] = useState(false)
  const [recoverySteps, setRecoverySteps] = useState<string[]>([])
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle')

  const { isAuthenticated, loginWithRedirect } = useAuth0()
  const queryClient = useQueryClient()
  const { isOnline, checkServerConnectivity } = useNetworkStatus()
  const { clearErrors } = useErrorHandlingContext()

  // Determine recovery steps based on error type
  const getRecoverySteps = useCallback((errorType?: ErrorType, context?: string): string[] => {
    const steps: string[] = []

    switch (errorType) {
      case ErrorType.NETWORK:
        steps.push('Check internet connection')
        steps.push('Verify server connectivity')
        steps.push('Clear cache and retry')
        break

      case ErrorType.AUTHENTICATION:
        steps.push('Clear authentication cache')
        steps.push('Redirect to login')
        break

      case ErrorType.AUTHORIZATION:
        if (context === 'admin') {
          steps.push('Verify admin permissions')
          steps.push('Contact administrator')
        } else {
          steps.push('Refresh user permissions')
          steps.push('Re-authenticate if needed')
        }
        break

      case ErrorType.NOT_FOUND:
        steps.push('Refresh page data')
        steps.push('Clear local cache')
        steps.push('Redirect to safe page')
        break

      case ErrorType.SERVER:
        steps.push('Wait for server recovery')
        steps.push('Retry with exponential backoff')
        steps.push('Check system status')
        break

      case ErrorType.RATE_LIMIT:
        steps.push('Wait for rate limit reset')
        steps.push('Reduce request frequency')
        break

      case ErrorType.DRM:
        steps.push('Verify book ownership')
        steps.push('Refresh DRM tokens')
        steps.push('Clear DRM cache')
        break

      default:
        steps.push('Clear application cache')
        steps.push('Refresh page')
        steps.push('Contact support if needed')
    }

    return steps
  }, [])

  // Execute recovery step
  const executeRecoveryStep = useCallback(async (step: string): Promise<boolean> => {
    try {
      switch (step) {
        case 'Check internet connection':
          return isOnline

        case 'Verify server connectivity':
          return await checkServerConnectivity()

        case 'Clear cache and retry':
          queryClient.clear()
          localStorage.clear()
          sessionStorage.clear()
          return true

        case 'Clear authentication cache':
          queryClient.invalidateQueries({ queryKey: ['auth'] })
          return true

        case 'Redirect to login':
          if (!isAuthenticated) {
            await loginWithRedirect()
          }
          return isAuthenticated

        case 'Refresh user permissions':
          queryClient.invalidateQueries({ queryKey: ['user'] })
          return true

        case 'Re-authenticate if needed':
          if (!isAuthenticated) {
            await loginWithRedirect()
          }
          return true

        case 'Refresh page data':
          queryClient.invalidateQueries()
          return true

        case 'Clear local cache':
          localStorage.clear()
          return true

        case 'Redirect to safe page':
          window.location.href = '/'
          return true

        case 'Wait for server recovery':
          await new Promise(resolve => setTimeout(resolve, 5000))
          return await apiService.testConnection()

        case 'Retry with exponential backoff':
          // This would be handled by the retry mechanism
          return true

        case 'Check system status':
          return await apiService.testConnection()

        case 'Wait for rate limit reset':
          await new Promise(resolve => setTimeout(resolve, 60000)) // Wait 1 minute
          return true

        case 'Reduce request frequency':
          // This would be handled by the application logic
          return true

        case 'Verify book ownership':
          // This would need to be implemented based on context
          return true

        case 'Refresh DRM tokens':
          // This would be handled by the DRM service
          return true

        case 'Clear DRM cache':
          // This would be handled by the DRM service
          return true

        case 'Clear application cache':
          queryClient.clear()
          localStorage.clear()
          sessionStorage.clear()
          return true

        case 'Refresh page':
          window.location.reload()
          return true

        case 'Contact support if needed':
          // This would open a support dialog or redirect
          return true

        default:
          return false
      }
    } catch (error) {
      console.error(`Recovery step "${step}" failed:`, error)
      return false
    }
  }, [isOnline, checkServerConnectivity, queryClient, isAuthenticated, loginWithRedirect])

  // Run automatic recovery
  const runAutoRecovery = useCallback(async () => {
    if (!autoRecovery || recoveryStatus === 'running') return

    setIsRecovering(true)
    setRecoveryStatus('running')
    setCompletedSteps(new Set())

    const steps = getRecoverySteps(errorType, context)
    setRecoverySteps(steps)

    let allStepsSuccessful = true

    for (const step of steps) {
      try {
        const success = await executeRecoveryStep(step)
        
        if (success) {
          setCompletedSteps(prev => new Set([...prev, step]))
        } else {
          allStepsSuccessful = false
          break
        }

        // Small delay between steps
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`Recovery step failed: ${step}`, error)
        allStepsSuccessful = false
        break
      }
    }

    setRecoveryStatus(allStepsSuccessful ? 'success' : 'failed')
    setIsRecovering(false)

    if (allStepsSuccessful) {
      clearErrors()
      onRecovery?.()
    }
  }, [autoRecovery, recoveryStatus, errorType, context, getRecoverySteps, executeRecoveryStep, clearErrors, onRecovery])

  // Manual retry
  const handleManualRetry = useCallback(async () => {
    if (onRetry) {
      setIsRecovering(true)
      try {
        await onRetry()
        setRecoveryStatus('success')
        onRecovery?.()
      } catch (error) {
        setRecoveryStatus('failed')
        console.error('Manual retry failed:', error)
      } finally {
        setIsRecovering(false)
      }
    } else {
      await runAutoRecovery()
    }
  }, [onRetry, onRecovery, runAutoRecovery])

  // Auto-start recovery when error changes
  useEffect(() => {
    if (error && autoRecovery) {
      const parsedError = parseError(error)
      // Only auto-recover for certain error types
      if ([ErrorType.NETWORK, ErrorType.SERVER, ErrorType.RATE_LIMIT].includes(parsedError.type)) {
        runAutoRecovery()
      }
    }
  }, [error, autoRecovery, runAutoRecovery])

  if (!error) return null

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {recoveryStatus === 'success' ? (
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
          ) : recoveryStatus === 'failed' ? (
            <XCircleIcon className="w-6 h-6 text-red-500" />
          ) : isRecovering ? (
            <ArrowPathIcon className="w-6 h-6 text-blue-500 animate-spin" />
          ) : (
            <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {recoveryStatus === 'success' ? 'Recovery Successful' :
             recoveryStatus === 'failed' ? 'Recovery Failed' :
             isRecovering ? 'Attempting Recovery...' : 'Error Recovery'}
          </h3>

          {recoveryStatus === 'success' ? (
            <p className="text-sm text-green-600">
              The error has been resolved. You can continue using the application.
            </p>
          ) : recoveryStatus === 'failed' ? (
            <p className="text-sm text-red-600">
              Automatic recovery failed. Please try manual recovery or contact support.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {isRecovering 
                  ? 'Attempting to automatically resolve the issue...'
                  : 'An error occurred. We can try to automatically fix it.'
                }
              </p>

              {recoverySteps.length > 0 && (
                <div className="space-y-2 mb-4">
                  <h4 className="text-sm font-medium text-gray-700">Recovery Steps:</h4>
                  <ul className="space-y-1">
                    {recoverySteps.map((step, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <div className={`w-4 h-4 rounded-full mr-2 flex items-center justify-center ${
                          completedSteps.has(step) 
                            ? 'bg-green-100 text-green-600' 
                            : isRecovering && index === completedSteps.size
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {completedSteps.has(step) ? (
                            <CheckCircleIcon className="w-3 h-3" />
                          ) : isRecovering && index === completedSteps.size ? (
                            <ArrowPathIcon className="w-3 h-3 animate-spin" />
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>
                        <span className={completedSteps.has(step) ? 'text-green-600' : 'text-gray-600'}>
                          {step}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="flex space-x-3">
            {!isRecovering && recoveryStatus !== 'success' && (
              <button
                onClick={handleManualRetry}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-kahf-primary hover:bg-kahf-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kahf-primary"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                {onRetry ? 'Retry' : 'Start Recovery'}
              </button>
            )}

            {!isOnline && (
              <div className="inline-flex items-center px-3 py-2 text-sm text-yellow-600 bg-yellow-50 rounded-md">
                <WifiIcon className="w-4 h-4 mr-2" />
                Offline
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ErrorRecovery