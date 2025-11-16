import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import { 
  BookOpen, 
  ShoppingCart, 
  ArrowLeft,
  User,
  Tag,
  Calendar,
  Shield,
  Lock,
  Unlock,
  Eye,
  Loader,
  Play
} from 'lucide-react';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [owned, setOwned] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const [checkingOwnership, setCheckingOwnership] = useState(false);

  useEffect(() => {
    loadBookDetails();
    if (isAuthenticated) {
      checkOwnership();
    }
  }, [id, isAuthenticated]);

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getBook(id);
      setBook(response.data);
    } catch (error) {
      console.error('Failed to load book details:', error);
      if (error.response?.status === 404) {
        navigate('/catalog');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async () => {
    try {
      setCheckingOwnership(true);
      const response = await booksAPI.checkOwnership(id);
      setOwned(response.data.owns_book);
    } catch (error) {
      console.error('Failed to check ownership:', error);
    } finally {
      setCheckingOwnership(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setPurchasing(true);
      await booksAPI.purchaseBook(id);
      setOwned(true);
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleReadOnline = () => {
    navigate(`/read/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream/30 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-brown animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dark-brown mb-2">
            Loading book details...
          </h2>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-cream/30 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-brown/40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-brown mb-2">
            Book not found
          </h2>
          <p className="text-dark-brown/70 mb-6">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/catalog')}
            className="btn-primary"
          >
            Browse Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-dark-brown hover:text-brown transition-colors mb-8"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="card p-8">
              <div className="relative h-96 bg-gradient-to-br from-brown/10 to-brown/20 rounded-lg flex items-center justify-center mb-6">
                <BookOpen className="h-24 w-24 text-brown/40" />
                
                {/* DRM Status */}
                <div className="absolute top-4 right-4">
                  {checkingOwnership ? (
                    <div className="bg-gray-100 text-gray-600 px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span>Checking...</span>
                    </div>
                  ) : owned ? (
                    <div className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                      <Unlock className="h-4 w-4" />
                      <span>Owned</span>
                    </div>
                  ) : (
                    <div className="bg-brown/10 text-brown px-3 py-2 rounded-full text-sm font-medium flex items-center space-x-2">
                      <Lock className="h-4 w-4" />
                      <span>DRM Protected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {owned ? (
                  <button
                    onClick={handleReadOnline}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    <Play className="h-5 w-5" />
                    <span>Read Online</span>
                  </button>
                ) : (
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full btn-primary flex items-center justify-center space-x-2"
                  >
                    {purchasing ? (
                      <Loader className="h-5 w-5 animate-spin" />
                    ) : (
                      <ShoppingCart className="h-5 w-5" />
                    )}
                    <span>{purchasing ? 'Purchasing...' : 'Purchase Book'}</span>
                  </button>
                )}

                {/* DRM Info */}
                <div className="bg-brown/5 border border-brown/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-5 w-5 text-brown" />
                    <span className="font-medium text-dark-brown">DRM Protected</span>
                  </div>
                  <p className="text-sm text-dark-brown/70">
                    This book is protected by digital rights management. 
                    Purchase required for access. Online reading available after purchase.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Book Details */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              <h1 className="text-3xl font-bold text-dark-brown mb-4">
                {book.title}
              </h1>

              <div className="flex flex-wrap gap-4 mb-6">
                {book.author && (
                  <div className="flex items-center space-x-2 text-dark-brown/70">
                    <User className="h-5 w-5" />
                    <span className="font-medium">by {book.author}</span>
                  </div>
                )}

                {book.genre && (
                  <div className="flex items-center space-x-2 text-dark-brown/70">
                    <Tag className="h-5 w-5" />
                    <span>{book.genre}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-dark-brown/70">
                  <BookOpen className="h-5 w-5" />
                  <span>Digital Edition</span>
                </div>
              </div>

              {book.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-dark-brown mb-3">
                    Description
                  </h2>
                  <p className="text-dark-brown/80 leading-relaxed">
                    {book.description}
                  </p>
                </div>
              )}

              {/* Book Information */}
              <div className="border-t border-brown/10 pt-6">
                <h2 className="text-xl font-semibold text-dark-brown mb-4">
                  Book Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-dark-brown mb-2">Format</h3>
                    <p className="text-dark-brown/70">PDF (Online Reader)</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-dark-brown mb-2">Protection</h3>
                    <p className="text-dark-brown/70">DRM Protected</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-dark-brown mb-2">Availability</h3>
                    <p className="text-dark-brown/70">Instant Access</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-dark-brown mb-2">Access</h3>
                    <p className="text-dark-brown/70">Lifetime Access</p>
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 bg-dark-brown/5 border border-dark-brown/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-6 w-6 text-brown mt-0.5" />
                  <div>
                    <h3 className="font-medium text-dark-brown mb-1">
                      Secure Digital Rights Management
                    </h3>
                    <p className="text-sm text-dark-brown/70">
                      This ebook is protected by advanced DRM technology to ensure 
                      content security and prevent unauthorized distribution. 
                      Your purchase grants you personal, non-transferable online reading access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;