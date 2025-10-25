import { apiClient, ApiResponse } from '../config';
import { 
  GetBooksResponse, 
  GetBooksParams, 
  PurchaseBookRequest, 
  PurchaseBookResponse 
} from '../types';
import { mockBooks } from '../../data/mockBooks';
import { Book } from '../../types';

class BookService {
  async getBooks(params: GetBooksParams = {}): Promise<GetBooksResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetBooksResponse>>('/books', { params });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to fetch books');
    } catch (error) {
      console.warn('API getBooks failed, using mock data:', error);
      
      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredBooks = [...mockBooks];
      
      // Apply search filter
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        filteredBooks = filteredBooks.filter(book => 
          book.title.toLowerCase().includes(searchTerm) ||
          book.author.toLowerCase().includes(searchTerm) ||
          book.description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply genre filter
      if (params.genre) {
        filteredBooks = filteredBooks.filter(book => book.genre === params.genre);
      }
      
      // Apply sorting
      if (params.sortBy) {
        filteredBooks.sort((a, b) => {
          const aValue = a[params.sortBy as keyof Book];
          const bValue = b[params.sortBy as keyof Book];
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return params.sortOrder === 'desc' 
              ? bValue.localeCompare(aValue)
              : aValue.localeCompare(bValue);
          }
          
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return params.sortOrder === 'desc' 
              ? bValue - aValue
              : aValue - bValue;
          }
          
          return 0;
        });
      }
      
      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 20;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedBooks = filteredBooks.slice(startIndex, endIndex);
      
      return {
        books: paginatedBooks,
        total: filteredBooks.length,
        page,
        limit,
      };
    }
  }

  async getBookById(bookId: string): Promise<Book | null> {
    try {
      const response = await apiClient.get<ApiResponse<Book>>(`/books/${bookId}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Book not found');
    } catch (error) {
      console.warn('API getBookById failed, using mock data:', error);
      
      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const book = mockBooks.find(b => b.id === bookId);
      return book || null;
    }
  }

  async purchaseBook(purchaseData: PurchaseBookRequest): Promise<PurchaseBookResponse> {
    try {
      const response = await apiClient.post<ApiResponse<PurchaseBookResponse>>('/books/purchase', purchaseData);
      
      if (response.data.success) {
        // Update user's purchased books in localStorage
        this.updateUserPurchasedBooks(purchaseData.bookId);
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Purchase failed');
    } catch (error) {
      console.warn('API purchaseBook failed, using mock response:', error);
      
      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update user's purchased books in localStorage
      this.updateUserPurchasedBooks(purchaseData.bookId);
      
      return {
        success: true,
        purchaseId: 'mock-purchase-' + Date.now(),
        downloadUrl: `/downloads/${purchaseData.bookId}`,
      };
    }
  }

  async getDownloadUrl(bookId: string): Promise<string> {
    try {
      const response = await apiClient.get<ApiResponse<{ downloadUrl: string }>>(`/books/${bookId}/download`);
      
      if (response.data.success) {
        return response.data.data.downloadUrl;
      }
      
      throw new Error(response.data.message || 'Failed to get download URL');
    } catch (error) {
      console.warn('API getDownloadUrl failed, using mock URL:', error);
      
      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return `/downloads/${bookId}`;
    }
  }

  private updateUserPurchasedBooks(bookId: string): void {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (!user.purchasedBooks.includes(bookId)) {
          user.purchasedBooks.push(bookId);
          localStorage.setItem('user', JSON.stringify(user));
        }
      }
    } catch (error) {
      console.error('Error updating user purchased books:', error);
    }
  }

  async getUserPurchasedBooks(): Promise<Book[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ books: Book[] }>>('/user/purchased-books');
      
      if (response.data.success) {
        return response.data.data.books;
      }
      
      throw new Error(response.data.message || 'Failed to fetch purchased books');
    } catch (error) {
      console.warn('API getUserPurchasedBooks failed, using mock data:', error);
      
      // Mock response fallback
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const purchasedBooks = mockBooks.filter(book => 
          user.purchasedBooks.includes(book.id)
        );
        return purchasedBooks;
      }
      
      return [];
    }
  }
}

export const bookService = new BookService();