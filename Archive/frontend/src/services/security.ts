/**
 * Security Service - Comprehensive security implementation
 * Handles CSRF protection, XSS prevention, input validation, and security headers
 */

import { tokenManager } from './tokenManager'

/**
 * Security event types for audit logging
 */
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  DRM_ACCESS = 'DRM_ACCESS',
  DRM_VIOLATION = 'DRM_VIOLATION',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  CSRF_ATTEMPT = 'CSRF_ATTEMPT',
  INPUT_VALIDATION_FAILURE = 'INPUT_VALIDATION_FAILURE'
}

/**
 * Security event interface for audit logging
 */
export interface SecurityEvent {
  id: string
  timestamp: string
  type: SecurityEventType
  userId?: string
  details: Record<string, unknown>
  severity: 'low' | 'medium' | 'high' | 'critical'
  userAgent: string
  sessionId: string
}

/**
 * Input validation rules
 */
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  customValidator?: (value: string) => boolean
  sanitize?: boolean
}

/**
 * CSRF token interface
 */
interface CsrfToken {
  token: string
  timestamp: number
  expiresAt: number
}

/**
 * Security Service class implementing comprehensive security measures
 */
class SecurityService {
  private sessionId: string
  private csrfToken: CsrfToken | null = null
  private securityEvents: SecurityEvent[] = []
  private maxEventHistory = 1000
  private csrfTokenExpiry = 30 * 60 * 1000 // 30 minutes

  constructor() {
    this.sessionId = this.generateSessionId()
    this.initializeSecurity()
  }

  /**
   * Initialize security measures
   */
  private initializeSecurity(): void {
    this.setupSecurityHeaders()
    this.setupGlobalErrorHandling()
    this.setupCSRFProtection()
    this.setupXSSProtection()
    this.monitorSuspiciousActivity()
  }

  // =============================================================================
  // CSRF PROTECTION
  // =============================================================================

  /**
   * Generate CSRF token
   */
  generateCSRFToken(): string {
    const token = this.generateSecureToken()
    const now = Date.now()
    
    this.csrfToken = {
      token,
      timestamp: now,
      expiresAt: now + this.csrfTokenExpiry
    }

    // Store in sessionStorage for persistence across page reloads
    sessionStorage.setItem('csrf_token', JSON.stringify(this.csrfToken))
    
    this.logSecurityEvent(SecurityEventType.CSRF_ATTEMPT, {
      action: 'token_generated',
      tokenId: token.substring(0, 8)
    }, 'low')

    return token
  }

  /**
   * Validate CSRF token
   */
  validateCSRFToken(token: string): boolean {
    if (!this.csrfToken) {
      // Try to restore from sessionStorage
      const stored = sessionStorage.getItem('csrf_token')
      if (stored) {
        try {
          this.csrfToken = JSON.parse(stored)
        } catch {
          return false
        }
      } else {
        return false
      }
    }

    const now = Date.now()
    
    // Check if token exists and hasn't expired
    if (!this.csrfToken || now > this.csrfToken.expiresAt) {
      this.logSecurityEvent(SecurityEventType.CSRF_ATTEMPT, {
        action: 'token_expired',
        providedToken: token.substring(0, 8)
      }, 'medium')
      return false
    }

    // Validate token
    const isValid = this.csrfToken.token === token
    
    if (!isValid) {
      this.logSecurityEvent(SecurityEventType.CSRF_ATTEMPT, {
        action: 'token_invalid',
        providedToken: token.substring(0, 8),
        expectedToken: this.csrfToken.token.substring(0, 8)
      }, 'high')
    }

    return isValid
  }

  /**
   * Get current CSRF token
   */
  getCSRFToken(): string | null {
    if (!this.csrfToken || Date.now() > this.csrfToken.expiresAt) {
      return this.generateCSRFToken()
    }
    return this.csrfToken.token
  }

