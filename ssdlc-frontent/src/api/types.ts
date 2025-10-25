// API Request/Response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    registeredDevice?: string;
    purchasedBooks: string[];
    createdAt: string;
  };
  token: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignupResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    purchasedBooks: string[];
    createdAt: string;
  };
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface GetBooksResponse {
  books: Array<{
    id: string;
    title: string;
    author: string;
    description: string;
    price: number;
    coverImage: string;
    genre: string;
    rating: number;
    publishedDate: string;
  }>;
  total: number;
  page: number;
  limit: number;
}

export interface GetBooksParams {
  page?: number;
  limit?: number;
  search?: string;
  genre?: string;
  sortBy?: 'title' | 'author' | 'price' | 'rating' | 'publishedDate';
  sortOrder?: 'asc' | 'desc';
}

export interface PurchaseBookRequest {
  bookId: string;
  paymentMethod: string;
}

export interface PurchaseBookResponse {
  success: boolean;
  purchaseId: string;
  downloadUrl?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface RegisterDeviceRequest {
  deviceId: string;
  deviceName: string;
}

export interface RegisterDeviceResponse {
  success: boolean;
  deviceId: string;
}