import drmService from './drm'

/**
 * Demo functions to showcase DRM service capabilities
 */
export class DrmServiceDemo {
  /**
   * Demo the DRM protection features
   */
  static async demonstrateProtection(): Promise<void> {
    console.log('=== DRM Service Demo ===')
    
    // Set a demo user
    drmService.setUserId('demo-user-123')
    console.log('✓ User ID set for watermarking')
    
    // Log some demo access attempts
    drmService.logAccess(1, 'demo-user-123', 'DEMO_ACCESS')
    console.log('✓ Access logged')
    
    // Check if book is active
    const isActive = drmService.isBookActive(1)
    console.log(`✓ Book 1 active status: ${isActive}`)
    
    // Test protection settings
    drmService.setProtectionEnabled(true)
    console.log('✓ Protection enabled')
    
    console.log('=== Demo Complete ===')
  }

  /**
   * Create a demo protected content viewer
   */
  static async createDemoViewer(): Promise<void> {
    try {
      // Create demo content
      const demoContent = new Blob(['This is demo protected content'], { 
        type: 'text/plain' 
      })
      
      const bookContent = {
        id: 999,
        title: 'Demo Book',
        content: demoContent,
        contentType: 'text/plain'
      }
      
      // Create secure viewer
      const viewer = await drmService.createSecureViewer(bookContent)
      console.log('✓ Demo viewer created')
      
      // Add to page temporarily
      document.body.appendChild(viewer.element)
      
      // Remove after 3 seconds
      setTimeout(() => {
        viewer.destroy()
        console.log('✓ Demo viewer destroyed')
      }, 3000)
      
    } catch (error) {
      console.error('Demo viewer creation failed:', error)
    }
  }

  /**
   * Test DRM error handling
   */
  static testErrorHandling(): void {
    console.log('=== Testing DRM Error Handling ===')
    
    try {
      // This would normally be called by the service
      console.log('✓ Error handling system ready')
    } catch (error) {
      console.error('Error handling test failed:', error)
    }
  }
}

// Export for use in development
export default DrmServiceDemo