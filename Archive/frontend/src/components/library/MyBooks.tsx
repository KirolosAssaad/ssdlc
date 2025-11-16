import React, { useState, useMemo } from 'react'
import { Book, BookFilters } from '@/types'
import { BookCard } from '@/components/books'

interface MyBooksProps {
  books: Book[]
  onRead: (bookId: number) => void
  searchQuery: string
  filters: BookFilters
}

type SortOption = 'title' | 'author' | 'genre' | 'recent'

const MyBooks: React.FC<MyBooksProps> = ({
  books,
  onRead,
  searchQuery,
  filters,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('recent')

  // Sort books based on selected option
  const sortedBooks = useMemo(() => {
    const sorted = [...books]

    switch (sortBy) {
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      case 'author':
        return sorted.sort((a, b) => a.author.localeCompare(b.author))
      case 'genre':
        return sorted.sort((a, b) => a.genre.localeCompare(b.genre))
      case 'recent':
      default:
        // For recent, we'll sort by book ID (assuming higher ID = more recent purchase)
        return sorted.sort((a, b) => b.id - a.id)
    }
  }, [books, sortBy])

  const hasActiveFilters = searchQuery || filters.author || filters.genre

  return (
    <div className='space-y-6'>
      {/* Header with Sort Options */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-kahf-primary'>
            My Books
            {hasActiveFilters && (
              <span className='ml-2 text-sm font-normal text-gray-500'>
                ({sortedBooks.length} of {books.length} books)
              </span>
            )}
          </h2>
          {hasActiveFilters && (
            <p className='mt-1 text-sm text-gray-600'>
              Showing filtered results
              {searchQuery && ` for "${searchQuery}"`}
              {filters.author && ` by ${filters.author}`}
              {filters.genre && ` in ${filters.genre}`}
            </p>
          )}
        </div>

        {books.length > 0 && (
          <div className='flex items-center gap-2'>
            <label htmlFor='sort-select' className='text-sm text-gray-600'>
              Sort by:
            </label>
            <select
              id='sort-select'
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className='rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-kahf-primary focus:outline-none focus:ring-1 focus:ring-kahf-primary'
            >
              <option value='recent'>Recently Added</option>
              <option value='title'>Title (A-Z)</option>
              <option value='author'>Author (A-Z)</option>
              <option value='genre'>Genre (A-Z)</option>
            </select>
          </div>
        )}
      </div>

      {/* Books Grid */}
      {sortedBooks.length > 0 ? (
        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {sortedBooks.map(book => (
            <BookCard
              key={book.id}
              book={book}
              isOwned={true}
              onRead={onRead}
              className='h-full'
            />
          ))}
        </div>
      ) : (
        <EmptyState
          hasBooks={books.length > 0}
          hasActiveFilters={!!hasActiveFilters}
          searchQuery={searchQuery}
          filters={filters}
        />
      )}
    </div>
  )
}

interface EmptyStateProps {
  hasBooks: boolean
  hasActiveFilters: boolean
  searchQuery: string
  filters: BookFilters
}

const EmptyState: React.FC<EmptyStateProps> = ({
  hasBooks,
  hasActiveFilters,
  searchQuery,
  filters,
}) => {
  if (!hasBooks) {
    // No books at all
    return (
      <div className='py-12 text-center'>
        <div className='mx-auto mb-4 h-24 w-24 text-gray-300'>
          <svg
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            className='h-full w-full'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
            />
          </svg>
        </div>
        <h3 className='mb-2 text-lg font-medium text-gray-900'>
          Your library is empty
        </h3>
        <p className='mb-6 text-gray-600'>
          Start building your digital library by purchasing books from our
          catalog.
        </p>
        <a
          href='/catalog'
          className='inline-flex items-center rounded-md bg-kahf-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-kahf-secondary'
        >
          Browse Books
          <svg
            className='ml-2 h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </a>
      </div>
    )
  }

  if (hasActiveFilters) {
    // Has books but no results for current filters
    return (
      <div className='py-12 text-center'>
        <div className='mx-auto mb-4 h-16 w-16 text-gray-300'>
          <svg
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            className='h-full w-full'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
        <h3 className='mb-2 text-lg font-medium text-gray-900'>
          No books found
        </h3>
        <p className='mb-4 text-gray-600'>
          No books match your current search and filter criteria.
        </p>
        <div className='space-y-2 text-sm text-gray-500'>
          {searchQuery && <p>Search: "{searchQuery}"</p>}
          {filters.author && <p>Author: {filters.author}</p>}
          {filters.genre && <p>Genre: {filters.genre}</p>}
        </div>
        <p className='mt-4 text-sm text-gray-600'>
          Try adjusting your search terms or clearing the filters.
        </p>
      </div>
    )
  }

  return null
}

export default MyBooks
