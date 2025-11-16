import type { BookContent, BookViewer } from '@/types'
import apiService from './api'
import securityService, { SecurityEventType } from './security'

/**
 * DRM Error types for better error handling
 */
export enum DrmErrorType {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  DECRYPTION_FAILED = 'DECRYPTION_FAILED',
  CONTENT_PROTECTION_FAILED = 'CONTENT_PROTECTION_FAILED'
}

export class DrmError extends Error {
  constructor(
    public type: DrmErrorType,
    public message: string,
    public bookId?: number
  ) {
    super(message)
    this.name = 'DrmError'
  }
}

/**
 * DRM Service for secure book content handling and protection
 * Implements content protection measures to prevent unauthorized access and copying
 */
class DrmService {
  private activeViewers: Map<number, BookViewer> = new Map()
  private protectionEnabled = true
  private watermarkUserId: string | null = null

  constructor() {
    this.setupGlobalProtection()
  }

  /**
   * Set the current user ID for watermarking
   */
  setUserId(userId: string): void {
    this.watermarkUserId = userId
  }

  /**
   * Load and prepare protected book content
   */
  async loadProtectedBook(bookId: number): Promise<BookContent> {
    try {
      // Verify ownership first through API
      const ownership = await apiService.checkOwnership(bookId)
      if (!ownership.owns_book) {
        throw new DrmError(
          DrmErrorType.UNAUTHORIZED,
          'You do not own this book',
          bookId
        )
      }

      // Get book details
      const book = await apiService.getBook(bookId)
      
      // Get protected content
      const contentBlob = await apiService.getBookContent(bookId)
      
      // Determine content type
      const contentType = contentBlob.type || 'application/pdf'

      return {
        id: bookId,
        title: book.title,
        content: contentBlob,
        contentType
      }
    } catch (error) {
      if (error instanceof DrmError) {
        throw error
      }
      
      // Convert API errors to DRM errors
      if (error instanceof Error) {
        if (error.message.includes('404')) {
          throw new DrmError(
            DrmErrorType.FILE_NOT_FOUND,
            'Book content not found',
            bookId
          )
        }
        if (error.message.includes('401') || error.message.includes('403')) {
          throw new DrmError(
            DrmErrorType.UNAUTHORIZED,
            'Access denied to book content',
            bookId
          )
        }
      }
      
      throw new DrmError(
        DrmErrorType.NETWORK_ERROR,
        'Failed to load book content',
        bookId
      )
    }
  }

