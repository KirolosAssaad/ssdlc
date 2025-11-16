/**
 * Global state provider that manages data synchronization between
 * React Query and Zustand stores, and provides global error handling
 */

import React, { useEffect, ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useAuthIntegration } from '@/hooks/useAuthIntegration'
import { useDataSync } from '@/hooks/useDataSync'
import { useLoadingError } from '@/hooks/useLoadingError'
import { useUIActions } from '@/store'

interface StateProviderProps {
  children: ReactNode
}

export const StateProvider: React.FC<StateProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0()
  const { syncAfterAuth } = useDataSync()
  const { setLoading, hasCriticalErrors } = useLoadingError()
  const { addNotification } = useUIActions()
  
  // Initialize auth integration
  useAuthIntegration()
  
  // Sync data when authentication state changes
  useEffect(() => {
    if (!isLoading) {
      syncAfterAuth(isAuthenticated)
    }
  }, [isAuthenticated, isLoading, syncAfterAuth])
  
  // Set global loading state based on auth loading
  useEffect(() => {
    setLoading(isLoading, isLoading ? 'Authenticating...' : '')
  }, [isLoading, setLoading])
  
  // Monitor for critical errors and show notifications
  useEffect(() => {
    if (hasCriticalErrors()) {
      addNotification({
        type: 'warning',
        title: 'Connection Issues',
        message: 'Some features may not work properly due to connection issues.',
        duration: 10000,
      })
    }
  }, [hasCriticalErrors, addNotification])
  
  // Global error boundary effect
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
      addNotification({
        type: 'error',
        title: 'Unexpected Error',
        message: 'An unexpected error occurred. Please try refreshing the page.',
        duration: 8000,
      })
    }
    
    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error)
      addNotification({
        type: 'error',
        title: 'Application Error',
        message: 'An error occurred in the application. Please try refreshing the page.',
        duration: 8000,
      })
    }
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    window.addEventListener('error', handleError)
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      window.removeEventListener('error', handleError)
    }
  }, [addNotification])
  
  return <>{children}</>
}

export default StateProvider