/**
 * Security Provider - React component for security context and protection
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import securityService, { SecurityEventType, type SecurityEvent } from '@/services/security'
import { tokenManager } from '@/services/tokenManager'

interface SecurityContextType {
  isSecure: boolean
  securityEvents: SecurityEvent[]
  csrfToken: string | null
  validateInput: (input: string, rules: any) => { isValid: boolean; sanitized: string; errors: string[] }
  logSecurityEvent: (type: SecurityEventType, details: Record<string, unknown>, severity: 'low' | 'medium' | 'high' | 'critical') => void
  enforceHTTPS: () => void
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined)

interface SecurityProviderProps {
  children: ReactNode
  enforceHTTPS?: boolean
}

/**
 * Security Provider component that wraps the application with security measures
 */
export const SecurityProvider: React.FC<SecurityProviderProps> = ({ 
  children, 
  enforceHTTPS = true 
}) => {
  const [isSecure, setIsSecure] = useState(false)
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([])
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  useEffect(() => {
    const initializeSecurity = async () => {
      try {
        // Initialize secure token storage
        await tokenManager.initializeSecureStorage()
        
        // Enforce HTTPS if required
        if (enforceHTTPS) {
          securityService.enforceHTTPS()
        }
        
        // Generate initial CSRF token
        const token = securityService.generateCSRFToken()
        setCsrfToken(token)
        
        // Set up security event monitoring
        const events = securityService.getSecurityEvents()
        setSecurityEvents(events)
        
        setIsSecure(true)
        
        // Log security initialization
        securityService.logSecurityEvent(SecurityEventType.LOGIN_SUCCESS, {
          action: 'security_provider_initialized',
          httpsEnforced: enforceHTTPS
        }, 'low')
        
      } catch (error) {
        console.error('Failed to initialize security:', error)
        securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'security_initialization_failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        }, 'high')
      }
    }

    initializeSecurity()

    // Set up periodic security checks
    const securityCheckInterval = setInterval(() => {
      // Update security events
      const events = securityService.getSecurityEvents()
      setSecurityEvents(events)
      
      // Refresh CSRF token if needed
      const currentToken = securityService.getCSRFToken()
      if (currentToken !== csrfToken) {
        setCsrfToken(currentToken)
      }
    }, 30000) // Check every 30 seconds

    // Cleanup
    return () => {
      clearInterval(securityCheckInterval)
    }
  }, [enforceHTTPS, csrfToken])

  // Set up global security event handlers
  useEffect(() => {
    const handleBeforeUnload = () => {
      securityService.logSecurityEvent(SecurityEventType.LOGOUT, {
        action: 'page_unload'
      }, 'low')
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'page_hidden'
        }, 'low')
      } else {
        securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'page_visible'
        }, 'low')
      }
    }

    const handleFocus = () => {
      securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'window_focus'
      }, 'low')
    }

    const handleBlur = () => {
      securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'window_blur'
      }, 'low')
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  const contextValue: SecurityContextType = {
    isSecure,
    securityEvents,
    csrfToken,
    validateInput: securityService.validateInput.bind(securityService),
    logSecurityEvent: securityService.logSecurityEvent.bind(securityService),
    enforceHTTPS: securityService.enforceHTTPS.bind(securityService)
  }

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  )
}

/**
 * Hook to use security context
 */
export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext)
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider')
  }
  return context
}

/**
 * HOC for components that need security protection
 */
export const withSecurity = <P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> => {
  return (props: P) => {
    const { isSecure, logSecurityEvent } = useSecurity()
    
    useEffect(() => {
      logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'component_mounted',
        component: Component.name || 'Anonymous'
      }, 'low')
    }, [logSecurityEvent])

    if (!isSecure) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#964722] mx-auto mb-4"></div>
            <p className="text-gray-600">Initializing security...</p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }
}

export default SecurityProvider