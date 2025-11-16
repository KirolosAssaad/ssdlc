import React, { useState, useEffect, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, RotateCcw, AlertCircle, Loader2 } from 'lucide-react'
import drmService, { DrmError, DrmErrorType } from '@/services/drm'
import { useAuth0 } from '@auth0/auth0-react'
import type { BookContent, BookViewer } from '@/types'

interface BookReaderProps {
  bookId: number
  bookTitle?: string
  onClose: () => void
  className?: string
}

interface BookReaderState {
  loading: boolean
  error: string | null
  content: BookContent | null
  viewer: BookViewer | null
  zoom: number
  rotation: number
}

/**
 * BookReader component with DRM protection measures
 * Provides secure book reading with content protection features
 */
const BookReader: React.FC<BookReaderProps> = ({
  bookId,
  bookTitle,
  onClose,
  className = ''
}) => {
  const { user } = useAuth0()
  const [state, setState] = useState<BookReaderState>({
    loading: true,
    error: null,
    content: null,
    viewer: null,
    zoom: 100,
    rotation: 0
  })

  /**
   * Load and display protected book content
   */
  const loadBook = useCallback(async () => {
    if (!user?.sub) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'User not authenticated'
      }))
      return
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }))

      // Set user ID for watermarking
      drmService.setUserId(user.sub)

      // Log access attempt
      drmService.logAccess(bookId, user.sub, 'OPEN_BOOK')

      // Load protected content
      const content = await drmService.loadProtectedBook(bookId)
      
      // Create secure viewer
      const viewer = await drmService.createSecureViewer(content)

      setState(prev => ({
        ...prev,
        loading: false,
        content,
        viewer
      }))

      // Log successful access
      drmService.logAccess(bookId, user.sub, 'BOOK_LOADED')

    } catch (error) {
      console.error('Failed to load book:', error)
      
      let errorMessage = 'Failed to load book content'
      
      if (error instanceof DrmError) {
        switch (error.type) {
          case DrmErrorType.UNAUTHORIZED:
            errorMessage = 'You do not have permission to read this book'
            break
          case DrmErrorType.FILE_NOT_FOUND:
            errorMessage = 'Book content not found'
            break
          case DrmErrorType.NETWORK_ERROR:
            errorMessage = 'Network error. Please check your connection and try again'
            break
          case DrmErrorType.CONTENT_PROTECTION_FAILED:
            errorMessage = 'Failed to initialize secure reader'
            break
          default:
            errorMessage = error.message
        }
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }))

      // Log failed access
      if (user?.sub) {
        drmService.logAccess(bookId, user.sub, `LOAD_FAILED: ${errorMessage}`)
      }
    }
  }, [bookId, user?.sub])

  /**
   * Handle zoom in
   */
  const handleZoomIn = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 25, 200)
    }))
  }, [])

  /**
   * Handle zoom out
   */
  const handleZoomOut = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 25, 50)
    }))
  }, [])

  /**
   * Handle rotation
   */
  const handleRotate = useCallback(() => {
    setState(prev => ({
      ...prev,
      rotation: (prev.rotation + 90) % 360
    }))
  }, [])

  /**
   * Handle close with cleanup
   */
  const handleClose = useCallback(() => {
    if (state.viewer) {
      state.viewer.destroy()
    }
    
    if (user?.sub) {
      drmService.logAccess(bookId, user.sub, 'CLOSE_BOOK')
    }
    
    onClose()
  }, [state.viewer, onClose, bookId, user?.sub])

  /**
   * Handle retry loading
   */
  const handleRetry = useCallback(() => {
    loadBook()
  }, [loadBook])

  // Load book on mount
  useEffect(() => {
    loadBook()
  }, [loadBook])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (state.viewer) {
        state.viewer.destroy()
      }
    }
  }, [state.viewer])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleClose])

  // Render loading state
  if (state.loading) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <h3 className="text-lg font-semibold mb-2">Loading Book</h3>
          <p className="text-gray-600">
            Preparing secure reader for "{bookTitle || `Book ${bookId}`}"...
          </p>
        </div>
      </div>
    )
  }

  // Render error state
  if (state.error) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 ${className}`}>
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h3 className="text-lg font-semibold mb-2 text-red-800">Error Loading Book</h3>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render book reader interface
  return (
    <div className={`fixed inset-0 bg-black z-50 ${className}`}>
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 bg-gray-900 bg-opacity-90 text-white p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold truncate">
              {state.content?.title || bookTitle || `Book ${bookId}`}
            </h2>
            <div className="text-sm text-gray-300">
              Protected Content
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Zoom Controls */}
            <button
              onClick={handleZoomOut}
              disabled={state.zoom <= 50}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <span className="text-sm px-2 py-1 bg-gray-700 rounded">
              {state.zoom}%
            </span>
            
            <button
              onClick={handleZoomIn}
              disabled={state.zoom >= 200}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* Rotation Control */}
            <button
              onClick={handleRotate}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              title="Rotate"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              title="Close Reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div 
        className="pt-16 w-full h-full overflow-hidden"
        style={{
          transform: `scale(${state.zoom / 100}) rotate(${state.rotation}deg)`,
          transformOrigin: 'center center'
        }}
      >
        {/* The DRM viewer will be mounted here */}
        <div 
          id={`book-reader-${bookId}`}
          className="w-full h-full"
          ref={(element) => {
            if (element && state.viewer && !element.contains(state.viewer.element)) {
              element.appendChild(state.viewer.element)
            }
          }}
        />
      </div>

      {/* Footer Info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 bg-opacity-90 text-white p-2 text-center text-sm">
        <div className="text-gray-300">
          This content is protected by DRM. Unauthorized copying or distribution is prohibited.
        </div>
      </div>
    </div>
  )
}

export default BookReader