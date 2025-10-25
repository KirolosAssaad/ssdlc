import { AxiosError } from 'axios';
import { ApiError } from '../api/config';

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export const handleApiError = (error: unknown): ErrorResponse => {
  if (error instanceof AxiosError) {
    const apiError = error.response?.data as ApiError;
    
    if (apiError && !apiError.success) {
      return {
        message: apiError.message,
        errors: apiError.errors,
      };
    }
    
    // Handle HTTP status codes
    switch (error.response?.status) {
      case 400:
        return { message: 'Invalid request. Please check your input.' };
      case 401:
        return { message: 'Authentication required. Please log in.' };
      case 403:
        return { message: 'Access denied. You do not have permission.' };
      case 404:
        return { message: 'Resource not found.' };
      case 409:
        return { message: 'Conflict. Resource already exists.' };
      case 422:
        return { message: 'Validation failed. Please check your input.' };
      case 429:
        return { message: 'Too many requests. Please try again later.' };
      case 500:
        return { message: 'Server error. Please try again later.' };
      case 503:
        return { message: 'Service unavailable. Please try again later.' };
      default:
        return { message: 'Network error. Please check your connection.' };
    }
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  return { message: 'An unexpected error occurred.' };
};

export const getErrorMessage = (error: unknown): string => {
  const errorResponse = handleApiError(error);
  return errorResponse.message;
};

export const getValidationErrors = (error: unknown): Record<string, string[]> | undefined => {
  const errorResponse = handleApiError(error);
  return errorResponse.errors;
};