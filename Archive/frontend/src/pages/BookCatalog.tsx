import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookGrid } from '../components/books'
import { SearchBar, FilterPanel } from '../components/common'
import { useApiService } from '../hooks/useApiService'
import { Book, BookFilters } from '../types'

const BOOKS_PER_PAGE = 20

const BookCatalog: React.FC = () => {
  const { apiService } = useApiService()
  const [filters, setFilters] = useState<BookFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'genre'>('title')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  // Fetch all books
  const {
    data: books = [],
    isLoading: booksLoading,
    error: booksError,
  } = useQuery({
    queryKey: ['books'],
    queryFn: () => apiService.getBooks(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch owned books for authenticated users
  const { data: ownedBooks = [], isLoading: ownedBooksLoading } = useQuery({
    queryKey: ['myBooks'],
    queryFn: () => apiService.getMyBooks(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: false, // Don't retry if user is not authenticated
  })

  // Extract unique authors and genres for filtering
  const { authors, genres } = useMemo(() => {
    const uniqueAuthors = [
      ...new Set(books.map((book: Book) => book.author)),
    ].sort()
    const uniqueGenres = [
      ...new Set(books.map((book: Book) => book.genre)),
    ].sort()
    return { authors: uniqueAuthors, genres: uniqueGenres }
  }, [books])

  // Filter and sort books
  const { filteredBooks, totalPages } = useMemo(() => {
    let result = books

    // Apply filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      result = result.filter(
        (book: Book) =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.genre.toLowerCase().includes(query) ||
          book.description.toLowerCase().includes(query)
      )
    }

    if (filters.author) {
      result = result.filter((book: Book) => book.author === filters.author)
    }

    if (filters.genre) {
      result = result.filter((book: Book) => book.genre === filters.genre)
    }

    // Apply sorting
    result.sort((a: Book, b: Book) => {
      let comparison = 0
      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'author':
          comparison = a.author.localeCompare(b.author)
          break
        case 'genre':
          comparison = a.genre.localeCompare(b.genre)
          break
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    // Calculate pagination
    const totalPages = Math.ceil(result.length / BOOKS_PER_PAGE)
    const startIndex = (currentPage - 1) * BOOKS_PER_PAGE
    const paginatedResult = result.slice(
      startIndex,
      startIndex + BOOKS_PER_PAGE
    )

    return { filteredBooks: paginatedResult, totalPages }
  }, [books, filters, sortBy, sortOrder, currentPage])

  // Get owned book IDs
  const ownedBookIds = useMemo(() => {
    return ownedBooks.map((book: Book) => book.id)
  }, [ownedBooks])

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }))
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleFilterChange = (newFilters: BookFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const handleSortChange = (newSortBy: 'title' | 'author' | 'genre') => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(newSortBy)
      setSortOrder('asc')
    }
    setCurrentPage(1) // Reset to first page when sorting
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePurchase = (bookId: number) => {
    // Purchase handling is now done by the PurchaseButton component
    // This function is kept for compatibility but may not be used
    console.log('Purchase initiated for book:', bookId)
  }

  const handleRead = (bookId: number) => {
    // Navigate to book reader - will be implemented in task 8
    console.log('Reading book:', bookId)
  }

  const isLoading = booksLoading || ownedBooksLoading
  const error = booksError ? (booksError as Error).message : null

  // Generate pagination numbers
  const getPaginationNumbers = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <div className='min-h-screen bg-kahf-accent'>
      {/* Header Section */}
      <section className='border-b border-gray-200 bg-white py-8 shadow-sm'>
        <div className='container mx-auto px-4'>
          <div className='mx-auto max-w-4xl'>
            <h1 className='mb-6 text-center text-3xl font-bold text-kahf-primary'>
              Book Catalog
            </h1>
            <SearchBar
              onSearch={handleSearch}
              placeholder='Search books, authors, or genres...'
              className='mb-4'
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className='py-8'>
        <div className='container mx-auto px-4'>
          <div className='flex flex-col gap-8 lg:flex-row'>
            {/* Filter Sidebar */}
            <aside className='lg:w-1/4'>
              <FilterPanel
                authors={authors}
                genres={genres}
                onFilterChange={handleFilterChange}
                activeFilters={filters}
              />
            </aside>

            {/* Books Grid */}
            <main className='lg:w-3/4'>
              {/* Sort and Results Info */}
              <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='text-sm text-gray-600'>
                  Showing {(currentPage - 1) * BOOKS_PER_PAGE + 1}-
                  {Math.min(currentPage * BOOKS_PER_PAGE, books.length)} of{' '}
                  {books.length} books
                </div>

                <div className='flex items-center gap-2'>
                  <span className='text-sm text-gray-600'>Sort by:</span>
                  <div className='flex gap-1'>
                    {(['title', 'author', 'genre'] as const).map(option => (
                      <button
                        key={option}
                        onClick={() => handleSortChange(option)}
                        className={`rounded px-3 py-1 text-sm transition-colors duration-200 ${
                          sortBy === option
                            ? 'bg-kahf-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                        {sortBy === option && (
                          <span className='ml-1'>
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Books Grid */}
              <BookGrid
                books={filteredBooks}
                ownedBookIds={ownedBookIds}
                onPurchase={handlePurchase}
                onRead={handleRead}
                loading={isLoading}
                error={error}
                className='mb-8'
              />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='mt-8 flex items-center justify-center gap-2'>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className='rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    Previous
                  </button>

                  {getPaginationNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className='px-3 py-2 text-gray-500'>...</span>
                      ) : (
                        <button
                          onClick={() => handlePageChange(page as number)}
                          className={`rounded-md border px-3 py-2 text-sm transition-colors duration-200 ${
                            currentPage === page
                              ? 'border-kahf-primary bg-kahf-primary text-white'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )}
                    </React.Fragment>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className='rounded-md border border-gray-300 px-3 py-2 text-sm transition-colors duration-200 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50'
                  >
                    Next
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}

export default BookCatalog
