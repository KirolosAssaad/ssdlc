/**
 * Security Configuration - Centralized security settings and policies
 */

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  // CSRF Protection
  csrf: {
    enabled: boolean
    tokenExpiry: number // milliseconds
    headerName: string
  }

  // Rate Limiting
  rateLimiting: {
    enabled: boolean
    maxRequests: number
    windowMs: number
    blockDuration: number
  }

  // Input Validation
  inputValidation: {
    maxLength: number
    sanitizeByDefault: boolean
    allowedTags: string[]
    blockedPatterns: RegExp[]
  }

  // Session Security
  session: {
    maxAge: number // milliseconds
    rotationInterval: number // milliseconds
    secureStorage: boolean
  }

  // DRM Protection
  drm: {
    enabled: boolean
    watermarkEnabled: boolean
    protectionLevel: 'basic' | 'standard' | 'strict'
    allowedViewers: number
    sessionTimeout: number // milliseconds
  }

  // Audit Logging
  audit: {
    enabled: boolean
    maxEvents: number
    retentionPeriod: number // milliseconds
    logLevels: ('low' | 'medium' | 'high' | 'critical')[]
  }

  // Content Security Policy
  csp: {
    enabled: boolean
    reportOnly: boolean
    directives: Record<string, string[]>
  }

  // HTTPS Enforcement
  https: {
    enforceInProduction: boolean
    enforceInDevelopment: boolean
    redirectToHttps: boolean
  }
}

/**
 * Default security configuration
 */
export const defaultSecurityConfig: SecurityConfig = {
  csrf: {
    enabled: true,
    tokenExpiry: 30 * 60 * 1000, // 30 minutes
    headerName: 'X-CSRF-Token'
  },

  rateLimiting: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    blockDuration: 5 * 60 * 1000 // 5 minutes
  },

  inputValidation: {
    maxLength: 10000,
    sanitizeByDefault: true,
    allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
    blockedPatterns: [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi,
      /vbscript:/gi
    ]
  },

  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    rotationInterval: 60 * 60 * 1000, // 1 hour
    secureStorage: true
  },

  drm: {
    enabled: true,
    watermarkEnabled: true,
    protectionLevel: 'standard',
    allowedViewers: 1,
    sessionTimeout: 2 * 60 * 60 * 1000 // 2 hours
  },

  audit: {
    enabled: true,
    maxEvents: 10000,
    retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
    logLevels: ['low', 'medium', 'high', 'critical']
  },

  csp: {
    enabled: true,
    reportOnly: false,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'", 'data:'],
      'connect-src': ["'self'", 'https:'],
      'frame-ancestors': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"]
    }
  },

  https: {
    enforceInProduction: true,
    enforceInDevelopment: false,
    redirectToHttps: true
  }
}

/**
 * Environment-specific security configurations
 */
export const securityConfigs = {
  development: {
    ...defaultSecurityConfig,
    https: {
      ...defaultSecurityConfig.https,
      enforceInDevelopment: false
    },
    csp: {
      ...defaultSecurityConfig.csp,
      reportOnly: true
    },
    rateLimiting: {
      ...defaultSecurityConfig.rateLimiting,
      maxRequests: 1000 // More lenient in development
    }
  },

  production: {
    ...defaultSecurityConfig,
    drm: {
      ...defaultSecurityConfig.drm,
      protectionLevel: 'strict' as const
    },
    rateLimiting: {
      ...defaultSecurityConfig.rateLimiting,
      maxRequests: 50 // Stricter in production
    }
  },

  testing: {
    ...defaultSecurityConfig,
    csrf: {
      ...defaultSecurityConfig.csrf,
      enabled: false // Disable for easier testing
    },
    rateLimiting: {
      ...defaultSecurityConfig.rateLimiting,
      enabled: false
    },
    audit: {
      ...defaultSecurityConfig.audit,
      enabled: false
    }
  }
}

/**
 * Get security configuration for current environment
 */
export const getSecurityConfig = (): SecurityConfig => {
  const env = process.env.NODE_ENV || 'development'
  
  switch (env) {
    case 'production':
      return securityConfigs.production
    case 'test':
      return securityConfigs.testing
    default:
      return securityConfigs.development
  }
}

/**
 * Security policy definitions
 */
export const securityPolicies = {
  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
    preventReuse: 5 // Last 5 passwords
  },

  // File upload restrictions
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain'
    ],
    scanForMalware: true,
    quarantineOnSuspicion: true
  },

  // API access policies
  api: {
    maxRequestSize: 1024 * 1024, // 1MB
    timeoutMs: 30000, // 30 seconds
    retryAttempts: 3,
    backoffMultiplier: 2
  },

  // DRM policies
  drmPolicies: {
    maxConcurrentSessions: 1,
    allowOfflineAccess: false,
    watermarkFrequency: 30000, // Every 30 seconds
    screenshotPrevention: true,
    printPrevention: true,
    copyPrevention: true
  }
}

export default getSecurityConfig()