import { create } from 'zustand'
import { Book, BookFilters } from '@/types'

interface BooksState {
  // State
  books: Book[]
  myBooks: Book[]
  filteredBooks: Book[]
  filters: BookFilters
  searchQuery: string
  selectedBook: Book | null
  
  // Loading states
  isLoadingBooks: boolean
  isLoadingMyBooks: boolean
  isLoadingSearch: boolean
  
  // Error states
  booksError: string | null
  myBooksError: string | null
  searchError: string | null

  // Actions
  setBooks: (books: Book[]) => void
  setMyBooks: (books: Book[]) => void
  setFilteredBooks: (books: Book[]) => void
  setFilters: (filters: BookFilters) => void
  updateFilters: (partialFilters: Partial<BookFilters>) => void
  clearFilters: () => void
  setSearchQuery: (query: string) => void
  setSelectedBook: (book: Book | null) => void
  
  // Loading actions
  setBooksLoading: (loading: boolean) => void
  setMyBooksLoading: (loading: boolean) => void
  setSearchLoading: (loading: boolean) => void
  
  // Error actions
  setBooksError: (error: string | null) => void
  setMyBooksError: (error: string | null) => void
  setSearchError: (error: string | null) => void
  clearErrors: () => void
  
  // Utility actions
  addBookToMyBooks: (book: Book) => void
  removeBookFromMyBooks: (bookId: number) => void
  updateBook: (bookId: number, updates: Partial<Book>) => void
}

export const useBooksStore = create<BooksState>((set) => ({
  // Initial state
  books: [],
  myBooks: [],
  filteredBooks: [],
  filters: {},
  searchQuery: '',
  selectedBook: null,
  
  // Loading states
  isLoadingBooks: false,
  isLoadingMyBooks: false,
  isLoadingSearch: false,
  
  // Error states
  booksError: null,
  myBooksError: null,
  searchError: null,

  // Actions
  setBooks: (books) => set({ books }),
  
  setMyBooks: (books) => set({ myBooks: books }),
  
  setFilteredBooks: (books) => set({ filteredBooks: books }),
  
  setFilters: (filters) => set({ filters }),
  
  updateFilters: (partialFilters) => set((state) => ({
    filters: { ...state.filters, ...partialFilters }
  })),
  
  clearFilters: () => set({ 
    filters: {},
    searchQuery: '',
    filteredBooks: []
  }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedBook: (book) => set({ selectedBook: book }),
  
  // Loading actions
  setBooksLoading: (loading) => set({ isLoadingBooks: loading }),
  
  setMyBooksLoading: (loading) => set({ isLoadingMyBooks: loading }),
  
  setSearchLoading: (loading) => set({ isLoadingSearch: loading }),
  
  // Error actions
  setBooksError: (error) => set({ booksError: error }),
  
  setMyBooksError: (error) => set({ myBooksError: error }),
  
  setSearchError: (error) => set({ searchError: error }),
  
  clearErrors: () => set({ 
    booksError: null,
    myBooksError: null,
    searchError: null
  }),
  
  // Utility actions
  addBookToMyBooks: (book) => set((state) => ({
    myBooks: [...state.myBooks, book]
  })),
  
  removeBookFromMyBooks: (bookId) => set((state) => ({
    myBooks: state.myBooks.filter(book => book.id !== bookId)
  })),
  
  updateBook: (bookId, updates) => set((state) => ({
    books: state.books.map(book => 
      book.id === bookId ? { ...book, ...updates } : book
    ),
    myBooks: state.myBooks.map(book => 
      book.id === bookId ? { ...book, ...updates } : book
    )
  }))
}))

// Helper hooks for specific book operations
export const useBooks = () => {
  const store = useBooksStore()
  return {
    books: store.books,
    filteredBooks: store.filteredBooks,
    isLoading: store.isLoadingBooks,
    error: store.booksError,
    setBooks: store.setBooks,
    setFilteredBooks: store.setFilteredBooks,
    setLoading: store.setBooksLoading,
    setError: store.setBooksError,
  }
}

export const useMyBooks = () => {
  const store = useBooksStore()
  return {
    myBooks: store.myBooks,
    isLoading: store.isLoadingMyBooks,
    error: store.myBooksError,
    setMyBooks: store.setMyBooks,
    setLoading: store.setMyBooksLoading,
    setError: store.setMyBooksError,
    addBook: store.addBookToMyBooks,
    removeBook: store.removeBookFromMyBooks,
  }
}

export const useBookFilters = () => {
  const store = useBooksStore()
  return {
    filters: store.filters,
    searchQuery: store.searchQuery,
    setFilters: store.setFilters,
    updateFilters: store.updateFilters,
    clearFilters: store.clearFilters,
    setSearchQuery: store.setSearchQuery,
  }
}

export const useSelectedBook = () => {
  const store = useBooksStore()
  return {
    selectedBook: store.selectedBook,
    setSelectedBook: store.setSelectedBook,
  }
}

export const useBooksActions = () => {
  const store = useBooksStore()
  return {
    setBooks: store.setBooks,
    setMyBooks: store.setMyBooks,
    setFilteredBooks: store.setFilteredBooks,
    setFilters: store.setFilters,
    updateFilters: store.updateFilters,
    clearFilters: store.clearFilters,
    setSearchQuery: store.setSearchQuery,
    setSelectedBook: store.setSelectedBook,
    setBooksLoading: store.setBooksLoading,
    setMyBooksLoading: store.setMyBooksLoading,
    setSearchLoading: store.setSearchLoading,
    setBooksError: store.setBooksError,
    setMyBooksError: store.setMyBooksError,
    setSearchError: store.setSearchError,
    clearErrors: store.clearErrors,
    addBookToMyBooks: store.addBookToMyBooks,
    removeBookFromMyBooks: store.removeBookFromMyBooks,
    updateBook: store.updateBook,
  }
}