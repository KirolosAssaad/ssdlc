/**
 * Demo component showing how to use the integrated state management system
 * This component demonstrates all the key features of the state management implementation
 */

import React, { useState } from 'react'
import {
  useIntegratedBooks,
  useIntegratedMyBooks,
  useIntegratedBookSearch,
  useIntegratedPurchaseBook,
  useDataSync,
  useLoadingError,
} from '@/hooks'
import {
  useBooks,
  useMyBooks,
  useBookFilters,
  useNotifications,
  useLoading,
  useGlobalError,
} from '@/store'

export const StateManagementDemo: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  
  // Integrated hooks that sync React Query with Zustand
  useIntegratedBooks()
  useIntegratedMyBooks()
  useIntegratedBookSearch(searchQuery)
  const purchaseMutation = useIntegratedPurchaseBook()
  
  // Direct Zustand store access
  const { books, filteredBooks } = useBooks()
  const { myBooks } = useMyBooks()
  const { filters, updateFilters, clearFilters } = useBookFilters()
  const { notifications, add: addNotification } = useNotifications()
  const { isLoading: globalLoading } = useLoading()
  const { error: globalError } = useGlobalError()
  
  // Data synchronization and error handling
  const { refreshAllData, prefetchBook } = useDataSync()
  const { 
    handleAsyncOperation, 
    retryFailedQueries, 
    getBookLoadingStates, 
    getBookErrorStates 
  } = useLoadingError()
  
  // Get current loading and error states
  const loadingStates = getBookLoadingStates()
  const errorStates = getBookErrorStates()
  
  const handlePurchase = async (bookId: number) => {
    await handleAsyncOperation(
      () => purchaseMutation.mutateAsync(bookId),
      {
        loadingMessage: 'Processing purchase...',
        successMessage: 'Book purchased successfully!',
        errorMessage: 'Failed to purchase book',
      }
    )
  }
  
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    updateFilters({ searchQuery: query })
  }
  
  const handleRefresh = async () => {
    await refreshAllData()
  }
  
  const handlePrefetch = (bookId: number) => {
    prefetchBook(bookId)
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">State Management Demo</h1>
      
      {/* Global Loading State */}
      {globalLoading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Loading: {globalLoading}
        </div>
      )}
      
      {/* Global Error State */}
      {globalError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {globalError}
        </div>
      )}
      
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded mb-2 ${
                notification.type === 'success' ? 'bg-green-100 text-green-700' :
                notification.type === 'error' ? 'bg-red-100 text-red-700' :
                notification.type === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}
            >
              <strong>{notification.title}</strong>
              {notification.message && <p>{notification.message}</p>}
            </div>
          ))}
        </div>
      )}
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Search</h3>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search books..."
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2">Actions</h3>
          <div className="space-x-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh All Data
            </button>
            <button
              onClick={() => retryFailedQueries()}
              className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Retry Failed
            </button>
            <button
              onClick={() => addNotification({
                type: 'info',
                title: 'Test Notification',
                message: 'This is a test notification',
                duration: 3000,
              })}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Test Notification
            </button>
          </div>
        </div>
      </div>
      
      {/* Loading States */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Loading States</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-3 rounded ${loadingStates.books ? 'bg-yellow-100' : 'bg-green-100'}`}>
            <div className="font-medium">Books</div>
            <div>{loadingStates.books ? 'Loading...' : 'Ready'}</div>
          </div>
          <div className={`p-3 rounded ${loadingStates.myBooks ? 'bg-yellow-100' : 'bg-green-100'}`}>
            <div className="font-medium">My Books</div>
            <div>{loadingStates.myBooks ? 'Loading...' : 'Ready'}</div>
          </div>
          <div className={`p-3 rounded ${loadingStates.purchases ? 'bg-yellow-100' : 'bg-green-100'}`}>
            <div className="font-medium">Purchases</div>
            <div>{loadingStates.purchases ? 'Loading...' : 'Ready'}</div>
          </div>
          <div className={`p-3 rounded ${loadingStates.search ? 'bg-yellow-100' : 'bg-green-100'}`}>
            <div className="font-medium">Search</div>
            <div>{loadingStates.search ? 'Loading...' : 'Ready'}</div>
          </div>
        </div>
      </div>
      
      {/* Error States */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Error States</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {errorStates.books && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              <div className="font-medium">Books Error</div>
              <div>{errorStates.books.message}</div>
            </div>
          )}
          {errorStates.myBooks && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              <div className="font-medium">My Books Error</div>
              <div>{errorStates.myBooks.message}</div>
            </div>
          )}
          {errorStates.purchases && (
            <div className="p-3 bg-red-100 text-red-700 rounded">
              <div className="font-medium">Purchases Error</div>
              <div>{errorStates.purchases.message}</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Current Filters */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Current Filters</h3>
        <div className="p-3 bg-gray-100 rounded">
          <pre>{JSON.stringify(filters, null, 2)}</pre>
          <button
            onClick={clearFilters}
            className="mt-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>
      </div>
      
      {/* Books Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* All Books */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            All Books ({books.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {books.slice(0, 5).map((book) => (
              <div key={book.id} className="p-3 border rounded">
                <div className="font-medium">{book.title}</div>
                <div className="text-sm text-gray-600">{book.author}</div>
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => handlePurchase(book.id)}
                    disabled={purchaseMutation.isPending}
                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                  >
                    {purchaseMutation.isPending ? 'Purchasing...' : 'Purchase'}
                  </button>
                  <button
                    onClick={() => handlePrefetch(book.id)}
                    className="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    Prefetch
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* My Books */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            My Books ({myBooks.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {myBooks.slice(0, 5).map((book) => (
              <div key={book.id} className="p-3 border rounded bg-green-50">
                <div className="font-medium">{book.title}</div>
                <div className="text-sm text-gray-600">{book.author}</div>
                <div className="text-xs text-green-600 mt-1">Owned</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Search Results */}
      {searchQuery && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">
            Search Results for "{searchQuery}" ({filteredBooks.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredBooks.slice(0, 5).map((book) => (
              <div key={book.id} className="p-3 border rounded bg-blue-50">
                <div className="font-medium">{book.title}</div>
                <div className="text-sm text-gray-600">{book.author}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default StateManagementDemo