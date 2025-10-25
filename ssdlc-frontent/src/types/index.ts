export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  price: number;
  coverImage: string;
  genre: string;
  rating: number;
  publishedDate: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  registeredDevice?: string;
  purchasedBooks: string[];
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}