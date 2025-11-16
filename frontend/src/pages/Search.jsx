import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import BookGrid from '../components/Books/BookGrid';
import { Search as SearchIcon, ArrowLeft, Filter, X } from 'lucide-react';

const Search = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [books, setBooks] = useState([]);
  const [ownedBooks, setOwnedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    } else {
      navigate('/catalog');
    }

    if (isAuthenticated) {
      loadOwnedBooks();
    }
  }, [searchParams, isAuthenticated, navigate]);

  const performSearch = async (query) => {
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

  const loadOwnedBooks = async () => {
    try {
      const response = await booksAPI.getMyBooks();
      setOwnedBooks(response.data);
    } catch (error) {
      console.error('Failed to load owned books:', error);
    }
  };

  const handleNewSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-cream/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/catalog')}
            className="flex items-center space-x-2 text-dark-brown hover:text-brown transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Catalog</span>
          </button>

          <h1 className="text-3xl font-bold text-dark-brown mb-4">
            Search Results
          </h1>
          
          {searchParams.get('q') && (
            <p className="text-dark-brown/70">
              Showing results for "{searchParams.get('q')}"
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleNewSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search books, authors, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pr-12"
                autoFocus
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-brown hover:text-brown/80"
              >
                <SearchIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-6">
            <p className="text-dark-brown/70">
              {books.length} book{books.length !== 1 ? 's' : ''} found
              {searchParams.get('q') && ` for "${searchParams.get('q')}"`}
            </p>
          </div>
        )}

        {/* Results */}
        <BookGrid 
          books={books}
          loading={loading}
          ownedBooks={ownedBooks}
          emptyMessage="No books found"
          emptySubMessage="Try different keywords or browse our full catalog"
        />

        {/* No Results Actions */}
        {!loading && books.length === 0 && searchParams.get('q') && (
          <div className="text-center mt-8">
            <div className="space-y-4">
              <button
                onClick={() => navigate('/catalog')}
                className="btn-primary mr-4"
              >
                Browse All Books
              </button>
              <button
                onClick={() => {
                  setSearchQuery('');
                  navigate('/search');
                }}
                className="btn-secondary"
              >
                New Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;