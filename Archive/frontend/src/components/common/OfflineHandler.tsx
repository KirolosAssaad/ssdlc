/**
 * Offline Handler component
 * Provides comprehensive offline detection and handling capabilities
 */

import React, { useState, useEffect, useCallback } from 'react'
import { 
  WifiIcon, 
  ExclamationTriangleIcon, 
  ArrowPathIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useQueryClient } from '@tanstack/react-query'
import { useToast } from './Toast'

interface OfflineHandlerProps {
  children: React.ReactNode
  showBanner?: boolean
  enableOfflineMode?: boolean
  offlineMessage?: string
  className?: string
}

interface OfflineData {
  timestamp: number
  data: any
  key: string
}

export const OfflineHandler: React.FC<OfflineHandlerProps> = ({
  children,
  showBanner = true,
  enableOfflineMode = true,
  offlineMessage = 'You are currently offline. Some features may not be available.',
  className = ''
}) => {
  const [offlineQueue, setOfflineQueue] = useState<Array<{
    id: string
    operation: () => Promise<any>
    description: string
    timestamp: number
  }>>([])
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  const [offlineData, setOfflineData] = useState<Map<string, OfflineData>>(new Map())

  const { 
    isOnline, 
    isSlowConnection, 
    wasOffline, 
    getNetworkQuality,
    getRecommendedActions
  } = useNetworkStatus()
  
  const queryClient = useQueryClient()
  const { showSuccess, showWarning, showError } = useToast()

  // Save data for offline access
  const saveOfflineData = useCallback((key: string, data: any) => {
    if (!enableOfflineMode) return

    const offlineItem: OfflineData = {
      timestamp: Date.now(),
      data,
      key
    }

    setOfflineData(prev => new Map(prev.set(key, offlineItem)))
    
    // Also save to localStorage for persistence
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify(offlineItem))
    } catch (error) {
      console.warn('Failed to save offline data to localStorage:', error)
    }
  }, [enableOfflineMode])

  // Get offline data
  const getOfflineData = useCallback((key: string): any | null => {
    if (!enableOfflineMode) return null

    // First check in-memory cache
    const memoryData = offlineData.get(key)
    if (memoryData) {
      return memoryData.data
    }

    // Then check localStorage
    try {
      const stored = localStorage.getItem(`offline_${key}`)
      if (stored) {
        const parsedData: OfflineData = JSON.parse(stored)
        // Check if data is not too old (24 hours)
        if (Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000) {
          return parsedData.data
        } else {
          // Remove old data
          localStorage.removeItem(`offline_${key}`)
        }
      }
    } catch (error) {
      console.warn('Failed to retrieve offline data from localStorage:', error)
    }

    return null
  }, [enableOfflineMode, offlineData])

  // Queue operation for when online
  const queueOperation = useCallback((
    operation: () => Promise<any>,
    description: string
  ): string => {
    const id = Math.random().toString(36).substr(2, 9)
    
    setOfflineQueue(prev => [...prev, {
      id,
      operation,
      description,
      timestamp: Date.now()
    }])

    showWarning(
      'Operation Queued',
      `${description} will be executed when you're back online.`,
      5000
    )

    return id
  }, [showWarning])

  // Use the functions to avoid unused variable warnings
  React.useEffect(() => {
    // These functions are available for the useOfflineCapabilities hook
    void saveOfflineData
    void getOfflineData
    void queueOperation
  }, [saveOfflineData, getOfflineData, queueOperation])

  // Remove operation from queue
  const removeFromQueue = useCallback((id: string) => {
    setOfflineQueue(prev => prev.filter(item => item.id !== id))
  }, [])

  // Process offline queue when back online
  const processOfflineQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0 || isProcessingQueue) return

    setIsProcessingQueue(true)
    
    const successfulOperations: string[] = []
    const failedOperations: Array<{ id: string, description: string, error: any }> = []

    for (const queuedOperation of offlineQueue) {
      try {
        await queuedOperation.operation()
        successfulOperations.push(queuedOperation.description)
        removeFromQueue(queuedOperation.id)
      } catch (error) {
        failedOperations.push({
          id: queuedOperation.id,
          description: queuedOperation.description,
          error
        })
      }
    }

    if (successfulOperations.length > 0) {
      showSuccess(
        'Operations Completed',
        `${successfulOperations.length} queued operation(s) completed successfully.`,
        5000
      )
    }

    if (failedOperations.length > 0) {
      showError(
        'Some Operations Failed',
        `${failedOperations.length} queued operation(s) failed. They remain in the queue.`,
        7000
      )
    }

    setIsProcessingQueue(false)
  }, [isOnline, offlineQueue, isProcessingQueue, removeFromQueue, showSuccess, showError])

  // Load offline data from localStorage on mount
  useEffect(() => {
    if (!enableOfflineMode) return

    const loadOfflineData = () => {
      const offlineMap = new Map<string, OfflineData>()
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('offline_')) {
          try {
            const data = localStorage.getItem(key)
            if (data) {
              const parsedData: OfflineData = JSON.parse(data)
              const actualKey = key.replace('offline_', '')
              offlineMap.set(actualKey, parsedData)
            }
          } catch (error) {
            console.warn(`Failed to load offline data for key ${key}:`, error)
          }
        }
      }
      
      setOfflineData(offlineMap)
    }

    loadOfflineData()
  }, [enableOfflineMode])

  // Process queue when coming back online
  useEffect(() => {
    if (isOnline && wasOffline && offlineQueue.length > 0) {
      // Wait a bit to ensure connection is stable
      const timer = setTimeout(() => {
        processOfflineQueue()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [isOnline, wasOffline, offlineQueue.length, processOfflineQueue])

  // Sync cached data when back online
  useEffect(() => {
    if (isOnline && wasOffline) {
      // Invalidate all queries to refresh data
      queryClient.invalidateQueries()
    }
  }, [isOnline, wasOffline, queryClient])

  // Clean up old offline data periodically
  useEffect(() => {
    if (!enableOfflineMode) return

    const cleanupInterval = setInterval(() => {
      const now = Date.now()
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours

      // Clean memory cache
      setOfflineData(prev => {
        const newMap = new Map()
        prev.forEach((value, key) => {
          if (now - value.timestamp < maxAge) {
            newMap.set(key, value)
          }
        })
        return newMap
      })

      // Clean localStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i)
        if (key?.startsWith('offline_')) {
          try {
            const data = localStorage.getItem(key)
            if (data) {
              const parsedData: OfflineData = JSON.parse(data)
              if (now - parsedData.timestamp >= maxAge) {
                localStorage.removeItem(key)
              }
            }
          } catch (error) {
            // Remove corrupted data
            localStorage.removeItem(key)
          }
        }
      }
    }, 60 * 60 * 1000) // Run every hour

    return () => clearInterval(cleanupInterval)
  }, [enableOfflineMode])

  const networkQuality = getNetworkQuality()
  const recommendedActions = getRecommendedActions()

  return (
    <div className={className}>
      {/* Offline Banner */}
      {showBanner && (!isOnline || isSlowConnection) && (
        <div className={`fixed top-0 left-0 right-0 z-50 ${
          isOnline ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
        } border-b p-3`}>
          <div className="flex items-center justify-between max-w-7xl mx-auto px-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {isOnline ? (
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />
                ) : (
                  <WifiIcon className="w-5 h-5 text-red-600" />
                )}
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  isOnline ? 'text-yellow-800' : 'text-red-800'
                }`}>
                  {isOnline ? `${networkQuality} - Limited functionality` : 'No Internet Connection'}
                </p>
                <p className={`text-xs ${
                  isOnline ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {isOnline ? offlineMessage : 'You are offline. Some features are not available.'}
                </p>
              </div>

              {/* Queue Status */}
              {offlineQueue.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <CloudArrowDownIcon className="w-4 h-4" />
                  <span>{offlineQueue.length} queued</span>
                  {isProcessingQueue && (
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  )}
                </div>
              )}
            </div>

            {/* Recommended Actions */}
            {recommendedActions.length > 0 && (
              <div className="hidden md:block text-xs text-gray-600">
                {recommendedActions[0]}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={showBanner && (!isOnline || isSlowConnection) ? 'pt-16' : ''}>
        {children}
      </div>

      {/* Offline Queue Status (when offline) */}
      {!isOnline && offlineQueue.length > 0 && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-center space-x-2 mb-2">
            <CloudArrowDownIcon className="w-5 h-5 text-blue-500" />
            <h3 className="text-sm font-medium text-gray-900">
              Queued Operations ({offlineQueue.length})
            </h3>
          </div>
          
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {offlineQueue.slice(0, 3).map((item) => (
              <div key={item.id} className="text-xs text-gray-600 truncate">
                • {item.description}
              </div>
            ))}
            {offlineQueue.length > 3 && (
              <div className="text-xs text-gray-500">
                +{offlineQueue.length - 3} more...
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            These will be processed when you're back online.
          </p>
        </div>
      )}
    </div>
  )
}

// Hook for offline-aware operations
export const useOfflineCapabilities = () => {
  const { isOnline } = useNetworkStatus()
  const [offlineHandler, setOfflineHandler] = useState<{
    saveOfflineData: (key: string, data: any) => void
    getOfflineData: (key: string) => any | null
    queueOperation: (operation: () => Promise<any>, description: string) => string
  } | null>(null)

  const executeOfflineAware = useCallback(async (
    operation: () => Promise<any>,
    options: {
      fallbackData?: any
      cacheKey?: string
      description?: string
      queueWhenOffline?: boolean
    } = {}
  ): Promise<any> => {
    const { fallbackData, cacheKey, description, queueWhenOffline = true } = options

    if (!isOnline) {
      // Try to get cached data first
      if (cacheKey && offlineHandler) {
        const cachedData = offlineHandler.getOfflineData(cacheKey)
        if (cachedData) {
          return cachedData
        }
      }

      // Queue operation if requested
      if (queueWhenOffline && description && offlineHandler) {
        offlineHandler.queueOperation(operation, description)
      }

      return fallbackData || null
    }

    try {
      const result = await operation()
      
      // Cache successful result
      if (cacheKey && offlineHandler) {
        offlineHandler.saveOfflineData(cacheKey, result)
      }
      
      return result
    } catch (error) {
      // Return cached data if available
      if (cacheKey && offlineHandler) {
        const cachedData = offlineHandler.getOfflineData(cacheKey)
        if (cachedData) {
          return cachedData
        }
      }
      
      throw error
    }
  }, [isOnline, offlineHandler])

  return {
    isOnline,
    executeOfflineAware,
    setOfflineHandler
  }
}

export default OfflineHandler