  /**
   * Create a secure viewer for book content with DRM protection
   */
  async createSecureViewer(content: BookContent): Promise<BookViewer> {
    try {
      // Create viewer container
      const viewerElement = document.createElement('div')
      viewerElement.className = 'drm-protected-viewer'
      viewerElement.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #000;
        z-index: 9999;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
      `

      // Create content container
      const contentContainer = document.createElement('div')
      contentContainer.className = 'drm-content-container'
      contentContainer.style.cssText = `
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
      `

      // Handle different content types
      let contentElement: HTMLElement

      if (content.contentType === 'application/pdf') {
        contentElement = await this.createPdfViewer(content.content)
      } else {
        // For other formats, create a generic viewer
        contentElement = await this.createGenericViewer(content.content)
      }

      contentContainer.appendChild(contentElement)
      viewerElement.appendChild(contentContainer)

      // Apply DRM protection measures
      this.applyContentProtection(viewerElement)
      
      // Add watermark
      if (this.watermarkUserId) {
        this.addWatermark(viewerElement, this.watermarkUserId)
      }

      // Create viewer object
      const viewer: BookViewer = {
        element: viewerElement,
        destroy: () => {
          this.removeProtection(viewerElement)
          if (viewerElement.parentNode) {
            viewerElement.parentNode.removeChild(viewerElement)
          }
          this.activeViewers.delete(content.id)
        }
      }

      // Store active viewer
      this.activeViewers.set(content.id, viewer)

      return viewer
    } catch (error) {
      throw new DrmError(
        DrmErrorType.CONTENT_PROTECTION_FAILED,
        'Failed to create secure viewer',
        content.id
      )
    }
  }

  /**
   * Create PDF viewer using object/embed element
   */
  private async createPdfViewer(contentBlob: Blob): Promise<HTMLElement> {
    const container = document.createElement('div')
    container.style.cssText = `
      width: 90%;
      height: 90%;
      border: 1px solid #ccc;
      background: white;
    `

    // Create object URL for PDF
    const pdfUrl = URL.createObjectURL(contentBlob)
    
    // Create PDF embed element
    const pdfEmbed = document.createElement('object')
    pdfEmbed.data = pdfUrl
    pdfEmbed.type = 'application/pdf'
    pdfEmbed.style.cssText = `
      width: 100%;
      height: 100%;
    `

    // Fallback for browsers that don't support PDF embedding
    const fallback = document.createElement('div')
    fallback.innerHTML = `
      <p>Your browser doesn't support PDF viewing. Please download a PDF viewer.</p>
      <p>Book content is protected and cannot be downloaded.</p>
    `
    pdfEmbed.appendChild(fallback)

    container.appendChild(pdfEmbed)

    // Clean up URL when container is removed
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node === container) {
              URL.revokeObjectURL(pdfUrl)
              observer.disconnect()
            }
          })
        }
      })
    })

    if (container.parentNode) {
      observer.observe(container.parentNode, { childList: true })
    }

    return container
  }

  /**
   * Create generic viewer for other content types
   */
  private async createGenericViewer(contentBlob: Blob): Promise<HTMLElement> {
    const container = document.createElement('div')
    container.style.cssText = `
      width: 90%;
      height: 90%;
      border: 1px solid #ccc;
      background: white;
      padding: 20px;
      overflow-y: auto;
    `

    try {
      const text = await contentBlob.text()
      const pre = document.createElement('pre')
      pre.style.cssText = `
        white-space: pre-wrap;
        font-family: 'Georgia', serif;
        font-size: 16px;
        line-height: 1.6;
        color: #333;
      `
      pre.textContent = text
      container.appendChild(pre)
    } catch (error) {
      container.innerHTML = `
        <div style="text-align: center; padding: 50px;">
          <h3>Content Protected</h3>
          <p>This book format is protected and cannot be displayed in text format.</p>
        </div>
      `
    }

    return container
  }

  /**
   * Apply comprehensive DRM protection measures
   */
  private applyContentProtection(element: HTMLElement): void {
    if (!this.protectionEnabled) return

    // Disable right-click context menu
    this.preventRightClick(element)
    
    // Prevent text selection
    this.preventTextSelection(element)
    
    // Disable copy/paste
    this.preventCopyPaste(element)
    
    // Block developer tools (limited effectiveness)
    this.preventDevTools()
    
    // Prevent drag and drop
    this.preventDragDrop(element)
    
    // Disable print screen (limited effectiveness)
    this.preventPrintScreen(element)
  }

  /**
   * Disable right-click context menu
   */
  private preventRightClick(element: HTMLElement): void {
    const handler = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    element.addEventListener('contextmenu', handler)
    element.addEventListener('selectstart', handler)
    element.addEventListener('dragstart', handler)
  }

  /**
   * Prevent text selection
   */
  private preventTextSelection(element: HTMLElement): void {
    element.style.userSelect = 'none'
    element.style.webkitUserSelect = 'none'
    // @ts-ignore - Legacy browser support
    element.style.mozUserSelect = 'none'
    // @ts-ignore - Legacy browser support  
    element.style.msUserSelect = 'none'

    // Additional selection prevention
    element.addEventListener('selectstart', (e) => {
      e.preventDefault()
      return false
    })

    element.addEventListener('mousedown', (e) => {
      if (e.detail > 1) { // Prevent multiple clicks
        e.preventDefault()
      }
    })
  }

  /**
   * Prevent copy/paste operations
   */
  private preventCopyPaste(element: HTMLElement): void {
    const preventHandler = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+A, Ctrl+S, Ctrl+P
      if (e.ctrlKey && ['c', 'v', 'a', 's', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      
      // Prevent F12, Ctrl+Shift+I, Ctrl+U
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'U')) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }

    element.addEventListener('keydown', preventHandler)
    document.addEventListener('keydown', preventHandler)
  }

  /**
   * Prevent drag and drop
   */
  private preventDragDrop(element: HTMLElement): void {
    const preventHandler = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()
      return false
    }

    element.addEventListener('dragstart', preventHandler)
    element.addEventListener('drop', preventHandler)
    element.addEventListener('dragover', preventHandler)
  }

  /**
   * Attempt to prevent developer tools (limited effectiveness)
   */
  private preventDevTools(): void {
    // Detect developer tools opening (not foolproof)
    let devtools = { open: false }
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > 200 || 
          window.outerWidth - window.innerWidth > 200) {
        if (!devtools.open) {
          devtools.open = true
          console.clear()
          console.warn('Developer tools detected. Content is protected.')
        }
      } else {
        devtools.open = false
      }
    }, 500)

    // Clear console periodically
    setInterval(() => {
      console.clear()
    }, 1000)
  }

  /**
   * Prevent print screen (limited effectiveness)
   */
  private preventPrintScreen(element: HTMLElement): void {
    element.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard?.writeText('Content is protected and cannot be copied.')
      }
    })
  }

  /**
   * Add user watermark to content
   */
  private addWatermark(element: HTMLElement, userId: string): void {
    const watermark = document.createElement('div')
    watermark.className = 'drm-watermark'
    
    // Create subtle watermark
    const watermarkText = `User: ${userId.substring(0, 8)}... | ${new Date().toISOString()}`
    
    watermark.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      color: rgba(0, 0, 0, 0.1);
      font-size: 12px;
      font-family: monospace;
      pointer-events: none;
      z-index: 10000;
      transform: rotate(-45deg);
      transform-origin: center;
    `
    
    watermark.textContent = watermarkText
    element.appendChild(watermark)

    // Add multiple watermarks across the content
    for (let i = 0; i < 5; i++) {
      const additionalWatermark = watermark.cloneNode(true) as HTMLElement
      additionalWatermark.style.top = `${20 + i * 150}px`
      additionalWatermark.style.left = `${20 + i * 200}px`
      additionalWatermark.style.right = 'auto'
      element.appendChild(additionalWatermark)
    }
  }

  /**
   * Setup global protection measures
   */
  private setupGlobalProtection(): void {
    // Prevent page from being embedded in iframe
    if (window.top !== window.self) {
      window.top!.location.href = window.self.location.href
    }

    // Add security headers via meta tags (limited effectiveness)
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = "frame-ancestors 'none'"
    document.head.appendChild(meta)
  }

  /**
   * Remove protection measures when viewer is destroyed
   */
  private removeProtection(element: HTMLElement): void {
    // Remove event listeners by cloning the element
    const newElement = element.cloneNode(true)
    if (element.parentNode) {
      element.parentNode.replaceChild(newElement, element)
    }
  }

  /**
   * Log access attempt for audit purposes with enhanced security logging
   */
  logAccess(bookId: number, userId: string, action: string): void {
    // Use the security service for comprehensive logging
    securityService.logSecurityEvent(SecurityEventType.DRM_ACCESS, {
      bookId,
      userId,
      action,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      sessionId: securityService.getSessionId()
    }, 'low')

    // Legacy logging for backward compatibility
    const logEntry = {
      timestamp: new Date().toISOString(),
      bookId,
      userId,
      action,
      userAgent: navigator.userAgent,
      ip: 'client-side'
    }

    console.log('DRM Access Log:', logEntry)
    
    const logs = JSON.parse(sessionStorage.getItem('drm-logs') || '[]')
    logs.push(logEntry)
    sessionStorage.setItem('drm-logs', JSON.stringify(logs.slice(-100)))
  }

  /**
   * Log DRM violation attempt
   */
  logDrmViolation(bookId: number, userId: string, violationType: string, details: Record<string, unknown>): void {
    securityService.logSecurityEvent(SecurityEventType.DRM_VIOLATION, {
      bookId,
      userId,
      violationType,
      details,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    }, 'high')

    // For critical violations, take immediate action
    if (['content_extraction', 'protection_bypass', 'unauthorized_access'].includes(violationType)) {
      this.handleCriticalViolation(bookId, userId, violationType)
    }
  }

  /**
   * Handle critical DRM violations
   */
  private handleCriticalViolation(bookId: number, userId: string, violationType: string): void {
    // Close all active viewers
    this.destroyAllViewers()
    
    // Log critical security event
    securityService.logSecurityEvent(SecurityEventType.DRM_VIOLATION, {
      bookId,
      userId,
      violationType,
      action: 'critical_violation_response',
      response: 'all_viewers_closed'
    }, 'critical')
    
    // In a real implementation, this might also:
    // - Temporarily suspend user access
    // - Alert security team
    // - Require re-authentication
  }

  /**
   * Destroy all active viewers
   */
  destroyAllViewers(): void {
    this.activeViewers.forEach(viewer => viewer.destroy())
    this.activeViewers.clear()
  }

  /**
   * Check if a book is currently being viewed
   */
  isBookActive(bookId: number): boolean {
    return this.activeViewers.has(bookId)
  }

  /**
   * Enable or disable protection (for testing purposes)
   */
  setProtectionEnabled(enabled: boolean): void {
    this.protectionEnabled = enabled
  }
}

// Create and export singleton instance
const drmService = new DrmService()
export default drmService
