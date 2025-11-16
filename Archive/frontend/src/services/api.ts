import type {
  Book,
  OwnershipResponse,
  PurchaseResponse,
  Purchase,
  UserRole,
  ApiError,
} from '@/types'
import config from '@/config'
import { tokenManager } from './tokenManager'
import securityService, { SecurityEventType } from './security'
// Error handling utilities are available but not used in this file currently

/**
 * Custom API Error class for better error handling
 */
export class ApiServiceError extends Error implements ApiError {
  constructor(
    public status: number,
    public message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiServiceError'
  }
}

/**
 * Retry configuration interface
 */
interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  retryableStatuses: number[]
}

/**
 * Request configuration interface
 */
interface RequestConfig extends globalThis.RequestInit {
  skipAuth?: boolean
  retries?: Partial<RetryConfig>
}

/**
 * Core API Service class with comprehensive HTTP client functionality
 * Handles authentication, error handling, retries, and all API operations
 */
class ApiService {
  private baseURL: string
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    retryableStatuses: [408, 429, 500, 502, 503, 504],
  }

  constructor() {
    this.baseURL = config.API_BASE_URL
  }

  /**
   * Make authenticated HTTP request with enhanced security and retry logic
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestConfig = {}
  ): Promise<T> {
    const { skipAuth = false, retries = {}, ...requestOptions } = options
    const retryConfig = { ...this.defaultRetryConfig, ...retries }

    const url = `${this.baseURL}${endpoint}`

    // Prepare headers with security enhancements
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest', // CSRF protection
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      ...(requestOptions.headers as Record<string, string>),
    }

    // Add CSRF token for state-changing operations
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(requestOptions.method?.toUpperCase() || 'GET')) {
      const csrfToken = securityService.getCSRFToken()
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken
      }
    }

    // Add authentication header if not skipped
    if (!skipAuth) {
      const token = tokenManager.getValidatedAccessToken()
      if (token) {
        headers.Authorization = `Bearer ${token}`
      } else {
        securityService.logSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, {
          endpoint,
          method: requestOptions.method || 'GET',
          reason: 'no_valid_token'
        }, 'medium')
        throw new ApiServiceError(401, 'No valid authentication token available')
      }
    }

    // Validate request data for potential security issues
    if (requestOptions.body && typeof requestOptions.body === 'string') {
      this.validateRequestBody(requestOptions.body, endpoint)
    }

    const requestConfig: globalThis.RequestInit = {
      ...requestOptions,
      headers,
      credentials: 'same-origin', // CSRF protection
    }

    // Log API request for security monitoring
    securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
      action: 'api_request',
      endpoint,
      method: requestOptions.method || 'GET',
      hasAuth: !skipAuth
    }, 'low')

    // Execute request with retry logic
    return this.executeWithRetry(url, requestConfig, retryConfig)
  }

  /**
   * Validate request body for security issues
   */
  private validateRequestBody(body: string, endpoint: string): void {
    try {
      const data = JSON.parse(body)
      
      // Check for potential XSS in string values
      const checkForXSS = (obj: any, path = ''): void => {
        if (typeof obj === 'string') {
          const validation = securityService.validateInput(obj, { sanitize: true })
          if (!validation.isValid) {
            securityService.logSecurityEvent(SecurityEventType.XSS_ATTEMPT, {
              endpoint,
              field: path,
              value: obj.substring(0, 100),
              errors: validation.errors
            }, 'high')
          }
        } else if (typeof obj === 'object' && obj !== null) {
          Object.keys(obj).forEach(key => {
            checkForXSS(obj[key], path ? `${path}.${key}` : key)
          })
        }
      }
      
      checkForXSS(data)
    } catch (error) {
      // If body is not JSON, skip validation
    }
  }

  /**
   * Execute request with exponential backoff retry logic
   */
  private async executeWithRetry<T>(
    url: string,
    config: globalThis.RequestInit,
    retryConfig: RetryConfig
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
      try {
        const response = await fetch(url, config)
        return await this.handleResponse<T>(response)
      } catch (error) {
        lastError = error as Error

        // Don't retry on the last attempt
        if (attempt === retryConfig.maxRetries) {
          break
        }

        // Check if error is retryable
        if (error instanceof ApiServiceError) {
          if (!retryConfig.retryableStatuses.includes(error.status)) {
            throw error
          }
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          retryConfig.baseDelay * Math.pow(2, attempt),
          retryConfig.maxDelay
        )

        // Add jitter to prevent thundering herd
        const jitteredDelay = delay + Math.random() * 1000

        console.warn(
          `Request failed (attempt ${attempt + 1}), retrying in ${jitteredDelay}ms:`,
          error
        )
        await this.sleep(jitteredDelay)
      }
    }

    throw (
      lastError || new ApiServiceError(500, 'Request failed after all retries')
    )
  }

  /**
   * Handle HTTP response and parse JSON with security validation
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Log response for security monitoring
    securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
      action: 'api_response',
      status: response.status,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    }, 'low')

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      let errorDetails: unknown = null

      try {
        const errorBody = await response.json()
        errorMessage = errorBody.message || errorBody.detail || errorMessage
        errorDetails = errorBody
      } catch {
        // If we can't parse the error body, use the status text
      }

      // Log security-relevant errors
      if (response.status === 401) {
        securityService.logSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, {
          url: response.url,
          status: response.status,
          message: errorMessage
        }, 'medium')
      } else if (response.status === 403) {
        securityService.logSecurityEvent(SecurityEventType.UNAUTHORIZED_ACCESS, {
          url: response.url,
          status: response.status,
          message: errorMessage
        }, 'high')
      } else if (response.status >= 500) {
        securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'server_error',
          url: response.url,
          status: response.status,
          message: errorMessage
        }, 'medium')
      }

      throw new ApiServiceError(response.status, errorMessage, errorDetails)
    }

    try {
      const data = await response.json()
      
      // Validate response data for potential security issues
      this.validateResponseData(data, response.url)
      
      return data
    } catch (error) {
      securityService.logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'response_parse_error',
        url: response.url,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium')
      throw new ApiServiceError(500, 'Failed to parse response JSON', error)
    }
  }

  /**
   * Validate response data for security issues
   */
  private validateResponseData(data: any, url: string): void {
    // Check for potential XSS in response data
    const checkResponseSecurity = (obj: any, path = ''): void => {
      if (typeof obj === 'string') {
        // Check for potential script injection in response
        if (/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(obj)) {
          securityService.logSecurityEvent(SecurityEventType.XSS_ATTEMPT, {
            source: 'api_response',
            url,
            field: path,
            value: obj.substring(0, 100)
          }, 'critical')
        }
      } else if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
        Object.keys(obj).forEach(key => {
          checkResponseSecurity(obj[key], path ? `${path}.${key}` : key)
        })
      } else if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          checkResponseSecurity(item, `${path}[${index}]`)
        })
      }
    }
    
    checkResponseSecurity(data)
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // =============================================================================
  // BOOK OPERATIONS
  // =============================================================================

  /**
   * Get all available books
   */
  async getBooks(): Promise<Book[]> {
    return this.makeRequest<Book[]>('/books')
  }

  /**
   * Get a specific book by ID
   */
  async getBook(id: number): Promise<Book> {
    return this.makeRequest<Book>(`/books/${id}`)
  }

  /**
   * Search books by query (title, author, or genre)
   */
  async searchBooks(query: string): Promise<Book[]> {
    const encodedQuery = encodeURIComponent(query)
    return this.makeRequest<Book[]>(`/books/search?q=${encodedQuery}`)
  }

  /**
   * Filter books by author
   */
  async filterBooksByAuthor(author: string): Promise<Book[]> {
    const encodedAuthor = encodeURIComponent(author)
    return this.makeRequest<Book[]>(`/books?author=${encodedAuthor}`)
  }

  /**
   * Filter books by genre
   */
  async filterBooksByGenre(genre: string): Promise<Book[]> {
    const encodedGenre = encodeURIComponent(genre)
    return this.makeRequest<Book[]>(`/books?genre=${encodedGenre}`)
  }

  /**
   * Filter books with multiple criteria
   */
  async filterBooks(filters: {
    author?: string
    genre?: string
    searchQuery?: string
  }): Promise<Book[]> {
    const params = new URLSearchParams()

    if (filters.author) {
      params.append('author', filters.author)
    }
    if (filters.genre) {
      params.append('genre', filters.genre)
    }
    if (filters.searchQuery) {
      params.append('q', filters.searchQuery)
    }

    const queryString = params.toString()
    const endpoint = queryString ? `/books?${queryString}` : '/books'

    return this.makeRequest<Book[]>(endpoint)
  }

  // =============================================================================
  // USER OPERATIONS
  // =============================================================================

  /**
   * Get books owned by the current user
   */
  async getMyBooks(): Promise<Book[]> {
    return this.makeRequest<Book[]>('/user/books')
  }

  /**
   * Get purchase history for the current user
   */
  async getMyPurchases(): Promise<Purchase[]> {
    return this.makeRequest<Purchase[]>('/user/purchases')
  }

  /**
   * Purchase a book
   */
  async purchaseBook(bookId: number): Promise<PurchaseResponse> {
    return this.makeRequest<PurchaseResponse>('/user/purchase', {
      method: 'POST',
      body: JSON.stringify({ book_id: bookId }),
    })
  }

  /**
   * Check if user owns a specific book
   */
  async checkOwnership(bookId: number): Promise<OwnershipResponse> {
    return this.makeRequest<OwnershipResponse>(`/user/ownership/${bookId}`)
  }

  // =============================================================================
  // DRM OPERATIONS
  // =============================================================================

  /**
   * Get protected book content (returns blob for DRM service)
   */
  async getBookContent(bookId: number): Promise<Blob> {
    const response = await fetch(
      `${this.baseURL}/user/books/${bookId}/content`,
      {
        headers: {
          Authorization: `Bearer ${tokenManager.getAccessToken()}`,
        },
      }
    )

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      try {
        const errorBody = await response.json()
        errorMessage = errorBody.message || errorBody.detail || errorMessage
      } catch {
        // Use status text if JSON parsing fails
      }
      throw new ApiServiceError(response.status, errorMessage)
    }

    return response.blob()
  }

  // =============================================================================
  // ADMIN OPERATIONS
  // =============================================================================

  /**
   * Get user roles (admin only)
   */
  async getUserRoles(userId: string): Promise<UserRole[]> {
    return this.makeRequest<UserRole[]>(`/admin/users/${userId}/roles`)
  }

  /**
   * Set user role (sudo_admin only)
   */
  async setUserRole(userId: string, role: string): Promise<void> {
    await this.makeRequest<void>('/admin/users/role', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        role: role,
      }),
    })
  }

  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<
    Array<{ id: string; email: string; roles: UserRole[] }>
  > {
    return this.makeRequest<
      Array<{ id: string; email: string; roles: UserRole[] }>
    >('/admin/users')
  }

  /**
   * Get system health status (admin only)
   */
  async getSystemHealth(): Promise<{
    status: string
    database: boolean
    api_version: string
    uptime: number
  }> {
    return this.makeRequest<{
      status: string
      database: boolean
      api_version: string
      uptime: number
    }>('/admin/health')
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Test API connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest<{ status: string }>('/health', { skipAuth: true })
      return true
    } catch {
      return false
    }
  }

  /**
   * Get API base URL
   */
  getBaseURL(): string {
    return this.baseURL
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return tokenManager.hasTokens() && !tokenManager.isTokenExpired()
  }
}

// Create and export singleton instance
const apiService = new ApiService()
export default apiService

// Export the class for testing purposes
export { ApiService }
