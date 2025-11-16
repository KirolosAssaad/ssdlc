/**
 * Retry button component with loading states and retry logic
 * Provides user-friendly retry functionality for failed operations
 */

import React, { useState } from 'react'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

interface RetryButtonProps {
  onRetry: () => Promise<void> | void
  disabled?: boolean
  loading?: boolean
  className?: string
  children?: React.ReactNode
  maxRetries?: number
  retryDelay?: number
  showRetryCount?: boolean
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onRetry,
  disabled = false,
  loading = false,
  className = '',
  children = 'Try Again',
  maxRetries = 3,
  retryDelay = 1000,
  showRetryCount = false
}) => {
  const [isRetrying, setIsRetrying] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [cooldownTime, setCooldownTime] = useState(0)

  const handleRetry = async () => {
    if (disabled || isRetrying || cooldownTime > 0) {
      return
    }

    if (retryCount >= maxRetries) {
      return
    }

    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    try {
      await onRetry()
    } catch (error) {
      console.error('Retry failed:', error)
      
      // Start cooldown if we haven't reached max retries
      if (retryCount + 1 < maxRetries) {
        setCooldownTime(retryDelay / 1000)
        
        const interval = setInterval(() => {
          setCooldownTime(prev => {
            if (prev <= 1) {
              clearInterval(interval)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    } finally {
      setIsRetrying(false)
    }
  }

  const isDisabled = disabled || isRetrying || loading || cooldownTime > 0 || retryCount >= maxRetries
  const isLoading = isRetrying || loading

  const getButtonText = () => {
    if (cooldownTime > 0) {
      return `Retry in ${cooldownTime}s`
    }
    
    if (retryCount >= maxRetries) {
      return 'Max retries reached'
    }
    
    if (isLoading) {
      return 'Retrying...'
    }
    
    if (showRetryCount && retryCount > 0) {
      return `${children} (${retryCount}/${maxRetries})`
    }
    
    return children
  }

  return (
    <button
      onClick={handleRetry}
      disabled={isDisabled}
      className={`
        inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-kahf-primary
        ${isDisabled 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-kahf-primary text-white hover:bg-kahf-primary-dark'
        }
        ${className}
      `}
    >
      <ArrowPathIcon 
        className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} 
      />
      {getButtonText()}
    </button>
  )
}

// Hook for managing retry state
export const useRetryState = (maxRetries: number = 3) => {
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const [lastError, setLastError] = useState<Error | null>(null)

  const retry = async (operation: () => Promise<void>) => {
    if (retryCount >= maxRetries) {
      throw new Error('Maximum retry attempts reached')
    }

    setIsRetrying(true)
    setRetryCount(prev => prev + 1)

    try {
      await operation()
      setLastError(null)
    } catch (error) {
      setLastError(error as Error)
      throw error
    } finally {
      setIsRetrying(false)
    }
  }

  const reset = () => {
    setRetryCount(0)
    setIsRetrying(false)
    setLastError(null)
  }

  const canRetry = retryCount < maxRetries && !isRetrying

  return {
    retryCount,
    isRetrying,
    lastError,
    canRetry,
    retry,
    reset
  }
}

export default RetryButton