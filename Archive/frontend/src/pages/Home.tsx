import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { BookGrid } from '../components/books'
import { SearchBar, FilterPanel } from '../components/common'
import { useApiService } from '../hooks/useApiService'
import { Book, BookFilters } from '../types'

const Home: React.FC = () => {
  const { apiService } = useApiService()
  const navigate = useNavigate()
  const [filters, setFilters] = useState<BookFilters>({})

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

  // Filter books based on current filters
  const filteredBooks = useMemo(() => {
    let result = books

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

    return result
  }, [books, filters])

  // Get featured books (first 5 books for now)
  const featuredBooks = useMemo(() => {
    return books.slice(0, 5)
  }, [books])

  // Get owned book IDs
  const ownedBookIds = useMemo(() => {
    return ownedBooks.map((book: Book) => book.id)
  }, [ownedBooks])

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }))
  }

  const handleFilterChange = (newFilters: BookFilters) => {
    setFilters(newFilters)
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

  return (
    <div className='min-h-screen bg-kahf-accent'>
      {/* Hero Section */}
      <section className='bg-gradient-to-r from-kahf-primary to-kahf-secondary py-16 text-white'>
        <div className='container mx-auto px-4'>
          <div className='mx-auto max-w-4xl text-center'>
            <h1 className='mb-6 text-4xl font-bold md:text-6xl'>
              Welcome to KAHF Ebook Store
            </h1>
            <p className='mb-8 text-xl opacity-90 md:text-2xl'>
              Discover, Purchase, and Read Amazing Books
            </p>
            <div className='mx-auto max-w-2xl'>
              <SearchBar
                onSearch={handleSearch}
                placeholder='Search for books, authors, or genres...'
                className='mb-4'
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      {featuredBooks.length > 0 && (
        <section className='py-16'>
          <div className='container mx-auto px-4'>
            <h2 className='mb-8 text-center text-3xl font-bold text-kahf-primary'>
              Featured Books
            </h2>
            <BookGrid
              books={featuredBooks}
              ownedBookIds={ownedBookIds}
              onPurchase={handlePurchase}
              onRead={handleRead}
              loading={isLoading}
              error={error}
              className='mb-8'
            />
            <div className='text-center'>
              <button
                onClick={() => navigate('/catalog')}
                className='rounded-lg bg-kahf-primary px-8 py-3 font-semibold text-white transition-colors duration-200 hover:bg-kahf-secondary'
              >
                View All Books
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog Section */}
      <section className='bg-white py-16'>
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
              <div className='mb-6 flex items-center justify-between'>
                <h2 className='text-2xl font-bold text-kahf-primary'>
                  {filters.searchQuery || filters.author || filters.genre
                    ? 'Search Results'
                    : 'All Books'}
                </h2>
                <div className='text-sm text-gray-600'>
                  {filteredBooks.length} book
                  {filteredBooks.length !== 1 ? 's' : ''} found
                </div>
              </div>

              <BookGrid
                books={filteredBooks}
                ownedBookIds={ownedBookIds}
                onPurchase={handlePurchase}
                onRead={handleRead}
                loading={isLoading}
                error={error}
              />
            </main>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
