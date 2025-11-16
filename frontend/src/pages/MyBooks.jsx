import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { booksAPI } from '../services/api';
import { 
  BookOpen, 
  Calendar,
  Shield,
  Wifi,
  WifiOff,
  Download,
  Trash2,
  Play,
  Loader2
} from 'lucide-react';

// Offline storage manager (same as in BookReader)
class OfflineBookManager {
  constructor() {
    this.dbName = 'KAHF_Offline_Books';
    this.dbVersion = 1;
    this.storeName = 'encrypted_books';
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'bookId' });
        }
      };
    });
  }

  async getEncryptionKey() {
    const fingerprint = `${navigator.userAgent}-${navigator.platform}-${navigator.language}-KAHF-SECRET-2025`;
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return await crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }

  async encryptBook(arrayBuffer) {
    const key = await this.getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, arrayBuffer);
    return { iv: Array.from(iv), data: encryptedData };
  }

  async saveBook(bookId, bookTitle, arrayBuffer) {
    await this.init();
    const encrypted = await this.encryptBook(arrayBuffer);
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const bookData = {
      bookId: bookId,
      title: bookTitle,
      encrypted: encrypted,
      savedAt: new Date().toISOString()
    };
    return new Promise((resolve, reject) => {
      const request = store.put(bookData);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async isBookOffline(bookId) {
    await this.init();
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(bookId);
      request.onsuccess = () => resolve(!!request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removeBook(bookId) {
    await this.init();
    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    return new Promise((resolve, reject) => {
      const request = store.delete(bookId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

const MyBooks = () => {
  const { isAuthenticated, user } = useAuth();
  const [ownedBooks, setOwnedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offlineStatus, setOfflineStatus] = useState({});
  const [downloadProgress, setDownloadProgress] = useState({});
  
  const offlineManager = new OfflineBookManager();

  useEffect(() => {
    if (isAuthenticated) {
      loadMyBooks();
    }
  }, [isAuthenticated]);

  const loadMyBooks = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getMyBooks();
      const books = response.data;
      setOwnedBooks(books);
      
      // Check offline status for each book
      const statusPromises = books.map(async (book) => {
        const isOffline = await offlineManager.isBookOffline(book.id);
        return { [book.id]: isOffline };
      });
      
      const statuses = await Promise.all(statusPromises);
      const statusMap = statuses.reduce((acc, status) => ({ ...acc, ...status }), {});
      setOfflineStatus(statusMap);
      
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  const makeBookOffline = async (bookId, bookTitle) => {
    try {
      setDownloadProgress({ ...downloadProgress, [bookId]: 30 });
      
      const response = await booksAPI.readBook(bookId);
      setDownloadProgress({ ...downloadProgress, [bookId]: 60 });
      
      const blob = await response.data;
      const arrayBuffer = await blob.arrayBuffer();
      setDownloadProgress({ ...downloadProgress, [bookId]: 90 });
      
      await offlineManager.saveBook(bookId, bookTitle, arrayBuffer);
      setDownloadProgress({ ...downloadProgress, [bookId]: 100 });
      
      setTimeout(() => {
        setOfflineStatus({ ...offlineStatus, [bookId]: true });
        setDownloadProgress({ ...downloadProgress, [bookId]: 0 });
      }, 1000);
      
    } catch (error) {
      console.error('Error making book offline:', error);
      setDownloadProgress({ ...downloadProgress, [bookId]: 0 });
      alert('Failed to save book for offline reading');
    }
  };

  const removeBookOffline = async (bookId) => {
    if (!window.confirm('Remove this book from offline storage?')) return;
    
    try {
      await offlineManager.removeBook(bookId);
      setOfflineStatus({ ...offlineStatus, [bookId]: false });
    } catch (error) {
      console.error('Error removing offline book:', error);
      alert('Failed to remove offline book');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-cream/30 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-16 w-16 text-brown/40 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark-brown mb-2">
            Sign In Required
          </h2>
          <p className="text-dark-brown/70">
            Please sign in to access your books
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brown mx-auto mb-4" />
          <p className="text-dark-brown">Loading your books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-dark-brown mb-1">KAHF</h1>
          <p className="text-xl font-light text-brown" style={{ letterSpacing: '0.15em' }}>
            EBOOK STORE
          </p>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center text-dark-brown mb-6">My Books</h2>

          {ownedBooks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-dark-brown mb-4">📚 You don't have any books yet</p>
              <p className="text-brown">Purchase books from the store to read them here</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Shield className="h-5 w-5 text-brown" />
                <span className="text-sm text-dark-brown/70">
                  All books are DRM protected and available for online reading
                </span>
              </div>

              {ownedBooks.map((book) => (
                <div key={book.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white/50 border border-dark-brown/20 rounded-lg shadow-sm">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-bold text-dark-brown">
                      {book.title}
                      {offlineStatus[book.id] && (
                        <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full ml-2">
                          Offline
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-brown">{book.author || 'Unknown Author'}</p>
                    
                    {downloadProgress[book.id] > 0 && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-brown h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${downloadProgress[book.id]}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-brown mt-1">
                          {downloadProgress[book.id] < 100 ? 'Downloading...' : 'Saved offline!'}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 shrink-0">
                    <a
                      href={`/read/${book.id}`}
                      className="py-2 px-4 bg-brown text-white font-semibold rounded-lg shadow-md hover:bg-brown/90 focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 transition-all duration-300 flex items-center space-x-2"
                    >
                      <Play className="h-4 w-4" />
                      <span>Read Online</span>
                    </a>

                    {!offlineStatus[book.id] && downloadProgress[book.id] === 0 && (
                      <button
                        onClick={() => makeBookOffline(book.id, book.title)}
                        className="py-2 px-4 bg-white text-brown border border-brown font-semibold rounded-lg shadow-sm hover:bg-cream focus:outline-none focus:ring-2 focus:ring-brown focus:ring-offset-2 transition-all duration-300 flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Make Offline</span>
                      </button>
                    )}

                    {offlineStatus[book.id] && (
                      <button
                        onClick={() => removeBookOffline(book.id)}
                        className="py-2 px-4 bg-red-100 text-red-700 border border-red-300 font-semibold rounded-lg shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-300 flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <p className="text-center text-dark-brown/60 text-xs mt-6">
          © 2025 KAHF EBOOK STORE. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default MyBooks;