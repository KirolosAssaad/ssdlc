import React, { useState, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import BookCard from '../../components/BookCard/BookCard';
import { useAuth } from '../../context/AuthContext';
import { bookService } from '../../api';
import { Book } from '../../types';

const Landing: React.FC = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [genres, setGenres] = useState<string[]>([]);

  useEffect(() => {
    loadBooks();
  }, [searchTerm, selectedGenre]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks({
        search: searchTerm || undefined,
        genre: selectedGenre || undefined,
        sortBy: 'rating',
        sortOrder: 'desc',
      });
      
      setBooks(response.books);
      
      // Extract unique genres from all books for filter
      if (!selectedGenre && !searchTerm) {
        const uniqueGenres = Array.from(new Set(response.books.map(book => book.genre)));
        setGenres(uniqueGenres);
      }
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (bookId: string) => {
    if (!user) {
      alert('Please log in to purchase books');
      return;
    }

    try {
      const response = await bookService.purchaseBook({
        bookId,
        paymentMethod: 'credit_card', // Mock payment method
      });

      if (response.success) {
        alert(`Book purchased successfully! Purchase ID: ${response.purchaseId}`);
        // Refresh books to update purchase status
        loadBooks();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    }
  };

  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        padding: '3rem 0'
      }}>
        <h1 style={{ 
          fontSize: '3rem', 
          marginBottom: '1rem',
          color: 'var(--color-dark-brown)',
          fontWeight: 'bold'
        }}>
          Welcome to BookVault
        </h1>
        <p style={{ 
          fontSize: '1.2rem', 
          color: 'var(--color-medium-brown)',
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: '1.6'
        }}>
          Discover your next favorite read from our curated collection of digital books. 
          One device, unlimited possibilities.
        </p>
        {!user && (
          <div style={{ marginTop: '2rem' }}>
            <a href="/signup" className="btn btn-primary" style={{ marginRight: '1rem' }}>
              Get Started
            </a>
            <a href="/login" className="btn btn-secondary">
              Sign In
            </a>
          </div>
        )}
      </section>

      {/* Search and Filter */}
      <section style={{ marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
            <Search 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#666'
              }} 
            />
            <input
              type="text"
              placeholder="Search books or authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          
          <div style={{ position: 'relative', minWidth: '150px' }}>
            <Filter 
              size={20} 
              style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#666'
              }} 
            />
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
            >
              <option value="">All Genres</option>
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Books Grid */}
      <section>
        <h2 style={{ 
          marginBottom: '1.5rem',
          color: 'var(--color-dark-brown)',
          fontSize: '1.8rem'
        }}>
          Featured Books
        </h2>
        
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            padding: '3rem',
            color: 'var(--color-medium-brown)'
          }}>
            <Loader2 size={32} className="animate-spin" style={{ marginRight: '0.5rem' }} />
            Loading books...
          </div>
        ) : books.length > 0 ? (
          <div className="grid grid-4">
            {books.map(book => (
              <BookCard 
                key={book.id} 
                book={book} 
                onPurchase={handlePurchase}
                isPurchased={user?.purchasedBooks.includes(book.id)}
              />
            ))}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: '#666'
          }}>
            <p>No books found matching your criteria.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Landing;