import React from 'react'

// Book related types
export interface Book {
  id: number
  title: string
  author: string
  description: string
  genre: string
}

export interface Purchase {
  purchase_id: number
  book_id: number
  book_title: string
  book_author: string
  book_genre: string
  purchase_price: number
  purchased_at: string
}

export interface OwnershipResponse {
  user_id: string
  book_id: number
  book_title: string
  owns_book: boolean
  purchase_date?: string
  purchase_id?: number
}

export interface PurchaseResponse {
  success: boolean
  message: string
  purchase_id?: number
  user_id?: string
  book_title?: string
  book_author?: string
  book_genre?: string
  purchase_price?: number
}

// User related types
export interface UserRole {
  id: string
  name: string
  description: string
}

export interface AdminUser {
  id: string
  email: string
  roles: UserRole[]
}

export interface SystemHealthData {
  status: string
  database: boolean
  api_version: string
  uptime: number
}

export interface User {
  sub: string
  name: string
  email: string
  email_verified: boolean
  picture: string
  updated_at: string
  roles: UserRole[]
}

// Authentication types
export interface AuthResponse {
  access_token: string
  refresh_token: string
  sub: string
  name: string
  email: string
  email_verified: boolean
  picture: string
  updated_at: string
  roles: UserRole[]
}

// UI State types
export interface BookFilters {
  author?: string
  genre?: string
  searchQuery?: string
}

export interface AppState {
  user: User | null
  isAuthenticated: boolean
  books: Book[]
  myBooks: Book[]
  purchases: Purchase[]
  filters: BookFilters
  loading: boolean
  error: string | null
}

// API types
export interface ApiError {
  status: number
  message: string
  details?: unknown
}

// DRM types
export interface BookContent {
  id: number
  title: string
  content: Blob
  contentType: string
}

export interface BookViewer {
  element: HTMLElement
  destroy: () => void
}

// Component prop types
export interface BookCardProps {
  book: Book
  isOwned?: boolean
  onPurchase?: (_bookId: number) => void
  onRead?: (_bookId: number) => void
  className?: string
}

export interface SearchBarProps {
  onSearch: (_query: string) => void
  placeholder?: string
  className?: string
}

export interface FilterPanelProps {
  authors: string[]
  genres: string[]
  onFilterChange: (_filters: BookFilters) => void
  activeFilters: BookFilters
}

export interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallback?: React.ReactNode
}
