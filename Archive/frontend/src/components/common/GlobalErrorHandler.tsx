/**
 * Global error handler component
 * Provides application-wide error handling and user feedback
 */

import React, { useEffect } from 'react'
import { ToastContainer } from './Toast'
import { useNotifications } from '@/store/uiStore'
import { useNetworkStatus, NetworkStatusIndicator } from '@/hooks/useNetworkStatus'
import { useErrorHandler } from '@/hooks/useErrorHandler'

interface GlobalErrorHandlerProps {
  children: React.ReactNode
}

export const GlobalErrorHandler: React.FC<GlobalErrorHandlerProps> = ({ children }) => {
  const { notifications, remove } = useNotifications()
  const { isOnline, shouldShowOfflineWarning } = useNetworkStatus()
  const { clearErrors } = useErrorHandler()

  // Handle global unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      
      // Prevent the default browser behavior
      event.preventDefault()
      
      // You could log this to an error reporting service here
      if (process.env.NODE_ENV === 'production') {
        // Example: logErrorToService(event.reason)
      }
    }

    // Handle global JavaScript errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global JavaScript error:', event.error)
      
      // You could log this to an error reporting service here
      if (process.env.NODE_ENV === 'production') {
        // Example: logErrorToService(event.error)
      }
    }

    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleGlobalError)

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleGlobalError)
    }
  }, [])

  // Clear errors when coming back online
  useEffect(() => {
    if (isOnline) {
      // Clear network-related errors when connection is restored
      clearErrors()
    }
  }, [isOnline, clearErrors])

  return (
    <>
      {children}
      
      {/* Toast notifications */}
      <ToastContainer
        notifications={notifications}
        onDismiss={remove}
        position="top-right"
      />
      
      {/* Network status indicator */}
      {shouldShowOfflineWarning() && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-50 border-t border-yellow-200 p-3">
          <div className="flex items-center justify-center">
            <NetworkStatusIndicator showDetails />
          </div>
        </div>
      )}
    </>
  )
}

export default GlobalErrorHandler