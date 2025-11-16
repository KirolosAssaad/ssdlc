/**
 * TokenManager - Secure JWT token handling service
 * Provides secure storage and management of authentication tokens with enhanced security
 */

import securityService, { SecurityEventType } from './security'

export class TokenManager {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpirationTime: number | null = null
  private tokenRotationInterval: number | null = null
  private secureStorageKey = 'kahf_secure_tokens'
  private encryptionKey: CryptoKey | null = null

  /**
   * Initialize secure storage
   */
  async initializeSecureStorage(): Promise<void> {
    try {
      // Generate or retrieve encryption key
      this.encryptionKey = await this.getOrCreateEncryptionKey()
      
      // Try to restore tokens from secure storage
      await this.restoreTokensFromSecureStorage()
    } catch (error) {
      console.warn('Failed to initialize secure storage:', error)
      securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'secure_storage_init_failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium')
    }
  }

  /**
   * Set authentication tokens with enhanced security
   */
  async setTokens(accessToken: string, refreshToken?: string): Promise<void> {
    this.accessToken = accessToken
    if (refreshToken) {
      this.refreshToken = refreshToken
    }

    // Parse token expiration time
    try {
      const payload = this.parseJwtPayload(accessToken)
      this.tokenExpirationTime = payload.exp ? payload.exp * 1000 : null
    } catch (error) {
      console.warn('Failed to parse token expiration:', error)
      this.tokenExpirationTime = null
      securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'token_parse_failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium')
    }

    // Store tokens securely
    await this.storeTokensSecurely()
    
    // Setup automatic token rotation
    this.setupTokenRotation()
    
    // Log successful token storage
    securityService.logSecurityEvent(SecurityEventType.LOGIN_SUCCESS, {
      action: 'tokens_stored',
      hasRefreshToken: !!refreshToken,
      expirationTime: this.tokenExpirationTime
    }, 'low')
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken
  }

  /**
   * Clear all stored tokens with enhanced security
   */
  async clearTokens(): Promise<void> {
    // Clear memory tokens
    this.accessToken = null
    this.refreshToken = null
    this.tokenExpirationTime = null
    
    // Clear token rotation interval
    if (this.tokenRotationInterval) {
      clearInterval(this.tokenRotationInterval)
      this.tokenRotationInterval = null
    }
    
    // Clear secure storage
    await this.clearSecureStorage()
    
    // Clear any fallback storage
    sessionStorage.removeItem(this.secureStorageKey)
    localStorage.removeItem(this.secureStorageKey)
    
    // Log token clearance
    securityService.logSecurityEvent(SecurityEventType.LOGOUT, {
      action: 'tokens_cleared'
    }, 'low')
  }

  /**
   * Check if the current access token is expired
   */
  isTokenExpired(): boolean {
    if (!this.accessToken || !this.tokenExpirationTime) {
      return true
    }

    // Add 5 minute buffer before expiration
    const bufferTime = 5 * 60 * 1000 // 5 minutes in milliseconds
    return Date.now() >= this.tokenExpirationTime - bufferTime
  }

  /**
   * Check if tokens are available
   */
  hasTokens(): boolean {
    return !!this.accessToken
  }

  /**
   * Parse JWT payload without verification (for client-side use only)
   */
  private parseJwtPayload(token: string): { exp?: number } {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch {
      throw new Error('Invalid JWT token format')
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpirationTime(): number | null {
    return this.tokenExpirationTime
  }

  /**
   * Get time until token expires (in milliseconds)
   */
  getTimeUntilExpiration(): number | null {
    if (!this.tokenExpirationTime) {
      return null
    }
    return Math.max(0, this.tokenExpirationTime - Date.now())
  }

  // =============================================================================
  // SECURE STORAGE METHODS
  // =============================================================================

  /**
   * Generate or retrieve encryption key for secure storage
   */
  private async getOrCreateEncryptionKey(): Promise<CryptoKey> {
    try {
      // Try to import existing key from sessionStorage
      const storedKey = sessionStorage.getItem('kahf_encryption_key')
      if (storedKey) {
        const keyData = JSON.parse(storedKey)
        return await crypto.subtle.importKey(
          'raw',
          new Uint8Array(keyData),
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        )
      }
    } catch (error) {
      console.warn('Failed to restore encryption key:', error)
    }

    // Generate new key
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    )

    // Store key for session persistence
    try {
      const exportedKey = await crypto.subtle.exportKey('raw', key)
      sessionStorage.setItem('kahf_encryption_key', JSON.stringify(Array.from(new Uint8Array(exportedKey))))
    } catch (error) {
      console.warn('Failed to store encryption key:', error)
    }

    return key
  }

  /**
   * Encrypt data using Web Crypto API
   */
  private async encryptData(data: string): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized')
    }

    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const iv = crypto.getRandomValues(new Uint8Array(12))

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.encryptionKey,
      dataBuffer
    )

    return { encrypted, iv }
  }

  /**
   * Decrypt data using Web Crypto API
   */
  private async decryptData(encrypted: ArrayBuffer, iv: Uint8Array): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Encryption key not initialized')
    }

    // Ensure iv is a proper Uint8Array with ArrayBuffer
    const ivBuffer = new Uint8Array(iv)

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBuffer },
      this.encryptionKey,
      encrypted
    )

    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  }

  /**
   * Store tokens securely using encryption
   */
  private async storeTokensSecurely(): Promise<void> {
    if (!this.accessToken) return

    try {
      const tokenData = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expirationTime: this.tokenExpirationTime,
        timestamp: Date.now()
      }

      const { encrypted, iv } = await this.encryptData(JSON.stringify(tokenData))
      
      const secureData = {
        encrypted: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv)
      }

      // Store in sessionStorage as primary storage
      sessionStorage.setItem(this.secureStorageKey, JSON.stringify(secureData))
      
    } catch (error) {
      console.warn('Failed to store tokens securely:', error)
      securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'secure_token_storage_failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium')
      
      // Fallback to memory-only storage (already set)
    }
  }

  /**
   * Restore tokens from secure storage
   */
  private async restoreTokensFromSecureStorage(): Promise<void> {
    try {
      const storedData = sessionStorage.getItem(this.secureStorageKey)
      if (!storedData) return

      const { encrypted, iv } = JSON.parse(storedData)
      const encryptedBuffer = new Uint8Array(encrypted).buffer
      const ivArray = new Uint8Array(iv)

      const decryptedData = await this.decryptData(encryptedBuffer, ivArray)
      const tokenData = JSON.parse(decryptedData)

      // Validate token data
      if (tokenData.accessToken && tokenData.timestamp) {
        // Check if tokens are not too old (max 24 hours)
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        if (Date.now() - tokenData.timestamp < maxAge) {
          this.accessToken = tokenData.accessToken
          this.refreshToken = tokenData.refreshToken
          this.tokenExpirationTime = tokenData.expirationTime
          
          securityService.logSecurityEvent(SecurityEventType.LOGIN_SUCCESS, {
            action: 'tokens_restored_from_storage'
          }, 'low')
        } else {
          // Tokens too old, clear storage
          await this.clearSecureStorage()
        }
      }
    } catch (error) {
      console.warn('Failed to restore tokens from secure storage:', error)
      await this.clearSecureStorage()
    }
  }

  /**
   * Clear secure storage
   */
  private async clearSecureStorage(): Promise<void> {
    try {
      sessionStorage.removeItem(this.secureStorageKey)
      sessionStorage.removeItem('kahf_encryption_key')
    } catch (error) {
      console.warn('Failed to clear secure storage:', error)
    }
  }

  /**
   * Setup automatic token rotation
   */
  private setupTokenRotation(): void {
    // Clear existing interval
    if (this.tokenRotationInterval) {
      clearInterval(this.tokenRotationInterval)
    }

    // Check token expiration every minute
    this.tokenRotationInterval = window.setInterval(() => {
      if (this.isTokenExpired()) {
        securityService.logSecurityEvent(SecurityEventType.TOKEN_REFRESH, {
          action: 'token_expired_auto_refresh_needed'
        }, 'medium')
        
        // In a real implementation, this would trigger token refresh
        // For now, we'll just log the event
      }
    }, 60000) // Check every minute
  }

  /**
   * Validate token integrity
   */
  validateTokenIntegrity(token: string): boolean {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return false
      }

      // Validate each part is valid base64
      parts.forEach(part => {
        atob(part.replace(/-/g, '+').replace(/_/g, '/'))
      })

      return true
    } catch {
      securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'invalid_token_format',
        tokenPrefix: token.substring(0, 10)
      }, 'high')
      return false
    }
  }

  /**
   * Get token with validation
   */
  getValidatedAccessToken(): string | null {
    if (!this.accessToken) {
      return null
    }

    if (!this.validateTokenIntegrity(this.accessToken)) {
      this.clearTokens()
      return null
    }

    if (this.isTokenExpired()) {
      securityService.logSecurityEvent(SecurityEventType.TOKEN_REFRESH, {
        action: 'token_expired'
      }, 'medium')
      return null
    }

    return this.accessToken
  }
}

// Create singleton instance
export const tokenManager = new TokenManager()
