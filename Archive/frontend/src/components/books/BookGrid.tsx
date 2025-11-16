import React from 'react'
import { Book } from '../../types'
import BookCard from './BookCard'

interface BookGridProps {
  books: Book[]
  ownedBookIds?: number[]
  onPurchase?: (bookId: number) => void
  onRead?: (bookId: number) => void
  loading?: boolean
  error?: string | null
  className?: string
}

const BookGrid: React.FC<BookGridProps> = ({
  books,
  ownedBookIds = [],
  onPurchase,
  onRead,
  loading = false,
  error = null,
  className = '',
}) => {
  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${className}`}
      >
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className='animate-pulse'>
            <div className='mb-4 aspect-[3/4] rounded-lg bg-gray-300'></div>
            <div className='space-y-2'>
              <div className='h-4 w-3/4 rounded bg-gray-300'></div>
              <div className='h-3 w-1/2 rounded bg-gray-300'></div>
              <div className='h-3 w-1/4 rounded bg-gray-300'></div>
              <div className='h-8 rounded bg-gray-300'></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className='mb-2 text-lg text-red-500'>⚠️ Error Loading Books</div>
        <p className='mb-4 text-gray-600'>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className='rounded-md bg-kahf-primary px-4 py-2 text-white transition-colors hover:bg-kahf-secondary'
        >
          Try Again
        </button>
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className='mb-4 text-6xl'>📚</div>
        <h3 className='mb-2 text-xl font-semibold text-kahf-primary'>
          No Books Found
        </h3>
        <p className='text-gray-600'>
          Try adjusting your search or filter criteria.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ${className}`}
    >
      {books.map(book => (
        <BookCard
          key={book.id}
          book={book}
          isOwned={ownedBookIds.includes(book.id)}
          onPurchase={onPurchase}
          onRead={onRead}
        />
      ))}
    </div>
  )
}

export default BookGrid
