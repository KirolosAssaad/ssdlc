/**
 * Enhanced hooks that integrate React Query with Zustand stores
 * These hooks provide seamless state management between server and client state
 */

import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useBooksActions, usePurchasesActions, useUIActions } from '@/store'
import { useBooks as useApiBooks, useMyBooks as useApiMyBooks, queryKeys } from './useApiService'
import apiService from '@/services/api'
import type { BookFilters, Purchase, OwnershipResponse } from '@/types'

/**
 * Enhanced hook for managing books with integrated state
 */
export const useIntegratedBooks = () => {
  const { setBooks, setBooksLoading, setBooksError } = useBooksActions()
  const { addNotification } = useUIActions()
  
  const query = useApiBooks()
  
  // Sync React Query state with Zustand store
  useEffect(() => {
    setBooksLoading(query.isLoading)
    setBooksError(query.error?.message || null)
    
    if (query.data) {
      setBooks(query.data)
    }
    
    if (query.error) {
      addNotification({
        type: 'error',
        title: 'Failed to load books',
        message: query.error.message,
        duration: 5000,
      })
    }
  }, [query.data, query.isLoading, query.error, setBooks, setBooksLoading, setBooksError, addNotification])
  
  return {
    ...query,
    refetch: query.refetch,
  }
}

/**
 * Enhanced hook for managing user's books with integrated state
 */
