/**
 * Demo file to showcase API Service functionality
 * This file demonstrates how to use the API service in the application
 */

import apiService from './api'
import type { Book, BookFilters } from '@/types'

/**
 * Example usage of the API service for book operations
 */
export class ApiServiceDemo {
  /**
   * Demonstrate fetching all books
   */
  static async demonstrateGetBooks(): Promise<Book[]> {
    try {
      console.log('Fetching all books...')
      const books = await apiService.getBooks()
      console.log(`Retrieved ${books.length} books`)
      return books
    } catch (error) {
      console.error('Failed to fetch books:', error)
      throw error
    }
  }

  /**
   * Demonstrate searching for books
   */
  static async demonstrateSearchBooks(query: string): Promise<Book[]> {
    try {
      console.log(`Searching for books with query: "${query}"`)
      const books = await apiService.searchBooks(query)
      console.log(`Found ${books.length} books matching "${query}"`)
      return books
    } catch (error) {
      console.error('Failed to search books:', error)
      throw error
    }
  }

  /**
   * Demonstrate filtering books
   */
  static async demonstrateFilterBooks(filters: BookFilters): Promise<Book[]> {
    try {
      console.log('Filtering books with filters:', filters)
      const books = await apiService.filterBooks(filters)
      console.log(`Found ${books.length} books matching filters`)
      return books
    } catch (error) {
      console.error('Failed to filter books:', error)
      throw error
    }
  }

  /**
   * Demonstrate user library operations
   */
  static async demonstrateUserLibrary(): Promise<{
    myBooks: Book[]
    purchases: unknown[]
  }> {
    try {
      console.log('Fetching user library...')
      const [myBooks, purchases] = await Promise.all([
        apiService.getMyBooks(),
        apiService.getMyPurchases(),
      ])
      console.log(`User owns ${myBooks.length} books`)
      console.log(`User has ${purchases.length} purchases`)
      return { myBooks, purchases }
    } catch (error) {
      console.error('Failed to fetch user library:', error)
      throw error
    }
  }

  /**
   * Demonstrate book purchase flow
   */
  static async demonstratePurchaseFlow(bookId: number): Promise<boolean> {
    try {
      console.log(`Starting purchase flow for book ${bookId}`)

      // First check if user already owns the book
      const ownership = await apiService.checkOwnership(bookId)
      if (ownership.owns_book) {
        console.log('User already owns this book')
        return true
      }

      // Attempt to purchase the book
      const purchaseResult = await apiService.purchaseBook(bookId)
      if (purchaseResult.success) {
        console.log('Purchase successful:', purchaseResult.message)
        return true
      } else {
        console.log('Purchase failed:', purchaseResult.message)
        return false
      }
    } catch (error) {
      console.error('Purchase flow failed:', error)
      throw error
    }
  }

  /**
   * Demonstrate admin operations (requires admin role)
   */
  static async demonstrateAdminOperations(userId: string): Promise<void> {
    try {
      console.log('Demonstrating admin operations...')

      // Get user roles
      const roles = await apiService.getUserRoles(userId)
      console.log(`User ${userId} has roles:`, roles)

      // Get system health
      const health = await apiService.getSystemHealth()
      console.log('System health:', health)

      // Get all users
      const users = await apiService.getUsers()
      console.log(`System has ${users.length} users`)
    } catch (error) {
      console.error('Admin operations failed:', error)
      throw error
    }
  }

  /**
   * Demonstrate error handling
   */
  static async demonstrateErrorHandling(): Promise<void> {
    try {
      console.log('Demonstrating error handling...')

      // Try to get a non-existent book
      await apiService.getBook(99999)
    } catch (error) {
      console.log('Caught expected error:', error)
    }

    try {
      // Try to purchase without authentication (if not authenticated)
      if (!apiService.isAuthenticated()) {
        await apiService.purchaseBook(1)
      }
    } catch (error) {
      console.log('Caught authentication error:', error)
    }
  }

  /**
   * Test API connectivity
   */
  static async testConnectivity(): Promise<boolean> {
    try {
      console.log('Testing API connectivity...')
      const isConnected = await apiService.testConnection()
      console.log(
        `API connection status: ${isConnected ? 'Connected' : 'Disconnected'}`
      )
      return isConnected
    } catch (error) {
      console.error('Connectivity test failed:', error)
      return false
    }
  }

  /**
   * Run all demonstrations
   */
  static async runAllDemonstrations(): Promise<void> {
    console.log('=== API Service Demonstration ===')

    // Test connectivity first
    const isConnected = await this.testConnectivity()
    if (!isConnected) {
      console.log('API is not available, skipping other demonstrations')
      return
    }

    try {
      // Test public endpoints (no auth required)
      await this.demonstrateGetBooks()
      await this.demonstrateSearchBooks('test')
      await this.demonstrateFilterBooks({ genre: 'Fiction' })

      // Test authenticated endpoints (if authenticated)
      if (apiService.isAuthenticated()) {
        await this.demonstrateUserLibrary()
        await this.demonstratePurchaseFlow(1)
      } else {
        console.log('User not authenticated, skipping authenticated operations')
      }

      // Test error handling
      await this.demonstrateErrorHandling()

      console.log('=== All demonstrations completed ===')
    } catch (error) {
      console.error('Demonstration failed:', error)
    }
  }
}

// Export for use in components
export default ApiServiceDemo
