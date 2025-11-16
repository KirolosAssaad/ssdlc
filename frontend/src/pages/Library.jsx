import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import BookGrid from '../components/Books/BookGrid';
import { 
  BookOpen, 
  Download, 
  Calendar,
  TrendingUp,
  Clock,
  Shield
} from 'lucide-react';

const Library = () => {
  const { isAuthenticated, user } = useAuth();
  const [ownedBooks, setOwnedBooks] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');

  useEffect(() => {
    if (isAuthenticated) {
      loadLibraryData();
    }
  }, [isAuthenticated]);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      const [booksResponse, purchasesResponse] = await Promise.all([
        booksAPI.getMyBooks(),
        booksAPI.getMyPurchases()
      ]);
      
      setOwnedBooks(booksResponse.data);
      setPurchases(purchasesResponse.data);
    } catch (error) {
      console.error('Failed to load library data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLibraryStats = () => {
    const totalBooks = ownedBooks.length;
    const totalSpent = purchases.reduce((sum, purchase) => sum + (purchase.purchase_price || 0), 0);
    const recentPurchases = purchases.filter(purchase => {
      const purchaseDate = new Date(purchase.purchased_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return purchaseDate >= thirtyDaysAgo;
    }).length;

    return { totalBooks, totalSpent, recentPurchases };
  };

  const { totalBooks, totalSpent, recentPurchases } = getLibraryStats();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream/30 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-brown/40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-brown mb-2">
            Sign In Required
          </h2>
          <p className="text-dark-brown/70">
            Please sign in to access your personal library
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={user?.picture || '/api/placeholder/48/48'}
              alt={user?.name || 'User'}
              className="h-12 w-12 rounded-full border-2 border-brown/20"
            />
            <div>
              <h1 className="text-3xl font-bold text-dark-brown">
                {user?.name}'s Library
              </h1>
              <p className="text-dark-brown/70">
                Your secure digital book collection
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-brown/10 rounded-full p-3">
                <BookOpen className="h-6 w-6 text-brown" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-brown">{totalBooks}</p>
                <p className="text-dark-brown/70">Books Owned</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-brown/10 rounded-full p-3">
                <TrendingUp className="h-6 w-6 text-brown" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-brown">${totalSpent.toFixed(2)}</p>
                <p className="text-dark-brown/70">Total Spent</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-brown/10 rounded-full p-3">
                <Clock className="h-6 w-6 text-brown" />
              </div>
              <div>
                <p className="text-2xl font-bold text-dark-brown">{recentPurchases}</p>
                <p className="text-dark-brown/70">Recent Purchases</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-8">
          <div className="border-b border-brown/10">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('books')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'books'
                    ? 'border-brown text-brown'
                    : 'border-transparent text-dark-brown/70 hover:text-dark-brown hover:border-brown/30'
                }`}
              >
                <BookOpen className="h-4 w-4 inline mr-2" />
                My Books ({totalBooks})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-brown text-brown'
                    : 'border-transparent text-dark-brown/70 hover:text-dark-brown hover:border-brown/30'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Purchase History ({purchases.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'books' && (
              <div>
                {ownedBooks.length > 0 ? (
                  <>
                    <div className="flex items-center space-x-2 mb-6">
                      <Shield className="h-5 w-5 text-brown" />
                      <span className="text-sm text-dark-brown/70">
                        All books are DRM protected and available for immediate download
                      </span>
                    </div>
                    <BookGrid 
                      books={ownedBooks}
                      loading={loading}
                      ownedBooks={ownedBooks}
                      showPurchaseDate={true}
                      emptyMessage="No books in your library"
                      emptySubMessage="Browse our catalog to purchase your first book"
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 text-brown/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-dark-brown mb-2">
                      Your library is empty
                    </h3>
                    <p className="text-dark-brown/70 mb-6">
                      Start building your digital collection by purchasing books from our catalog
                    </p>
                    <a href="/catalog" className="btn-primary">
                      Browse Catalog
                    </a>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                {purchases.length > 0 ? (
                  <div className="space-y-4">
                    {purchases.map((purchase) => (
                      <div key={purchase.purchase_id} className="border border-brown/10 rounded-lg p-4 hover:bg-cream/20 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-dark-brown mb-1">
                              {purchase.book_title}
                            </h3>
                            <p className="text-sm text-dark-brown/70 mb-2">
                              by {purchase.book_author || 'Unknown Author'}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-dark-brown/60">
                              <span>
                                <Calendar className="h-4 w-4 inline mr-1" />
                                {new Date(purchase.purchased_at).toLocaleDateString()}
                              </span>
                              <span>
                                Purchase ID: {purchase.purchase_id}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-semibold text-brown">
                              ${purchase.purchase_price?.toFixed(2) || 'N/A'}
                            </p>
                            <p className="text-sm text-dark-brown/70">
                              {purchase.book_genre}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-brown/40 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-dark-brown mb-2">
                      No purchase history
                    </h3>
                    <p className="text-dark-brown/70">
                      Your purchase history will appear here once you buy your first book
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Library;