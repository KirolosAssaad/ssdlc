import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { BookCardProps } from '../../types'
import { PurchaseButton } from '.'

const BookCard: React.FC<BookCardProps> = ({
  book,
  isOwned = false,
  onPurchase,
  onRead,
  className = '',
}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const handlePurchaseSuccess = () => {
    // Invalidate queries to refresh ownership status
    queryClient.invalidateQueries({ queryKey: ['myBooks'] })
    queryClient.invalidateQueries({ queryKey: ['ownership', book.id] })

    // Call the parent's onPurchase callback if provided
    if (onPurchase) {
      onPurchase(book.id)
    }
  }

  const handleRead = () => {
    if (onRead) {
      onRead(book.id)
    } else {
      // Navigate to the book reader
      navigate(`/reader/${book.id}`)
    }
  }

  const handleDetails = () => {
    navigate(`/book/${book.id}`)
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg ${className}`}
    >
      {/* Book Cover Placeholder */}
      <div className='flex aspect-[3/4] items-center justify-center bg-gradient-to-br from-kahf-secondary to-kahf-primary p-4'>
        <div className='text-center text-white'>
          <div className='mb-2 text-2xl font-bold'>📚</div>
          <div className='text-xs font-medium leading-tight'>{book.title}</div>
        </div>
      </div>

      {/* Book Information */}
      <div className='p-4'>
        <h3 className='mb-1 line-clamp-2 text-lg font-semibold text-kahf-primary'>
          {book.title}
        </h3>
        <p className='mb-2 text-sm text-kahf-secondary'>by {book.author}</p>
        <p className='mb-1 text-xs text-gray-600'>{book.genre}</p>
        <p className='mb-4 line-clamp-3 text-sm text-gray-700'>
          {book.description}
        </p>

        {/* Action Buttons */}
        <div className='flex gap-2'>
          {isOwned ? (
            <button
              onClick={handleRead}
              className='flex-1 rounded-md bg-kahf-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-kahf-secondary'
            >
              Read Now
            </button>
          ) : (
            <PurchaseButton
              bookId={book.id}
              onSuccess={handlePurchaseSuccess}
              className='flex-1 px-4 py-2 text-sm'
            />
          )}
          <button
            onClick={handleDetails}
            className='rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors duration-200 hover:bg-gray-50'
          >
            Details
          </button>
        </div>
      </div>

      {/* Ownership Badge */}
      {isOwned && (
        <div className='absolute right-2 top-2 rounded-full bg-green-500 px-2 py-1 text-xs text-white'>
          Owned
        </div>
      )}
    </div>
  )
}

export default BookCard
