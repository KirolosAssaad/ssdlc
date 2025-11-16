import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useMyBooks, useMyPurchases } from '@/hooks/useApiService'
import { SearchBar, FilterPanel } from '@/components/common'
import { BookFilters } from '@/types'
import { MyBooks, PurchaseHistory } from '@/components/library'

type LibraryTab = 'books' | 'history'

const Library: React.FC = () => {
  const navigate = useNavigate()
  const { isAuthenticated, isLoading: authLoading } = useAuth0()
  const [activeTab, setActiveTab] = useState<LibraryTab>('books')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<BookFilters>({})

  // Fetch user's books and purchase history
  const {
    data: myBooks = [],
    isLoading: booksLoading,
    error: booksError,
  } = useMyBooks()

  const {
    data: purchases = [],
    isLoading: purchasesLoading,
    error: purchasesError,
  } = useMyPurchases()

  // Filter and search books
  const filteredBooks = useMemo(() => {
    let filtered = myBooks

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        book =>
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.genre.toLowerCase().includes(query)
      )
    }

    // Apply filters
    if (filters.author) {
      filtered = filtered.filter(book => book.author === filters.author)
    }

    if (filters.genre) {
      filtered = filtered.filter(book => book.genre === filters.genre)
    }

    return filtered
  }, [myBooks, searchQuery, filters])

  // Get unique authors and genres for filtering
  const { authors, genres } = useMemo(() => {
    const uniqueAuthors = Array.from(
      new Set(myBooks.map(book => book.author))
    ).sort()
    const uniqueGenres = Array.from(
      new Set(myBooks.map(book => book.genre))
    ).sort()

    return {
      authors: uniqueAuthors,
      genres: uniqueGenres,
    }
  }, [myBooks])

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleFilterChange = (newFilters: BookFilters) => {
    setFilters(newFilters)
  }

  const handleRead = (bookId: number) => {
    // Navigate to the book reader
    navigate(`/reader/${bookId}`)
  }

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-kahf-primary border-t-transparent'></div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <h2 className='mb-4 text-2xl font-bold text-kahf-primary'>
            Access Denied
          </h2>
          <p className='mb-6 text-gray-600'>
            Please log in to access your library.
          </p>
          <button
            onClick={() => (window.location.href = '/')}
            className='rounded-md bg-kahf-primary px-6 py-2 text-white transition-colors duration-200 hover:bg-kahf-secondary'
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const isLoading = booksLoading || purchasesLoading
  const hasError = booksError || purchasesError

  return (
    <div className='bg-kahf-light min-h-screen'>
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-kahf-primary'>My Library</h1>
          <p className='mt-2 text-gray-600'>
            Manage your purchased books and view your reading history
          </p>
        </div>

        {/* Tab Navigation */}
        <div className='mb-6'>
          <nav className='flex space-x-8'>
            <button
              onClick={() => setActiveTab('books')}
              className={`border-b-2 pb-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'books'
                  ? 'border-kahf-primary text-kahf-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              My Books ({myBooks.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`border-b-2 pb-2 text-sm font-medium transition-colors duration-200 ${
                activeTab === 'history'
                  ? 'border-kahf-primary text-kahf-primary'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Purchase History ({purchases.length})
            </button>
          </nav>
        </div>

        {/* Error State */}
        {hasError && (
          <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <svg
                  className='h-5 w-5 text-red-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-red-800'>
                  Error loading library data
                </h3>
                <p className='mt-1 text-sm text-red-700'>
                  {booksError?.message ||
                    purchasesError?.message ||
                    'An unexpected error occurred'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className='flex items-center justify-center py-12'>
            <div className='text-center'>
              <div className='mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-kahf-primary border-t-transparent'></div>
              <p className='text-gray-600'>Loading your library...</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!isLoading && !hasError && (
          <>
            {activeTab === 'books' && (
              <div className='grid grid-cols-1 gap-6 lg:grid-cols-4'>
                {/* Search and Filter Sidebar */}
                <div className='lg:col-span-1'>
                  <div className='space-y-6'>
                    <SearchBar
                      onSearch={handleSearch}
                      placeholder='Search your books...'
                      className='w-full'
                    />
                    <FilterPanel
                      authors={authors}
                      genres={genres}
                      onFilterChange={handleFilterChange}
                      activeFilters={filters}
                    />
                  </div>
                </div>

                {/* Books Grid */}
                <div className='lg:col-span-3'>
                  <MyBooks
                    books={filteredBooks}
                    onRead={handleRead}
                    searchQuery={searchQuery}
                    filters={filters}
                  />
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <PurchaseHistory purchases={purchases} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Library
