import React, { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import apiService from '@/services/api'
import type { Book } from '@/types'

interface PurchaseConfirmationDialogProps {
  isOpen: boolean
  bookId: number
  isProcessing: boolean
  error: string | null
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Purchase confirmation dialog with book details and error handling
 */
const PurchaseConfirmationDialog: React.FC<PurchaseConfirmationDialogProps> = ({
  isOpen,
  bookId,
  isProcessing,
  error,
  onConfirm,
  onCancel,
}) => {
  // Query for book details to show in confirmation
  const { data: book, isLoading: bookLoading } = useQuery<Book>({
    queryKey: ['book', bookId],
    queryFn: () => apiService.getBook(bookId),
    enabled: isOpen && !!bookId,
  })

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isProcessing) {
        onCancel()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, isProcessing, onCancel])

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isProcessing) {
      onCancel()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4'
      onClick={handleBackdropClick}
    >
      <div className='max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 p-6'>
          <h2 className='text-xl font-semibold text-kahf-primary'>
            Confirm Purchase
          </h2>
          {!isProcessing && (
            <button
              onClick={onCancel}
              className='text-gray-400 transition-colors hover:text-gray-600'
            >
              <svg
                className='h-6 w-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className='p-6'>
          {bookLoading ? (
            <div className='animate-pulse'>
              <div className='flex space-x-4'>
                <div className='h-20 w-16 rounded bg-gray-300'></div>
                <div className='flex-1 space-y-2'>
                  <div className='h-4 w-3/4 rounded bg-gray-300'></div>
                  <div className='h-3 w-1/2 rounded bg-gray-300'></div>
                  <div className='h-3 w-1/4 rounded bg-gray-300'></div>
                </div>
              </div>
            </div>
          ) : book ? (
            <div className='space-y-4'>
              {/* Book Info */}
              <div className='flex space-x-4'>
                <div className='flex h-20 w-16 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-kahf-secondary to-kahf-primary text-xs font-bold text-white'>
                  📚
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='truncate font-semibold text-kahf-primary'>
                    {book.title}
                  </h3>
                  <p className='text-sm text-kahf-secondary'>
                    by {book.author}
                  </p>
                  <p className='text-xs text-gray-600'>{book.genre}</p>
                </div>
              </div>

              {/* Purchase Details */}
              <div className='bg-kahf-light rounded-lg p-4'>
                <h4 className='mb-2 font-medium text-kahf-primary'>
                  Purchase Details
                </h4>
                <div className='space-y-1 text-sm'>
                  <div className='flex justify-between'>
                    <span>Book Price:</span>
                    <span className='font-medium'>$9.99</span>
                  </div>
                  <div className='flex justify-between'>
                    <span>Tax:</span>
                    <span className='font-medium'>$0.00</span>
                  </div>
                  <div className='mt-2 border-t border-kahf-secondary pt-1'>
                    <div className='flex justify-between font-semibold'>
                      <span>Total:</span>
                      <span>$9.99</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className='rounded bg-gray-50 p-3 text-xs text-gray-600'>
                <p className='mb-1'>
                  <strong>Digital Rights:</strong> This purchase grants you a
                  personal, non-transferable license to read this book.
                </p>
                <p>
                  <strong>Refund Policy:</strong> Digital purchases are final
                  and non-refundable.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className='rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700'>
                  <div className='flex items-center'>
                    <svg
                      className='mr-2 h-5 w-5 flex-shrink-0'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='text-sm'>{error}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='text-center text-gray-500'>
              <p>Unable to load book details</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex flex-col gap-3 border-t border-gray-200 p-6 sm:flex-row'>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className={`flex-1 rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 transition-colors ${
              isProcessing
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-gray-50'
            } `}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing || bookLoading || !book}
            className={`flex flex-1 items-center justify-center rounded-md bg-kahf-secondary px-4 py-2 font-medium text-white transition-colors ${
              isProcessing || bookLoading || !book
                ? 'cursor-not-allowed opacity-50'
                : 'hover:bg-kahf-primary'
            } `}
          >
            {isProcessing ? (
              <>
                <svg
                  className='-ml-1 mr-2 h-4 w-4 animate-spin text-white'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Processing...
              </>
            ) : (
              'Confirm Purchase'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PurchaseConfirmationDialog
