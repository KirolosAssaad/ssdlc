import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookReader as BookReaderComponent } from '@/components/books'

/**
 * BookReader page component
 * Provides a full-page book reading experience with DRM protection
 */
const BookReaderPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()

  // Handle invalid book ID
  if (!bookId || isNaN(Number(bookId))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Invalid Book</h2>
          <p className="text-gray-600 mb-6">
            The book you're trying to access could not be found.
          </p>
          <button
            onClick={() => navigate('/library')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Library
          </button>
        </div>
      </div>
    )
  }

  const handleClose = () => {
    // Navigate back to library or previous page
    navigate(-1)
  }

  return (
    <BookReaderComponent
      bookId={Number(bookId)}
      onClose={handleClose}
    />
  )
}

export default BookReaderPage