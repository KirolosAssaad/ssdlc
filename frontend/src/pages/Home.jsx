import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import BookGrid from '../components/Books/BookGrid';
import CorsTest from '../components/CorsTest';
import { 
  BookOpen, 
  Shield, 
  Download, 
  Lock, 
  Star, 
  TrendingUp,
  Users,
  ArrowRight
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownedBooks, setOwnedBooks] = useState([]);

  useEffect(() => {
    loadFeaturedBooks();
    if (isAuthenticated) {
      loadOwnedBooks();
    }
  }, [isAuthenticated]);

  const loadFeaturedBooks = async () => {
    try {
      const response = await booksAPI.getAllBooks();
      // Show first 4 books as featured
      setFeaturedBooks(response.data.slice(0, 4));
    } catch (error) {
      console.error('Failed to load featured books:', error);
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

  const features = [
    {
      icon: Shield,
      title: 'DRM Protected',
      description: 'Advanced digital rights management ensures your purchases are secure and protected.'
    },
    {
      icon: Download,
      title: 'Instant Access',
      description: 'Download your books immediately after purchase and read them anywhere, anytime.'
    },
    {
      icon: Lock,
      title: 'Secure Library',
      description: 'Your personal library is encrypted and accessible only to you with proper authentication.'
    },
    {
      icon: Users,
      title: 'Trusted Platform',
      description: 'Join thousands of readers who trust BookVault for their digital reading needs.'
    }
  ];

  const stats = [
    { icon: BookOpen, value: '10,000+', label: 'Books Available' },
    { icon: Users, value: '50,000+', label: 'Happy Readers' },
    { icon: Download, value: '1M+', label: 'Downloads' },
    { icon: Star, value: '4.9/5', label: 'User Rating' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-cream via-cream to-brown/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-dark-brown mb-6">
              Your Secure Digital
              <span className="text-brown block">Book Library</span>
            </h1>
            <p className="text-xl text-dark-brown/80 mb-8 max-w-3xl mx-auto">
              Discover thousands of ebooks with advanced DRM protection. 
              Purchase once, read forever with complete security and peace of mind.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link to="/catalog" className="btn-primary text-lg px-8 py-4">
                    Browse Catalog
                  </Link>
                  <Link to="/my-books" className="btn-secondary text-lg px-8 py-4">
                    My Books
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-primary text-lg px-8 py-4">
                    Get Started
                  </Link>
                  <Link to="/catalog" className="btn-secondary text-lg px-8 py-4">
                    Browse Books
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="h-8 w-8 text-brown mx-auto mb-3" />
                <div className="text-3xl font-bold text-dark-brown mb-1">
                  {stat.value}
                </div>
                <div className="text-dark-brown/70">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books */}
      <section className="py-16 bg-cream/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-brown mb-4">
              Featured Books
            </h2>
            <p className="text-dark-brown/70 max-w-2xl mx-auto">
              Discover our handpicked selection of popular and trending ebooks
            </p>
          </div>

          <BookGrid 
            books={featuredBooks}
            loading={loading}
            ownedBooks={ownedBooks}
            emptyMessage="No featured books available"
            emptySubMessage="Check back soon for new featured content"
          />

          <div className="text-center mt-12">
            <Link 
              to="/catalog" 
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>View All Books</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-dark-brown mb-4">
              Why Choose BookVault?
            </h2>
            <p className="text-dark-brown/70 max-w-2xl mx-auto">
              Experience the future of digital reading with our secure, user-friendly platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="bg-brown/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-brown" />
                </div>
                <h3 className="text-lg font-semibold text-dark-brown mb-3">
                  {feature.title}
                </h3>
                <p className="text-dark-brown/70">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORS Test Section (Development Only) */}
      <section className="py-16 bg-cream/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-dark-brown mb-4">
              API Connection Test
            </h2>
            <p className="text-dark-brown/70">
              Test the CORS configuration and API connectivity
            </p>
          </div>
          <CorsTest />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-dark-brown text-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Reading?
          </h2>
          <p className="text-cream/80 mb-8 max-w-2xl mx-auto">
            Join thousands of readers who trust BookVault for their digital library. 
            Secure, convenient, and always available.
          </p>
          
          {!isAuthenticated && (
            <Link to="/login" className="btn-primary bg-brown hover:bg-brown/90">
              Sign Up Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;