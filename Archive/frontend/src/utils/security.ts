/**
 * Security Utilities - Helper functions for security operations
 */

import securityService, { SecurityEventType } from '@/services/security'

/**
 * Content Security Policy utilities
 */
export const CSP = {
  /**
   * Generate nonce for inline scripts
   */
  generateNonce(): string {
    const array = new Uint8Array(16)
    crypto.getRandomValues(array)
    return btoa(String.fromCharCode(...array))
  },

  /**
   * Create CSP header value
   */
  createCSPHeader(nonce?: string): string {
    const directives = [
      "default-src 'self'",
      `script-src 'self' ${nonce ? `'nonce-${nonce}'` : "'unsafe-inline'"}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ]
    return directives.join('; ')
  }
}

/**
 * Input sanitization utilities
 */
export const Sanitizer = {
  /**
   * Remove HTML tags from string
   */
  stripHTML(input: string): string {
    const div = document.createElement('div')
    div.textContent = input
    return div.innerHTML
  },

  /**
   * Sanitize filename for safe usage
   */
  sanitizeFilename(filename: string): string {
    return filename
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255)
  },

  /**
   * Sanitize URL to prevent javascript: and data: protocols
   */
  sanitizeURL(url: string): string {
    try {
      const parsed = new URL(url)
      if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
        return url
      }
      return '#'
    } catch {
      return '#'
    }
  },

  /**
   * Escape HTML entities
   */
  escapeHTML(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

/**
 * Cryptographic utilities
 */
export const Crypto = {
  /**
   * Generate secure random string
   */
  generateSecureRandom(length: number = 32): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  },

  /**
   * Generate UUID v4
   */
  generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  },

  /**
   * Hash string using SHA-256
   */
  async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(input)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }
}

/**
 * Rate limiting utilities
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()

  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}

  /**
   * Check if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'rate_limit_exceeded',
        identifier,
        requestCount: validRequests.length,
        maxRequests: this.maxRequests,
        windowMs: this.windowMs
      }, 'medium')
      return false
    }

    // Add current request
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    
    return true
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier: string): void {
    this.requests.delete(identifier)
  }

  /**
   * Clear all rate limits
   */
  clear(): void {
    this.requests.clear()
  }
}

/**
 * Security headers utilities
 */
export const SecurityHeaders = {
  /**
   * Set security headers on fetch requests
   */
  addSecurityHeaders(headers: Record<string, string> = {}): Record<string, string> {
    return {
      ...headers,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },

  /**
   * Validate response headers for security
   */
  validateResponseHeaders(headers: Headers): boolean {
    const requiredHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'x-xss-protection'
    ]

    const missingHeaders = requiredHeaders.filter(header => !headers.has(header))
    
    if (missingHeaders.length > 0) {
      securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'missing_security_headers',
        missingHeaders
      }, 'medium')
      return false
    }

    return true
  }
}

/**
 * DOM security utilities
 */
export const DOMSecurity = {
  /**
   * Safely set innerHTML with sanitization
   */
  safeSetInnerHTML(element: HTMLElement, html: string): void {
    // Create a temporary element to parse HTML
    const temp = document.createElement('div')
    temp.innerHTML = html

    // Remove dangerous elements and attributes
    const dangerousElements = temp.querySelectorAll('script, object, embed, iframe, form')
    dangerousElements.forEach(el => el.remove())

    const allElements = temp.querySelectorAll('*')
    allElements.forEach(el => {
      // Remove event handler attributes
      const attributes = Array.from(el.attributes)
      attributes.forEach(attr => {
        if (attr.name.startsWith('on') || attr.name === 'javascript:') {
          el.removeAttribute(attr.name)
        }
      })
    })

    element.innerHTML = temp.innerHTML
  },

  /**
   * Create secure element with validation
   */
  createSecureElement(tagName: string, attributes: Record<string, string> = {}): HTMLElement {
    const element = document.createElement(tagName)
    
    Object.entries(attributes).forEach(([key, value]) => {
      // Validate attribute name and value
      if (!key.startsWith('on') && !value.includes('javascript:')) {
        element.setAttribute(key, Sanitizer.escapeHTML(value))
      } else {
        securityService.logSecurityEvent(SecurityEventType.XSS_ATTEMPT, {
          action: 'dangerous_attribute_blocked',
          tagName,
          attribute: key,
          value
        }, 'high')
      }
    })

    return element
  }
}

/**
 * Session security utilities
 */
export const SessionSecurity = {
  /**
   * Generate secure session ID
   */
  generateSessionId(): string {
    return `session_${Crypto.generateSecureRandom(32)}_${Date.now()}`
  },

  /**
   * Validate session ID format
   */
  validateSessionId(sessionId: string): boolean {
    const pattern = /^session_[a-f0-9]{64}_\d+$/
    return pattern.test(sessionId)
  },

  /**
   * Check if session is expired
   */
  isSessionExpired(sessionId: string, maxAge: number = 24 * 60 * 60 * 1000): boolean {
    try {
      const timestamp = parseInt(sessionId.split('_').pop() || '0')
      return Date.now() - timestamp > maxAge
    } catch {
      return true
    }
  }
}

/**
 * File security utilities
 */
export const FileSecurity = {
  /**
   * Validate file type
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
  },

  /**
   * Validate file size
   */
  validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize
  },

  /**
   * Scan file name for security issues
   */
  validateFileName(fileName: string): boolean {
    const dangerousPatterns = [
      /\.\./,  // Directory traversal
      /[<>:"|?*]/,  // Invalid characters
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,  // Reserved names
      /\.(exe|bat|cmd|scr|pif|com)$/i  // Executable extensions
    ]

    return !dangerousPatterns.some(pattern => pattern.test(fileName))
  }
}

/**
 * Network security utilities
 */
export const NetworkSecurity = {
  /**
   * Validate URL for security
   */
  validateURL(url: string): boolean {
    try {
      const parsed = new URL(url)
      
      // Check for dangerous protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false
      }

      // Check for private IP ranges (basic check)
      const hostname = parsed.hostname
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.')) {
        return false
      }

      return true
    } catch {
      return false
    }
  },

  /**
   * Create secure fetch options
   */
  createSecureFetchOptions(options: RequestInit = {}): RequestInit {
    return {
      ...options,
      credentials: 'same-origin',
      mode: 'cors',
      cache: 'no-cache',
      headers: SecurityHeaders.addSecurityHeaders(options.headers as Record<string, string>)
    }
  }
}

// Export default security utilities object
export default {
  CSP,
  Sanitizer,
  Crypto,
  RateLimiter,
  SecurityHeaders,
  DOMSecurity,
  SessionSecurity,
  FileSecurity,
  NetworkSecurity
}