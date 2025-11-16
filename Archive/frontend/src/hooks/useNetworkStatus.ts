/**
 * Network connectivity detection and offline handling
 * Provides real-time network status monitoring and offline capabilities
 */

import React, { useState, useEffect, useCallback } from 'react'
import { useUIActions } from '@/store/uiStore'

interface NetworkStatus {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType?: string
  effectiveType?: string
  downlink?: number
  rtt?: number
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    isSlowConnection: false
  })
  const [wasOffline, setWasOffline] = useState(false)
  const { addNotification } = useUIActions()

  // Get connection information if available
  const getConnectionInfo = useCallback((): Partial<NetworkStatus> => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    if (!connection) {
      return {}
    }

    const isSlowConnection = 
      connection.effectiveType === 'slow-2g' || 
      connection.effectiveType === '2g' ||
      (connection.downlink && connection.downlink < 1.5)

    return {
      connectionType: connection.type,
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      isSlowConnection
    }
  }, [])

  // Update network status
  const updateNetworkStatus = useCallback(() => {
    const isOnline = navigator.onLine
    const connectionInfo = getConnectionInfo()

    setNetworkStatus(prev => ({
      ...prev,
      isOnline,
      ...connectionInfo
    }))

    // Handle online/offline transitions
    if (isOnline && wasOffline) {
      addNotification({
        type: 'success',
        title: 'Back Online',
        message: 'Your internet connection has been restored.',
        duration: 3000
      })
      setWasOffline(false)
    } else if (!isOnline && !wasOffline) {
      addNotification({
        type: 'warning',
        title: 'No Internet Connection',
        message: 'You\'re currently offline. Some features may not be available.',
        duration: 5000
      })
      setWasOffline(true)
    }
  }, [wasOffline, getConnectionInfo, addNotification])

  // Handle connection change
  const handleConnectionChange = useCallback(() => {
    updateNetworkStatus()
  }, [updateNetworkStatus])

  // Set up event listeners
  useEffect(() => {
    // Initial status update
    updateNetworkStatus()

    // Listen for online/offline events
    window.addEventListener('online', handleConnectionChange)
    window.addEventListener('offline', handleConnectionChange)

    // Listen for connection changes (if supported)
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    if (connection) {
      connection.addEventListener('change', handleConnectionChange)
    }

    return () => {
      window.removeEventListener('online', handleConnectionChange)
      window.removeEventListener('offline', handleConnectionChange)
      
      if (connection) {
        connection.removeEventListener('change', handleConnectionChange)
      }
    }
  }, [handleConnectionChange, updateNetworkStatus])

  // Ping server to verify actual connectivity
  const pingServer = useCallback(async (url: string = '/api/health'): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch (error) {
      console.warn('Server ping failed:', error)
      return false
    }
  }, [])

  // Check if we can reach the server
  const checkServerConnectivity = useCallback(async (): Promise<boolean> => {
    if (!networkStatus.isOnline) {
      return false
    }

    return await pingServer()
  }, [networkStatus.isOnline, pingServer])

  // Get network quality description
  const getNetworkQuality = useCallback((): string => {
    if (!networkStatus.isOnline) {
      return 'Offline'
    }

    if (networkStatus.isSlowConnection) {
      return 'Slow Connection'
    }

    switch (networkStatus.effectiveType) {
      case '4g':
        return 'Fast Connection'
      case '3g':
        return 'Good Connection'
      case '2g':
      case 'slow-2g':
        return 'Slow Connection'
      default:
        return 'Online'
    }
  }, [networkStatus])

  // Check if we should show offline warning
  const shouldShowOfflineWarning = useCallback((): boolean => {
    return !networkStatus.isOnline || networkStatus.isSlowConnection
  }, [networkStatus])

  // Get recommended actions for current network state
  const getRecommendedActions = useCallback((): string[] => {
    const actions: string[] = []

    if (!networkStatus.isOnline) {
      actions.push('Check your internet connection')
      actions.push('Try refreshing the page')
    } else if (networkStatus.isSlowConnection) {
      actions.push('Consider switching to a faster connection')
      actions.push('Some features may load slowly')
    }

    return actions
  }, [networkStatus])

  return {
    networkStatus,
    isOnline: networkStatus.isOnline,
    isSlowConnection: networkStatus.isSlowConnection,
    connectionType: networkStatus.connectionType,
    effectiveType: networkStatus.effectiveType,
    downlink: networkStatus.downlink,
    rtt: networkStatus.rtt,
    wasOffline,
    
    // Methods
    pingServer,
    checkServerConnectivity,
    getNetworkQuality,
    shouldShowOfflineWarning,
    getRecommendedActions,
    updateNetworkStatus
  }
}

// Hook for offline-aware data fetching
export const useOfflineAwareQuery = () => {
  const { isOnline, checkServerConnectivity } = useNetworkStatus()
  const { addNotification } = useUIActions()

  const executeWithConnectivityCheck = useCallback(async <T>(
    operation: () => Promise<T>,
    options?: {
      showOfflineMessage?: boolean
      fallbackData?: T
    }
  ): Promise<T | null> => {
    const { showOfflineMessage = true, fallbackData } = options || {}

    // Check basic online status
    if (!isOnline) {
      if (showOfflineMessage) {
        addNotification({
          type: 'warning',
          title: 'Offline',
          message: 'This action requires an internet connection.',
          duration: 3000
        })
      }
      return fallbackData || null
    }

    // Check server connectivity
    const canReachServer = await checkServerConnectivity()
    if (!canReachServer) {
      if (showOfflineMessage) {
        addNotification({
          type: 'error',
          title: 'Server Unreachable',
          message: 'Unable to connect to the server. Please try again later.',
          duration: 5000
        })
      }
      return fallbackData || null
    }

    try {
      return await operation()
    } catch (error) {
      console.error('Operation failed:', error)
      throw error
    }
  }, [isOnline, checkServerConnectivity, addNotification])

  return {
    executeWithConnectivityCheck,
    isOnline,
    checkServerConnectivity
  }
}

// Component for displaying network status
interface NetworkStatusIndicatorProps {
  className?: string
  showDetails?: boolean
}

export const NetworkStatusIndicator: React.FC<NetworkStatusIndicatorProps> = ({
  className = '',
  showDetails = false
}) => {
  const { networkStatus, getNetworkQuality, shouldShowOfflineWarning } = useNetworkStatus()

  if (!shouldShowOfflineWarning()) {
    return null
  }

  const statusColor = networkStatus.isOnline ? 'bg-yellow-400' : 'bg-red-400'
  const textColor = networkStatus.isOnline ? 'text-yellow-600' : 'text-red-600'

  return React.createElement('div', 
    { className: `flex items-center space-x-2 text-sm ${className}` },
    React.createElement('div', { className: `w-2 h-2 rounded-full ${statusColor}` }),
    React.createElement('span', { className: textColor }, getNetworkQuality()),
    showDetails && networkStatus.effectiveType && 
      React.createElement('span', { className: 'text-gray-500' }, `(${networkStatus.effectiveType})`)
  )
}

export default useNetworkStatus