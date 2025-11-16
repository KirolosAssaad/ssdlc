import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  User, 
  LogOut, 
  Search, 
  ShoppingBag, 
  Menu, 
  X,
  Shield
} from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-lg border-b-2 border-brown/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-brown" />
            <span className="text-2xl font-bold text-dark-brown">BookVault</span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search books, authors..."
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
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/catalog"
              className="text-dark-brown hover:text-brown transition-colors font-medium"
            >
              Catalog
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/library"
                  className="text-dark-brown hover:text-brown transition-colors font-medium"
                >
                  Library
                </Link>
                
                <Link
                  to="/my-books"
                  className="flex items-center space-x-1 text-dark-brown hover:text-brown transition-colors font-medium"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>My Books</span>
                </Link>
                
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-1 text-dark-brown hover:text-brown transition-colors font-medium"
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    <img
                      src={user?.picture || '/api/placeholder/32/32'}
                      alt={user?.name || 'User'}
                      className="h-8 w-8 rounded-full border-2 border-brown/20"
                    />
                    <span className="text-sm font-medium text-dark-brown">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-dark-brown hover:text-brown transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="btn-primary"
              >
                Sign In
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-dark-brown hover:text-brown"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search books, authors..."
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
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-brown/10">
          <div className="px-4 py-4 space-y-4">
            <Link
              to="/catalog"
              className="block text-dark-brown hover:text-brown transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Catalog
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link
                  to="/library"
                  className="block text-dark-brown hover:text-brown transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Library
                </Link>
                
                <Link
                  to="/my-books"
                  className="flex items-center space-x-2 text-dark-brown hover:text-brown transition-colors font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>My Books</span>
                </Link>
                
                {isAdmin() && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 text-dark-brown hover:text-brown transition-colors font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Shield className="h-4 w-4" />
                    <span>Admin</span>
                  </Link>
                )}
                
                <div className="flex items-center space-x-3 pt-2 border-t border-brown/10">
                  <img
                    src={user?.picture || '/api/placeholder/32/32'}
                    alt={user?.name || 'User'}
                    className="h-8 w-8 rounded-full border-2 border-brown/20"
                  />
                  <span className="text-sm font-medium text-dark-brown">
                    {user?.name || 'User'}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-dark-brown hover:text-brown transition-colors w-full text-left"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block btn-primary text-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;