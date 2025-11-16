import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable credentials for CORS
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  async (error) => {
    console.log('API Error:', error);
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await refreshAccessToken();
          console.log('Token refresh response:', response);
          localStorage.setItem('access_token', response.access_token);
          if (response.refresh_token) {
            localStorage.setItem('refresh_token', response.refresh_token);
          }

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.log('Token refresh failed:', refreshError);
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Initiate OAuth2 flow
  initiateAuth: () => api.get('/auth/sso'),

  // Handle OAuth2 callback
  handleCallback: (code) => api.get(`/auth/callback?code=${code}`),

  // Get current user info
  getCurrentUser: () => api.get('/auth/user'),

  // Refresh access token
  refreshToken: () => api.get('/auth/refresh-token'),

  // Get user roles
  getUserRoles: (userId) => api.get(`/auth/roles/${userId}`),

  // Set user role (admin only)
  setUserRole: (userId, role) => api.get(`/auth/set-role/${userId}?role=${role}`),
};

// Books API calls
export const booksAPI = {
  // Get all books (public)
  getAllBooks: () => api.get('/books/'),

  // Get specific book (public)
  getBook: (bookId) => api.get(`/books/${bookId}`),

  // Get user's owned books
  getMyBooks: () => api.get('/books/my-books'),

  // Get user's purchase history
  getMyPurchases: () => api.get('/books/my-purchases'),

  // Purchase a book
  purchaseBook: (bookId) => api.post(`/books/purchase/${bookId}`),

  // Read a book (DRM protected)
  readBook: (bookId) => api.get(`/books/read/${bookId}`, {
    responseType: 'blob', // For file download
  }),

  // Check book ownership
  checkOwnership: (bookId) => api.get(`/books/check-ownership/${bookId}`),

  // Search books
  searchBooks: (query) => api.get(`/books/search?query=${encodeURIComponent(query)}`),

  // Filter by author
  filterByAuthor: (author) => api.get(`/books/filter/author/${encodeURIComponent(author)}`),

  // Filter by genre
  filterByGenre: (genre) => api.get(`/books/filter/genre/${encodeURIComponent(genre)}`),

  // Get all genres
  getGenres: () => api.get('/books/genre'),

  // Get all authors
  getAuthors: () => api.get('/books/author'),
};

// System API calls
export const systemAPI = {
  // Health check
  getHealth: () => axios.get(`${API_BASE_URL}/health`, {
    withCredentials: true
  }), // No auth required
};

// Helper function for token refresh
const refreshAccessToken = async () => {
  const token = localStorage.getItem('access_token');
  const response = await axios.get(`${API_BASE_URL}/auth/refresh-token`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    withCredentials: true,
  });
  return response.data;
};



export default api;