export const useIntegratedMyBooks = () => {
  const { setMyBooks, setMyBooksLoading, setMyBooksError } = useBooksActions()
  const { setPurchases, setPurchasesLoading, setPurchasesError, setOwnedBooks } = usePurchasesActions()
  const { addNotification } = useUIActions()
  
  const booksQuery = useApiMyBooks()
  
  // Also fetch purchases to keep ownership state in sync
  const purchasesQuery = useQuery({
    queryKey: queryKeys.myPurchases,
    queryFn: () => apiService.getMyPurchases(),
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
  
  // Sync React Query state with Zustand stores
  useEffect(() => {
    setMyBooksLoading(booksQuery.isLoading || purchasesQuery.isLoading)
    setMyBooksError(booksQuery.error?.message || null)
    setPurchasesError(purchasesQuery.error?.message || null)
    
    if (booksQuery.data) {
      setMyBooks(booksQuery.data)
      const ownedBookIds = booksQuery.data.map(book => book.id)
      setOwnedBooks(ownedBookIds)
    }
    
    if (purchasesQuery.data) {
      setPurchases(purchasesQuery.data)
    }
    
    if (booksQuery.error) {
      addNotification({
        type: 'error',
        title: 'Failed to load your books',
        message: booksQuery.error.message,
        duration: 5000,
      })
    }
    
    if (purchasesQuery.error) {
      addNotification({
        type: 'error',
        title: 'Failed to load purchase history',
        message: purchasesQuery.error.message,
        duration: 5000,
      })
    }
  }, [
    booksQuery.data, 
    booksQuery.isLoading, 
    booksQuery.error,
    purchasesQuery.data,
    purchasesQuery.isLoading,
    purchasesQuery.error,
    setMyBooks,
    setMyBooksLoading,
    setMyBooksError,
    setPurchases,
    setPurchasesLoading,
    setPurchasesError,
    setOwnedBooks,
    addNotification
  ])
  
  return {
    books: booksQuery.data || [],
    purchases: purchasesQuery.data || [],
    isLoading: booksQuery.isLoading || purchasesQuery.isLoading,
    error: booksQuery.error || purchasesQuery.error,
    refetch: () => {
      booksQuery.refetch()
      purchasesQuery.refetch()
    },
  }
}

/**
 * Enhanced hook for book search with integrated state
 */
export const useIntegratedBookSearch = (query: string) => {
  const { setFilteredBooks, setSearchLoading, setSearchError } = useBooksActions()
  const { addNotification } = useUIActions()
  
  const searchQuery = useQuery({
    queryKey: queryKeys.searchBooks(query),
    queryFn: () => apiService.searchBooks(query),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  })
  
  // Sync search results with Zustand store
  useEffect(() => {
    setSearchLoading(searchQuery.isLoading)
    setSearchError(searchQuery.error?.message || null)
    
    if (searchQuery.data) {
      setFilteredBooks(searchQuery.data)
    }
    
    if (searchQuery.error && query.length > 2) {
      addNotification({
        type: 'error',
        title: 'Search failed',
        message: searchQuery.error.message,
        duration: 3000,
      })
    }
  }, [searchQuery.data, searchQuery.isLoading, searchQuery.error, query, setFilteredBooks, setSearchLoading, setSearchError, addNotification])
  
  return {
    ...searchQuery,
    results: searchQuery.data || [],
  }
}

/**
 * Enhanced hook for book filtering with integrated state
 */
export const useIntegratedBookFilter = (filters: BookFilters) => {
  const { setFilteredBooks, setSearchLoading, setSearchError } = useBooksActions()
  const { addNotification } = useUIActions()
  
  const hasFilters = !!(filters.author || filters.genre || filters.searchQuery)
  
  const filterQuery = useQuery({
    queryKey: queryKeys.filterBooks(filters),
    queryFn: () => apiService.filterBooks(filters),
    enabled: hasFilters,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  })
  
  // Sync filter results with Zustand store
  useEffect(() => {
    if (hasFilters) {
      setSearchLoading(filterQuery.isLoading)
      setSearchError(filterQuery.error?.message || null)
      
      if (filterQuery.data) {
        setFilteredBooks(filterQuery.data)
      }
      
      if (filterQuery.error) {
        addNotification({
          type: 'error',
          title: 'Filter failed',
          message: filterQuery.error.message,
          duration: 3000,
        })
      }
    } else {
      // Clear filtered results when no filters are active
      setFilteredBooks([])
      setSearchLoading(false)
      setSearchError(null)
    }
  }, [filterQuery.data, filterQuery.isLoading, filterQuery.error, hasFilters, setFilteredBooks, setSearchLoading, setSearchError, addNotification])
  
  return {
    ...filterQuery,
    results: filterQuery.data || [],
    hasFilters,
  }
}

/**
 * Enhanced hook for book ownership checking with integrated state
 */
export const useIntegratedBookOwnership = (bookId: number) => {
  const { setOwnershipCache, setCheckingOwnership, setOwnershipError } = usePurchasesActions()
  
  const ownershipQuery = useQuery({
    queryKey: queryKeys.ownership(bookId),
    queryFn: () => apiService.checkOwnership(bookId),
    enabled: !!bookId,
    staleTime: 1 * 60 * 1000,
    retry: 2,
  })
  
  // Sync ownership data with Zustand store
  useEffect(() => {
    setCheckingOwnership(bookId, ownershipQuery.isLoading)
    setOwnershipError(bookId, ownershipQuery.error?.message || null)
    
    if (ownershipQuery.data) {
      setOwnershipCache(bookId, ownershipQuery.data)
    }
  }, [ownershipQuery.data, ownershipQuery.isLoading, ownershipQuery.error, bookId, setOwnershipCache, setCheckingOwnership, setOwnershipError])
  
  return {
    ...ownershipQuery,
    ownership: ownershipQuery.data,
    isOwned: ownershipQuery.data?.owns_book || false,
  }
}

/**
 * Enhanced hook for book purchasing with integrated state and optimistic updates
 */
export const useIntegratedPurchaseBook = () => {
  const queryClient = useQueryClient()
  const { 
    setPurchasing, 
    setPurchaseError, 
    addOwnedBook, 
    addPurchase, 
    setOwnershipCache 
  } = usePurchasesActions()
  const { addNotification } = useUIActions()
  
  const mutation = useMutation({
    mutationFn: (bookId: number) => apiService.purchaseBook(bookId),
    onMutate: async (bookId) => {
      // Set purchasing state
      setPurchasing(bookId, true)
      setPurchaseError(bookId, null)
      
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.ownership(bookId) })
      await queryClient.cancelQueries({ queryKey: queryKeys.myBooks })
      await queryClient.cancelQueries({ queryKey: queryKeys.myPurchases })

      // Snapshot the previous values
      const previousOwnership = queryClient.getQueryData(queryKeys.ownership(bookId))
      const previousMyBooks = queryClient.getQueryData(queryKeys.myBooks)
      const previousPurchases = queryClient.getQueryData(queryKeys.myPurchases)

      // Optimistically update ownership in both React Query and Zustand
      const optimisticOwnership: OwnershipResponse = {
        user_id: '', // Will be filled by server response
        book_id: bookId,
        book_title: '', // Will be filled by server response
        owns_book: true,
        purchase_date: new Date().toISOString(),
      }
      
      queryClient.setQueryData(queryKeys.ownership(bookId), optimisticOwnership)
      setOwnershipCache(bookId, optimisticOwnership)
      addOwnedBook(bookId)

      return { previousOwnership, previousMyBooks, previousPurchases, bookId }
    },
    onSuccess: (data, bookId) => {
      setPurchasing(bookId, false)
      
      if (data.success) {
        // Update with real data from server
        const realOwnership: OwnershipResponse = {
          user_id: data.user_id || '',
          book_id: bookId,
          book_title: data.book_title || '',
          owns_book: true,
          purchase_date: new Date().toISOString(),
          purchase_id: data.purchase_id,
        }
        
        queryClient.setQueryData(queryKeys.ownership(bookId), realOwnership)
        setOwnershipCache(bookId, realOwnership)
        
        // Add to purchases if we have the data
        if (data.purchase_id) {
          const purchase: Purchase = {
            purchase_id: data.purchase_id,
            book_id: bookId,
            book_title: data.book_title || '',
            book_author: data.book_author || '',
            book_genre: data.book_genre || '',
            purchase_price: data.purchase_price || 0,
            purchased_at: new Date().toISOString(),
          }
          addPurchase(purchase)
        }
        
        // Show success notification
        addNotification({
          type: 'success',
          title: 'Purchase successful!',
          message: `You now own "${data.book_title || 'this book'}"`,
          duration: 5000,
        })
        
        // Invalidate and refetch to ensure we have the latest data
        queryClient.invalidateQueries({ queryKey: queryKeys.myBooks })
        queryClient.invalidateQueries({ queryKey: queryKeys.myPurchases })
      } else {
        throw new Error(data.message || 'Purchase failed')
      }
    },
    onError: (error: any, bookId, context) => {
      setPurchasing(bookId, false)
      const errorMessage = error?.message || 'Purchase failed'
      setPurchaseError(bookId, errorMessage)
      
      // Revert optimistic updates
      if (context?.previousOwnership) {
        queryClient.setQueryData(queryKeys.ownership(bookId), context.previousOwnership)
        setOwnershipCache(bookId, context.previousOwnership as OwnershipResponse)
      } else {
        // If no previous ownership data, remove from owned books
        queryClient.removeQueries({ queryKey: queryKeys.ownership(bookId) })
      }
      
      // Show error notification
      addNotification({
        type: 'error',
        title: 'Purchase failed',
        message: errorMessage,
        duration: 5000,
      })
      
      console.error('Purchase failed:', error)
    },
  })
  
  return {
    ...mutation,
    purchaseBook: mutation.mutate,
  }
}