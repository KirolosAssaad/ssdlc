import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { booksAPI } from '../../services/api';
import { 
  BookOpen, 
  ShoppingCart, 
  Lock, 
  Unlock,
  Eye,
  User,
  Tag,
  Play
} from 'lucide-react';

const BookCard = ({ book, owned = false, showPurchaseDate = false }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [purchasing, setPurchasing] = useState(false);

  const handlePurchase = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setPurchasing(true);
      await booksAPI.purchaseBook(book.id);
      
      // Refresh the page or update state to show the book as owned
      window.location.reload();
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleReadOnline = (e) => {
    e.stopPropagation();
    navigate(`/read/${book.id}`);
  };

  const handleCardClick = () => {
    navigate(`/book/${book.id}`);
  };

  return (
    <div 
      className="card hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={handleCardClick}
    >
      {/* Book Cover Placeholder */}
      <div className="relative h-64 bg-gradient-to-br from-brown/10 to-brown/20 flex items-center justify-center">
        <BookOpen className="h-16 w-16 text-brown/40" />
        
        {/* DRM Status Indicator */}
        <div className="absolute top-3 right-3">
          {owned ? (
            <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Unlock className="h-3 w-3" />
              <span>Owned</span>
            </div>
          ) : (
            <div className="bg-brown/10 text-brown px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
              <Lock className="h-3 w-3" />
              <span>DRM</span>
            </div>
          )}
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-dark-brown/0 group-hover:bg-dark-brown/10 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Eye className="h-8 w-8 text-brown" />
        </div>
      </div>

      {/* Book Info */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-dark-brown mb-2 line-clamp-2 group-hover:text-brown transition-colors">
          {book.title}
        </h3>
        
        <div className="flex items-center space-x-2 text-sm text-dark-brown/70 mb-3">
          <User className="h-4 w-4" />
          <span>{book.author || 'Unknown Author'}</span>
        </div>

        {book.genre && (
          <div className="flex items-center space-x-2 text-sm text-dark-brown/70 mb-3">
            <Tag className="h-4 w-4" />
            <span>{book.genre}</span>
          </div>
        )}

        {book.description && (
          <p className="text-sm text-dark-brown/80 mb-4 line-clamp-3">
            {book.description}
          </p>
        )}

        {showPurchaseDate && book.purchase_date && (
          <p className="text-xs text-dark-brown/60 mb-4">
            Purchased: {new Date(book.purchase_date).toLocaleDateString()}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {owned ? (
            <button
              onClick={handleReadOnline}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Read Online</span>
            </button>
          ) : (
            <button
              onClick={handlePurchase}
              disabled={purchasing}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>{purchasing ? 'Purchasing...' : 'Purchase'}</span>
            </button>
          )}
          
          <button
            onClick={handleCardClick}
            className="btn-secondary flex items-center justify-center"
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;