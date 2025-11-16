import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { booksAPI } from '../../services/api';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  Download,
  Trash2
} from 'lucide-react';

// PDF.js setup
const pdfjsLib = window.pdfjsLib;
if (pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Offline storage manager
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

  async decryptBook(encryptedBook) {
    const key = await this.getEncryptionKey();
    const iv = new Uint8Array(encryptedBook.iv);
    const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, encryptedBook.data);
    return decryptedData;
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

  async loadBook(bookId) {
    await this.init();
    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    return new Promise((resolve, reject) => {
      const request = store.get(bookId);
      request.onsuccess = async () => {
        if (!request.result) {
          reject(new Error('Book not found offline'));
          return;
        }
        try {
          const decrypted = await this.decryptBook(request.result.encrypted);
          resolve(decrypted);
        } catch (error) {
          reject(new Error('Failed to decrypt book'));
        }
      };
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

const BookReader = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const canvasRef = useRef(null);
  
  // State management
  const [book, setBook] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageRendering, setPageRendering] = useState(false);
  const [isOfflineReading, setIsOfflineReading] = useState(false);
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const offlineManager = new OfflineBookManager();
  const scale = 1.5;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (bookId) {
      loadBook();
      checkOfflineAvailability();
    }
  }, [bookId, isAuthenticated, navigate]);

  const checkOfflineAvailability = async () => {
    try {
      const isAvailable = await offlineManager.isBookOffline(parseInt(bookId));
      setIsOfflineAvailable(isAvailable);
    } catch (error) {
      console.error('Error checking offline availability:', error);
    }
  };

  const loadBook = async (forceOnline = false) => {
    try {
      setLoading(true);
      setError(null);
      
      let pdfData;
      let bookData;
      let isOffline = false;

      // Try offline first if not forcing online
      if (!forceOnline) {
        try {
          const isAvailable = await offlineManager.isBookOffline(parseInt(bookId));
          if (isAvailable) {
            pdfData = await offlineManager.loadBook(parseInt(bookId));
            isOffline = true;
          }
        } catch (offlineError) {
          console.log('Offline load failed, fetching from server');
        }
      }

      // Fetch from server if not available offline
      if (!pdfData) {
        const [bookResponse, pdfResponse] = await Promise.all([
          booksAPI.getBook(bookId),
          booksAPI.readBook(bookId)
        ]);
        
        bookData = bookResponse.data;
        const blob = await pdfResponse.data;
        pdfData = await blob.arrayBuffer();
      } else {
        // Get book metadata for offline reading
        const bookResponse = await booksAPI.getBook(bookId);
        bookData = bookResponse.data;
      }

      setBook(bookData);
      setIsOfflineReading(isOffline);

      // Load PDF
      if (!pdfjsLib) {
        throw new Error('PDF.js not loaded');
      }

      const loadingTask = pdfjsLib.getDocument({ data: pdfData });
      const pdf = await loadingTask.promise;
      
      setPdfDoc(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      
      // Render first page
      await renderPage(1, pdf);
      
    } catch (error) {
      console.error('Error loading book:', error);
      setError(error.message || 'Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const renderPage = async (pageNum, pdf = pdfDoc) => {
    if (!pdf || pageRendering) return;
    
    try {
      setPageRendering(true);
      const page = await pdf.getPage(pageNum);
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };
      
      await page.render(renderContext).promise;
    } catch (error) {
      console.error('Error rendering page:', error);
    } finally {
      setPageRendering(false);
    }
  };

  const goToPage = async (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) return;
    
    setCurrentPage(pageNum);
    await renderPage(pageNum);
  };

  const makeOffline = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(30);
      
      const response = await booksAPI.readBook(bookId);
      setDownloadProgress(60);
      
      const blob = await response.data;
      const arrayBuffer = await blob.arrayBuffer();
      setDownloadProgress(90);
      
      await offlineManager.saveBook(parseInt(bookId), book.title, arrayBuffer);
      setDownloadProgress(100);
      
      setTimeout(() => {
        setIsOfflineAvailable(true);
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error making book offline:', error);
      setError('Failed to save book for offline reading');
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const removeOffline = async () => {
    if (!window.confirm('Remove this book from offline storage?')) return;
    
    try {
      await offlineManager.removeBook(parseInt(bookId));
      setIsOfflineAvailable(false);
      if (isOfflineReading) {
        // Reload from server
        await loadBook(true);
      }
    } catch (error) {
      console.error('Error removing offline book:', error);
      setError('Failed to remove offline book');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-center text-white max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Book</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-x-4">
            <button 
              onClick={() => loadBook()} 
              className="bg-brown hover:bg-brown/90 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
            <button 
              onClick={() => navigate('/library')} 
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              Back to Library
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/library')}
              className="text-white hover:text-brown transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-white font-semibold text-lg">
                {book?.title || 'Loading...'}
              </h1>
              <p className="text-white/70 text-sm">
                {book?.author || 'Unknown Author'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Offline status */}
            {isOfflineReading && (
              <div className="flex items-center space-x-2 bg-green-600/20 text-green-400 px-3 py-1 rounded-full text-sm">
                <WifiOff className="h-4 w-4" />
                <span>Reading Offline</span>
              </div>
            )}
            
            {/* Offline controls */}
            {!isOfflineAvailable && !isDownloading && (
              <button
                onClick={makeOffline}
                className="flex items-center space-x-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 px-3 py-1 rounded-full text-sm transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Make Offline</span>
              </button>
            )}
            
            {isDownloading && (
              <div className="flex items-center space-x-2 text-blue-400 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving... {downloadProgress}%</span>
              </div>
            )}
            
            {isOfflineAvailable && !isDownloading && (
              <button
                onClick={removeOffline}
                className="flex items-center space-x-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 px-3 py-1 rounded-full text-sm transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Remove Offline</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full">
          <canvas
            ref={canvasRef}
            className="w-full h-auto"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white/10 backdrop-blur-sm border-t border-white/20 p-4">
        <div className="flex items-center justify-center space-x-6">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1 || pageRendering}
            className="flex items-center space-x-2 bg-brown hover:bg-brown/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>
          
          <div className="text-white font-medium">
            Page {currentPage} of {totalPages}
          </div>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages || pageRendering}
            className="flex items-center space-x-2 bg-brown hover:bg-brown/90 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookReader;