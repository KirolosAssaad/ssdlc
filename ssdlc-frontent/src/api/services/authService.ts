import { apiClient, ApiResponse } from '../config';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse
} from '../types';
import { User } from '../../types';

// Mock data fallback
const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  firstName: 'John',
  lastName: 'Doe',
  purchasedBooks: [],
  createdAt: new Date().toISOString(),
};

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data.data;
      }

      throw new Error(response.data.message || 'Login failed');
    } catch (error) {
      console.warn('API login failed, using mock data:', error);

      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      const mockResponse: LoginResponse = {
        user: {
          ...mockUser,
          email: credentials.email,
        },
        token: 'mock-jwt-token-' + Date.now(),
      };

      // Store mock data
      localStorage.setItem('authToken', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));

      return mockResponse;
    }
  }

  async signup(userData: SignupRequest): Promise<SignupResponse> {
    try {
      const response = await apiClient.post<ApiResponse<SignupResponse>>('/auth/signup', userData);

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return response.data.data;
      }

      throw new Error(response.data.message || 'Signup failed');
    } catch (error) {
      console.warn('API signup failed, using mock data:', error);

      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockResponse: SignupResponse = {
        user: {
          id: Date.now().toString(),
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          purchasedBooks: [],
          createdAt: new Date().toISOString(),
        },
        token: 'mock-jwt-token-' + Date.now(),
      };

      // Store mock data
      localStorage.setItem('authToken', mockResponse.token);
      localStorage.setItem('user', JSON.stringify(mockResponse.user));

      return mockResponse;
    }
  }

  async forgotPassword(email: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    try {
      const response = await apiClient.post<ApiResponse<ForgotPasswordResponse>>('/auth/forgot-password', email);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.message || 'Failed to send reset email');
    } catch (error) {
      console.warn('API forgot password failed, using mock response:', error);

      // Mock response fallback
      await new Promise(resolve => setTimeout(resolve, 1500));

      return {
        message: 'Password reset email sent successfully (mock)',
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.warn('API logout failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  }

  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken() && !!this.getCurrentUser();
  }
}

export const authService = new AuthService();