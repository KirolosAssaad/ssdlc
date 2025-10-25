import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Book } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface BookCardProps {
  book: Book;
  onPurchase?: (bookId: string) => void;
  isPurchased?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, onPurchase, isPurchased = false }) => {
  const { user } = useAuth();

  const handlePurchase = () => {
    if (onPurchase && user) {
      onPurchase(book.id);
    }
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <img 
          src={book.coverImage} 
          alt={book.title}
          style={{ 
            width: '100%', 
            height: '250px', 
            objectFit: 'cover',
            borderRadius: 'var(--border-radius)'
          }}
        />
        {isPurchased && (
          <div style={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            backgroundColor: 'var(--color-gold)',
            color: 'var(--color-dark-brown)',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            OWNED
          </div>
        )}
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ 
          marginBottom: '0.5rem', 
          fontSize: '1.1rem',
          color: 'var(--color-dark-brown)'
        }}>
          {book.title}
        </h3>
        
        <p style={{ 
          color: 'var(--color-medium-brown)', 
          marginBottom: '0.5rem',
          fontWeight: '500'
        }}>
          by {book.author}
        </p>
        
        <p style={{ 
          color: '#666', 
          fontSize: '0.9rem', 
          marginBottom: '1rem',
          flex: 1
        }}>
          {book.description}
        </p>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Star size={16} fill="var(--color-gold)" color="var(--color-gold)" />
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{book.rating}</span>
          </div>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>•</span>
          <span style={{ color: '#666', fontSize: '0.9rem' }}>{book.genre}</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold',
            color: 'var(--color-medium-brown)'
          }}>
            ${book.price}
          </span>
          
          {user ? (
            isPurchased ? (
              <button 
                className="btn btn-secondary"
                style={{ fontSize: '0.9rem' }}
              >
                Download
              </button>
            ) : (
              <button 
                onClick={handlePurchase}
                className="btn btn-primary"
                style={{ fontSize: '0.9rem' }}
              >
                <ShoppingCart size={16} />
                Buy Now
              </button>
            )
          ) : (
            <span style={{ 
              color: '#666', 
              fontSize: '0.9rem',
              fontStyle: 'italic'
            }}>
              Login to purchase
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;