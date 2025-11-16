import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import BookGrid from '../components/Books/BookGrid';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown,
  BookOpen,
  User,
  Tag
} from 'lucide-react';

const Catalog = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [books, setBooks] = useState([]);
  const [ownedBooks, setOwnedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [genres, setGenres] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInitialData();
    if (isAuthenticated) {
      loadOwnedBooks();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Handle search from URL params
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      loadAllBooks();
    }
  }, [searchParams]);

  const loadInitialData = async () => {
    try {
      const [genresResponse, authorsResponse] = await Promise.all([
        booksAPI.getGenres(),
        booksAPI.getAuthors()
      ]);
      
      setGenres(genresResponse.data);
      setAuthors(authorsResponse.data);
    } catch (error) {
      console.error('Failed to load filter data:', error);
    }
  };

  const loadAllBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getAllBooks();
      setBooks(response.data);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOwnedBooks = async () => {
    try {
      const response = await booksAPI.getMyBooks();
      setOwnedBooks(response.data);
    } catch (error) {
      console.error('Failed to load owned books:', error);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      loadAllBooks();
      return;
    }

    try {
      setLoading(true);
      const response = await booksAPI.searchBooks(query);
      setBooks(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
    clearFilters();
  };

  const handleGenreFilter = async (genre) => {
    if (!genre) {
      loadAllBooks();
      setSelectedGenre('');
      return;
    }

    try {
      setLoading(true);
      setSelectedGenre(genre);
      setSelectedAuthor('');
      setSearchQuery('');
      setSearchParams({});
      
      const response = await booksAPI.filterByGenre(genre);
      setBooks(response.data);
    } catch (error) {
      console.error('Genre filter failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorFilter = async (author) => {
    if (!author) {
      loadAllBooks();
      setSelectedAuthor('');
      return;
    }

    try {
      setLoading(true);
      setSelectedAuthor(author);
      setSelectedGenre('');
      setSearchQuery('');
      setSearchParams({});
      
      const response = await booksAPI.filterByAuthor(author);
      setBooks(response.data);
    } catch (error) {
      console.error('Author filter failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedGenre('');
    setSelectedAuthor('');
    setSearchQuery('');
    setSearchParams({});
    loadAllBooks();
  };

  const hasActiveFilters = selectedGenre || selectedAuthor || searchQuery;

  return (
    <div className="min-h-screen bg-cream/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark-brown mb-4">
            Book Catalog
          </h1>
          <p className="text-dark-brown/70">
            Discover and purchase from our extensive collection of ebooks
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search books, authors, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pr-12"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brown hover:text-brown/80"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-dark-brown hover:text-brown transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-brown hover:text-brown/80 transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-brown/10">
              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-brown mb-2">
                  <Tag className="h-4 w-4 inline mr-1" />
                  Genre
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => handleGenreFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Author Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-brown mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Author
                </label>
                <select
                  value={selectedAuthor}
                  onChange={(e) => handleAuthorFilter(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Authors</option>
                  {authors.map((author) => (
                    <option key={author} value={author}>
                      {author}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-brown/10">
              {searchQuery && (
                <div className="bg-brown/10 text-brown px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <Search className="h-3 w-3" />
                  <span>"{searchQuery}"</span>
                </div>
              )}
              {selectedGenre && (
                <div className="bg-brown/10 text-brown px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <Tag className="h-3 w-3" />
                  <span>{selectedGenre}</span>
                </div>
              )}
              {selectedAuthor && (
                <div className="bg-brown/10 text-brown px-3 py-1 rounded-full text-sm flex items-center space-x-2">
                  <User className="h-3 w-3" />
                  <span>{selectedAuthor}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-dark-brown/70">
              {books.length} book{books.length !== 1 ? 's' : ''} found
            </p>
          </div>
        )}

        {/* Books Grid */}
        <BookGrid 
          books={books}
          loading={loading}
          ownedBooks={ownedBooks}
          emptyMessage={hasActiveFilters ? "No books match your criteria" : "No books available"}
          emptySubMessage={hasActiveFilters ? "Try adjusting your search or filters" : "Check back soon for new additions"}
        />
      </div>
    </div>
  );
};

export default Catalog;