  /**
   * Setup CSRF protection for forms
   */
  private setupCSRFProtection(): void {
    // Add CSRF token to all forms
    document.addEventListener('DOMContentLoaded', () => {
      this.addCSRFTokenToForms()
    })

    // Monitor form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement
      if (form && !this.validateFormCSRF(form)) {
        event.preventDefault()
        this.logSecurityEvent(SecurityEventType.CSRF_ATTEMPT, {
          action: 'form_submission_blocked',
          formAction: form.action
        }, 'high')
      }
    })
  }

  /**
   * Add CSRF token to all forms
   */
  private addCSRFTokenToForms(): void {
    const forms = document.querySelectorAll('form')
    forms.forEach(form => {
      if (!form.querySelector('input[name="csrf_token"]')) {
        const csrfInput = document.createElement('input')
        csrfInput.type = 'hidden'
        csrfInput.name = 'csrf_token'
        csrfInput.value = this.getCSRFToken() || ''
        form.appendChild(csrfInput)
      }
    })
  }

  /**
   * Validate CSRF token in form
   */
  private validateFormCSRF(form: HTMLFormElement): boolean {
    const csrfInput = form.querySelector('input[name="csrf_token"]') as HTMLInputElement
    if (!csrfInput) {
      return false
    }
    return this.validateCSRFToken(csrfInput.value)
  }

  // =============================================================================
  // XSS PROTECTION
  // =============================================================================

  /**
   * Sanitize HTML content to prevent XSS
   */
  sanitizeHTML(html: string): string {
    const div = document.createElement('div')
    div.textContent = html
    return div.innerHTML
  }

  /**
   * Sanitize user input
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .replace(/data:/gi, '') // Remove data: protocol
      .trim()
  }

  /**
   * Validate and sanitize input based on rules
   */
  validateInput(input: string, rules: ValidationRule): { isValid: boolean; sanitized: string; errors: string[] } {
    const errors: string[] = []
    let sanitized = rules.sanitize ? this.sanitizeInput(input) : input

    // Required validation
    if (rules.required && !sanitized.trim()) {
      errors.push('This field is required')
    }

    // Length validation
    if (rules.minLength && sanitized.length < rules.minLength) {
      errors.push(`Minimum length is ${rules.minLength} characters`)
    }

    if (rules.maxLength && sanitized.length > rules.maxLength) {
      errors.push(`Maximum length is ${rules.maxLength} characters`)
      sanitized = sanitized.substring(0, rules.maxLength)
    }

    // Pattern validation
    if (rules.pattern && !rules.pattern.test(sanitized)) {
      errors.push('Invalid format')
    }

    // Custom validation
    if (rules.customValidator && !rules.customValidator(sanitized)) {
      errors.push('Invalid value')
    }

    // Check for potential XSS
    if (this.detectXSS(sanitized)) {
      errors.push('Invalid characters detected')
      this.logSecurityEvent(SecurityEventType.XSS_ATTEMPT, {
        input: sanitized.substring(0, 100),
        rules
      }, 'high')
    }

    if (errors.length > 0) {
      this.logSecurityEvent(SecurityEventType.INPUT_VALIDATION_FAILURE, {
        errors,
        input: sanitized.substring(0, 100)
      }, 'medium')
    }

    return {
      isValid: errors.length === 0,
      sanitized,
      errors
    }
  }

  /**
   * Detect potential XSS attempts
   */
  private detectXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
      /data:text\/html/gi,
      /vbscript:/gi,
      /expression\s*\(/gi
    ]

    return xssPatterns.some(pattern => pattern.test(input))
  }

  /**
   * Setup XSS protection measures
   */
  private setupXSSProtection(): void {
    // Monitor DOM mutations for potential XSS
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              this.scanElementForXSS(element)
            }
          })
        }
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
  }

  /**
   * Scan element for potential XSS
   */
  private scanElementForXSS(element: Element): void {
    // Check for dangerous attributes
    const dangerousAttributes = ['onclick', 'onload', 'onerror', 'onmouseover']
    dangerousAttributes.forEach(attr => {
      if (element.hasAttribute(attr)) {
        this.logSecurityEvent(SecurityEventType.XSS_ATTEMPT, {
          element: element.tagName,
          attribute: attr,
          value: element.getAttribute(attr)
        }, 'high')
        element.removeAttribute(attr)
      }
    })

    // Check for dangerous content
    if (element.innerHTML && this.detectXSS(element.innerHTML)) {
      this.logSecurityEvent(SecurityEventType.XSS_ATTEMPT, {
        element: element.tagName,
        content: element.innerHTML.substring(0, 100)
      }, 'high')
      element.innerHTML = this.sanitizeHTML(element.innerHTML)
    }
  }

  // =============================================================================
  // SECURITY HEADERS
  // =============================================================================

  /**
   * Setup security headers
   */
  private setupSecurityHeaders(): void {
    // Content Security Policy
    this.addMetaTag('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
    )

    // X-Frame-Options
    this.addMetaTag('X-Frame-Options', 'DENY')

    // X-Content-Type-Options
    this.addMetaTag('X-Content-Type-Options', 'nosniff')

    // X-XSS-Protection
    this.addMetaTag('X-XSS-Protection', '1; mode=block')

    // Referrer Policy
    this.addMetaTag('Referrer-Policy', 'strict-origin-when-cross-origin')

    // Permissions Policy
    this.addMetaTag('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=()'
    )
  }

  /**
   * Add meta tag for security headers
   */
  private addMetaTag(name: string, content: string): void {
    const meta = document.createElement('meta')
    meta.httpEquiv = name
    meta.content = content
    document.head.appendChild(meta)
  }

  /**
   * Enforce HTTPS in production
   */
  enforceHTTPS(): void {
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      this.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'http_redirect_to_https',
        originalUrl: location.href
      }, 'medium')
      location.replace(`https:${location.href.substring(location.protocol.length)}`)
    }
  }

  // =============================================================================
  // AUDIT LOGGING
  // =============================================================================

  /**
   * Log security event
   */
  logSecurityEvent(
    type: SecurityEventType,
    details: Record<string, unknown>,
    severity: 'low' | 'medium' | 'high' | 'critical'
  ): void {
    const event: SecurityEvent = {
      id: this.generateSecureToken(),
      timestamp: new Date().toISOString(),
      type,
      userId: this.getCurrentUserId(),
      details,
      severity,
      userAgent: navigator.userAgent,
      sessionId: this.sessionId
    }

    // Add to local event history
    this.securityEvents.push(event)
    
    // Keep only recent events
    if (this.securityEvents.length > this.maxEventHistory) {
      this.securityEvents = this.securityEvents.slice(-this.maxEventHistory)
    }

    // Store in sessionStorage for debugging
    sessionStorage.setItem('security_events', JSON.stringify(this.securityEvents.slice(-100)))

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SECURITY] ${severity.toUpperCase()}: ${type}`, event)
    }

    // In production, this would send to a security monitoring service
    if (severity === 'high' || severity === 'critical') {
      this.handleHighSeverityEvent(event)
    }
  }

  /**
   * Handle high severity security events
   */
  private handleHighSeverityEvent(event: SecurityEvent): void {
    // In a real implementation, this would:
    // 1. Send to security monitoring service
    // 2. Alert security team
    // 3. Potentially block user session
    
    console.warn('[SECURITY ALERT]', event)
    
    // For critical events, consider logging out the user
    if (event.severity === 'critical') {
      this.handleCriticalSecurityEvent(event)
    }
  }

  /**
   * Handle critical security events
   */
  private handleCriticalSecurityEvent(_event: SecurityEvent): void {
    // Log out user and clear tokens
    tokenManager.clearTokens()
    
    // Clear sensitive data
    sessionStorage.clear()
    localStorage.clear()
    
    // Redirect to login
    window.location.href = '/login'
  }

  /**
   * Get security event history
   */
  getSecurityEvents(): SecurityEvent[] {
    return [...this.securityEvents]
  }

  /**
   * Get security events by type
   */
  getSecurityEventsByType(type: SecurityEventType): SecurityEvent[] {
    return this.securityEvents.filter(event => event.type === type)
  }

  // =============================================================================
  // SUSPICIOUS ACTIVITY MONITORING
  // =============================================================================

  /**
   * Monitor for suspicious activity
   */
  private monitorSuspiciousActivity(): void {
    // Monitor rapid requests
    this.monitorRequestFrequency()
    
    // Monitor console access
    this.monitorConsoleAccess()
    
    // Monitor page visibility changes
    this.monitorPageVisibility()
  }

  /**
   * Monitor request frequency for potential abuse
   */
  private monitorRequestFrequency(): void {
    const requestTimes: number[] = []
    const maxRequestsPerMinute = 60
    
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const now = Date.now()
      requestTimes.push(now)
      
      // Remove requests older than 1 minute
      const oneMinuteAgo = now - 60000
      const recentRequests = requestTimes.filter(time => time > oneMinuteAgo)
      
      if (recentRequests.length > maxRequestsPerMinute) {
        this.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'excessive_requests',
          requestCount: recentRequests.length,
          timeWindow: '1 minute'
        }, 'high')
      }
      
      return originalFetch.apply(this, args)
    }
  }

  /**
   * Monitor console access attempts
   */
  private monitorConsoleAccess(): void {
    let consoleAccessCount = 0
    const maxConsoleAccess = 5
    
    const originalLog = console.log
    console.log = (...args) => {
      consoleAccessCount++
      if (consoleAccessCount > maxConsoleAccess) {
        this.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'excessive_console_access',
          accessCount: consoleAccessCount
        }, 'medium')
      }
      return originalLog.apply(console, args)
    }
  }

  /**
   * Monitor page visibility changes
   */
  private monitorPageVisibility(): void {
    let visibilityChanges = 0
    
    document.addEventListener('visibilitychange', () => {
      visibilityChanges++
      
      if (visibilityChanges > 20) {
        this.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'excessive_visibility_changes',
          changeCount: visibilityChanges
        }, 'medium')
      }
    })
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Generate secure random token
   */
  private generateSecureToken(): string {
    const array = new Uint8Array(32)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${this.generateSecureToken()}`
  }

  /**
   * Get current user ID from token
   */
  private getCurrentUserId(): string | undefined {
    const token = tokenManager.getAccessToken()
    if (!token) return undefined
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.sub
    } catch {
      return undefined
    }
  }

  /**
   * Setup global error handling
   */
  private setupGlobalErrorHandling(): void {
    window.addEventListener('error', (event) => {
      this.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }, 'low')
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'unhandled_promise_rejection',
        reason: event.reason?.toString()
      }, 'medium')
    })
  }

  /**
   * Clear all security data
   */
  clearSecurityData(): void {
    this.csrfToken = null
    this.securityEvents = []
    sessionStorage.removeItem('csrf_token')
    sessionStorage.removeItem('security_events')
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId
  }
}

// Create and export singleton instance
const securityService = new SecurityService()
export default securityService