import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth0 } from '@auth0/auth0-react'
import apiService from '@/services/api'
import { PurchaseButton } from '@/components/books'
import type { Book, OwnershipResponse } from '@/types'

/**
 * BookDetails page component that displays comprehensive book information
 * and handles purchase/read functionality
 */
const BookDetails: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth0()
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)

  // Parse bookId to number
  const numericBookId = bookId ? parseInt(bookId, 10) : null

  // Query for book details
  const {
    data: book,
    isLoading: bookLoading,
    error: bookError,
  } = useQuery<Book>({
    queryKey: ['book', numericBookId],
    queryFn: () => apiService.getBook(numericBookId!),
    enabled: !!numericBookId,
  })

  // Query for ownership status (only if authenticated)
  const {
    data: ownership,
    isLoading: ownershipLoading,
    refetch: refetchOwnership,
  } = useQuery<OwnershipResponse>({
    queryKey: ['ownership', numericBookId],
    queryFn: () => apiService.checkOwnership(numericBookId!),
    enabled: !!numericBookId && isAuthenticated,
  })

  // Handle purchase success
  const handlePurchaseSuccess = () => {
    setPurchaseSuccess(true)
    refetchOwnership()
    // Clear success message after 5 seconds
    setTimeout(() => setPurchaseSuccess(false), 5000)
  }

  // Handle read book
  const handleRead = () => {
    if (numericBookId) {
      navigate(`/reader/${numericBookId}`)
    }
  }

  // Handle back navigation
  const handleBack = () => {
    navigate(-1)
  }

  // Loading state
  if (bookLoading) {
    return (
      <div className='bg-kahf-light min-h-screen'>
        <div className='container mx-auto px-4 py-8'>
          <div className='animate-pulse'>
            <div className='mb-6 h-8 w-32 rounded bg-gray-300'></div>
            <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
              <div className='lg:col-span-1'>
                <div className='aspect-[3/4] rounded-lg bg-gray-300'></div>
              </div>
              <div className='space-y-4 lg:col-span-2'>
                <div className='h-8 w-3/4 rounded bg-gray-300'></div>
                <div className='h-6 w-1/2 rounded bg-gray-300'></div>
                <div className='h-4 w-1/4 rounded bg-gray-300'></div>
                <div className='space-y-2'>
                  <div className='h-4 rounded bg-gray-300'></div>
                  <div className='h-4 rounded bg-gray-300'></div>
                  <div className='h-4 w-3/4 rounded bg-gray-300'></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (bookError || !book) {
    return (
      <div className='bg-kahf-light min-h-screen'>
        <div className='container mx-auto px-4 py-8'>
          <button
            onClick={handleBack}
            className='mb-6 flex items-center text-kahf-primary transition-colors hover:text-kahf-secondary'
          >
            <svg
              className='mr-2 h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Back
          </button>

          <div className='rounded-lg bg-white p-8 text-center shadow-md'>
            <div className='mb-4 text-6xl'>📚</div>
            <h1 className='mb-2 text-2xl font-bold text-kahf-primary'>
              Book Not Found
            </h1>
            <p className='mb-6 text-gray-600'>
              The book you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate('/catalog')}
              className='rounded-md bg-kahf-primary px-6 py-2 text-white transition-colors hover:bg-kahf-secondary'
            >
              Browse Catalog
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isOwned = ownership?.owns_book || false
  const isOwnershipLoading = isAuthenticated && ownershipLoading

  return (
    <div className='bg-kahf-light min-h-screen'>
      <div className='container mx-auto px-4 py-8'>
        {/* Back Button */}
        <button
          onClick={handleBack}
          className='mb-6 flex items-center text-kahf-primary transition-colors hover:text-kahf-secondary'
        >
          <svg
            className='mr-2 h-5 w-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
          Back
        </button>

        {/* Success Message */}
        {purchaseSuccess && (
          <div className='mb-6 rounded-md border border-green-400 bg-green-100 px-4 py-3 text-green-700'>
            <div className='flex items-center'>
              <svg
                className='mr-2 h-5 w-5'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              Purchase successful! You can now read this book.
            </div>
          </div>
        )}

        {/* Book Details */}
        <div className='overflow-hidden rounded-lg bg-white shadow-md'>
          <div className='grid grid-cols-1 gap-8 p-8 lg:grid-cols-3'>
            {/* Book Cover */}
            <div className='lg:col-span-1'>
              <div className='flex aspect-[3/4] items-center justify-center rounded-lg bg-gradient-to-br from-kahf-secondary to-kahf-primary text-white shadow-lg'>
                <div className='p-6 text-center'>
                  <div className='mb-4 text-6xl'>📚</div>
                  <div className='text-lg font-bold leading-tight'>
                    {book.title}
                  </div>
                </div>
              </div>

              {/* Ownership Badge */}
              {isOwned && (
                <div className='mt-4 rounded-md border border-green-400 bg-green-100 px-4 py-2 text-center text-green-700'>
                  <svg
                    className='mr-2 inline h-5 w-5'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  You own this book
                </div>
              )}
            </div>

            {/* Book Information */}
            <div className='lg:col-span-2'>
              <div className='space-y-6'>
                {/* Title and Author */}
                <div>
                  <h1 className='mb-2 text-3xl font-bold text-kahf-primary'>
                    {book.title}
                  </h1>
                  <p className='text-xl text-kahf-secondary'>
                    by {book.author}
                  </p>
                </div>

                {/* Genre */}
                <div>
                  <span className='bg-kahf-light inline-block rounded-full px-3 py-1 text-sm font-medium text-kahf-primary'>
                    {book.genre}
                  </span>
                </div>

                {/* Description */}
                <div>
                  <h2 className='mb-3 text-lg font-semibold text-kahf-primary'>
                    Description
                  </h2>
                  <p className='leading-relaxed text-gray-700'>
                    {book.description}
                  </p>
                </div>

                {/* Purchase Information */}
                {ownership?.purchase_date && (
                  <div>
                    <h2 className='mb-3 text-lg font-semibold text-kahf-primary'>
                      Purchase Information
                    </h2>
                    <p className='text-gray-700'>
                      Purchased on{' '}
                      {new Date(ownership.purchase_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className='flex flex-col gap-4 pt-4 sm:flex-row'>
                  {isAuthenticated ? (
                    <>
                      {isOwned ? (
                        <button
                          onClick={handleRead}
                          className='flex flex-1 items-center justify-center rounded-md bg-kahf-primary px-6 py-3 font-medium text-white transition-colors hover:bg-kahf-secondary'
                        >
                          <svg
                            className='mr-2 h-5 w-5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                            />
                          </svg>
                          Read Now
                        </button>
                      ) : (
                        <PurchaseButton
                          bookId={book.id}
                          isLoading={isOwnershipLoading}
                          onSuccess={handlePurchaseSuccess}
                          className='flex-1'
                        />
                      )}
                    </>
                  ) : (
                    <div className='rounded-md border border-gray-300 bg-gray-100 px-6 py-3 text-center text-gray-600'>
                      <p className='mb-2'>
                        Please log in to purchase or read this book
                      </p>
                      <button
                        onClick={() => (window.location.href = '/login')}
                        className='font-medium text-kahf-primary hover:text-kahf-secondary'
                      >
                        Log In
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => navigate('/catalog')}
                    className='hover:bg-kahf-light rounded-md border border-kahf-primary bg-white px-6 py-3 font-medium text-kahf-primary transition-colors sm:w-auto'
                  >
                    Browse More Books
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetails
