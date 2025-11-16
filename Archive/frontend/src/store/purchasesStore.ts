import { create } from 'zustand'
import { Purchase, OwnershipResponse } from '@/types'

interface PurchasesState {
  // State
  purchases: Purchase[]
  ownedBooks: Set<number>
  ownershipCache: Map<number, OwnershipResponse>
  
  // Loading states
  isLoadingPurchases: boolean
  isPurchasing: Set<number> // Track which books are being purchased
  isCheckingOwnership: Set<number>
  
  // Error states
  purchasesError: string | null
  purchaseErrors: Map<number, string>
  ownershipErrors: Map<number, string>

  // Actions
  setPurchases: (purchases: Purchase[]) => void
  addPurchase: (purchase: Purchase) => void
  setOwnedBooks: (bookIds: number[]) => void
  addOwnedBook: (bookId: number) => void
  removeOwnedBook: (bookId: number) => void
  setOwnershipCache: (bookId: number, ownership: OwnershipResponse) => void
  clearOwnershipCache: () => void
  
  // Loading actions
  setPurchasesLoading: (loading: boolean) => void
  setPurchasing: (bookId: number, purchasing: boolean) => void
  setCheckingOwnership: (bookId: number, checking: boolean) => void
  
  // Error actions
  setPurchasesError: (error: string | null) => void
  setPurchaseError: (bookId: number, error: string | null) => void
  setOwnershipError: (bookId: number, error: string | null) => void
  clearErrors: () => void
  clearPurchaseError: (bookId: number) => void
  clearOwnershipError: (bookId: number) => void
  
  // Utility actions
  isBookOwned: (bookId: number) => boolean
  isPurchasingBook: (bookId: number) => boolean
  isCheckingBookOwnership: (bookId: number) => boolean
  getOwnership: (bookId: number) => OwnershipResponse | undefined
  getPurchaseError: (bookId: number) => string | undefined
  getOwnershipError: (bookId: number) => string | undefined
}

export const usePurchasesStore = create<PurchasesState>((set, get) => ({
  // Initial state
  purchases: [],
  ownedBooks: new Set(),
  ownershipCache: new Map(),
  isLoadingPurchases: false,
  isPurchasing: new Set(),
  isCheckingOwnership: new Set(),
  purchasesError: null,
  purchaseErrors: new Map(),
  ownershipErrors: new Map(),

  // Actions
  setPurchases: (purchases) => {
    const ownedBookIds = purchases.map(p => p.book_id)
    set({ 
      purchases,
      ownedBooks: new Set(ownedBookIds)
    })
  },
  
  addPurchase: (purchase) => set((state) => ({
    purchases: [...state.purchases, purchase],
    ownedBooks: new Set([...state.ownedBooks, purchase.book_id])
  })),
  
  setOwnedBooks: (bookIds) => set({ 
    ownedBooks: new Set(bookIds) 
  }),
  
  addOwnedBook: (bookId) => set((state) => ({
    ownedBooks: new Set([...state.ownedBooks, bookId])
  })),
  
  removeOwnedBook: (bookId) => set((state) => {
    const newOwnedBooks = new Set(state.ownedBooks)
    newOwnedBooks.delete(bookId)
    return { ownedBooks: newOwnedBooks }
  }),
  
  setOwnershipCache: (bookId, ownership) => set((state) => {
    const newCache = new Map(state.ownershipCache)
    newCache.set(bookId, ownership)
    return { ownershipCache: newCache }
  }),
  
  clearOwnershipCache: () => set({ ownershipCache: new Map() }),
  
  // Loading actions
  setPurchasesLoading: (loading) => set({ isLoadingPurchases: loading }),
  
  setPurchasing: (bookId, purchasing) => set((state) => {
    const newPurchasing = new Set(state.isPurchasing)
    if (purchasing) {
      newPurchasing.add(bookId)
    } else {
      newPurchasing.delete(bookId)
    }
    return { isPurchasing: newPurchasing }
  }),
  
  setCheckingOwnership: (bookId, checking) => set((state) => {
    const newChecking = new Set(state.isCheckingOwnership)
    if (checking) {
      newChecking.add(bookId)
    } else {
      newChecking.delete(bookId)
    }
    return { isCheckingOwnership: newChecking }
  }),
  
  // Error actions
  setPurchasesError: (error) => set({ purchasesError: error }),
  
  setPurchaseError: (bookId, error) => set((state) => {
    const newErrors = new Map(state.purchaseErrors)
    if (error) {
      newErrors.set(bookId, error)
    } else {
      newErrors.delete(bookId)
    }
    return { purchaseErrors: newErrors }
  }),
  
  setOwnershipError: (bookId, error) => set((state) => {
    const newErrors = new Map(state.ownershipErrors)
    if (error) {
      newErrors.set(bookId, error)
    } else {
      newErrors.delete(bookId)
    }
    return { ownershipErrors: newErrors }
  }),
  
  clearErrors: () => set({ 
    purchasesError: null,
    purchaseErrors: new Map(),
    ownershipErrors: new Map()
  }),
  
  clearPurchaseError: (bookId) => set((state) => {
    const newErrors = new Map(state.purchaseErrors)
    newErrors.delete(bookId)
    return { purchaseErrors: newErrors }
  }),
  
  clearOwnershipError: (bookId) => set((state) => {
    const newErrors = new Map(state.ownershipErrors)
    newErrors.delete(bookId)
    return { ownershipErrors: newErrors }
  }),
  
  // Utility actions
  isBookOwned: (bookId) => get().ownedBooks.has(bookId),
  
  isPurchasingBook: (bookId) => get().isPurchasing.has(bookId),
  
  isCheckingBookOwnership: (bookId) => get().isCheckingOwnership.has(bookId),
  
  getOwnership: (bookId) => get().ownershipCache.get(bookId),
  
  getPurchaseError: (bookId) => get().purchaseErrors.get(bookId),
  
  getOwnershipError: (bookId) => get().ownershipErrors.get(bookId),
}))

// Helper hooks for specific purchase operations
export const usePurchases = () => {
  const store = usePurchasesStore()
  return {
    purchases: store.purchases,
    isLoading: store.isLoadingPurchases,
    error: store.purchasesError,
    setPurchases: store.setPurchases,
    addPurchase: store.addPurchase,
    setLoading: store.setPurchasesLoading,
    setError: store.setPurchasesError,
  }
}

export const useBookOwnership = () => {
  const store = usePurchasesStore()
  return {
    ownedBooks: store.ownedBooks,
    ownershipCache: store.ownershipCache,
    isBookOwned: store.isBookOwned,
    addOwnedBook: store.addOwnedBook,
    removeOwnedBook: store.removeOwnedBook,
    setOwnershipCache: store.setOwnershipCache,
    clearOwnershipCache: store.clearOwnershipCache,
    getOwnership: store.getOwnership,
  }
}

export const usePurchaseOperations = () => {
  const store = usePurchasesStore()
  return {
    isPurchasing: store.isPurchasing,
    isCheckingOwnership: store.isCheckingOwnership,
    purchaseErrors: store.purchaseErrors,
    ownershipErrors: store.ownershipErrors,
    setPurchasing: store.setPurchasing,
    setCheckingOwnership: store.setCheckingOwnership,
    setPurchaseError: store.setPurchaseError,
    setOwnershipError: store.setOwnershipError,
    clearPurchaseError: store.clearPurchaseError,
    clearOwnershipError: store.clearOwnershipError,
    isPurchasingBook: store.isPurchasingBook,
    isCheckingBookOwnership: store.isCheckingBookOwnership,
    getPurchaseError: store.getPurchaseError,
    getOwnershipError: store.getOwnershipError,
  }
}

export const usePurchasesActions = () => {
  const store = usePurchasesStore()
  return {
    setPurchases: store.setPurchases,
    addPurchase: store.addPurchase,
    setOwnedBooks: store.setOwnedBooks,
    addOwnedBook: store.addOwnedBook,
    removeOwnedBook: store.removeOwnedBook,
    setOwnershipCache: store.setOwnershipCache,
    clearOwnershipCache: store.clearOwnershipCache,
    setPurchasesLoading: store.setPurchasesLoading,
    setPurchasing: store.setPurchasing,
    setCheckingOwnership: store.setCheckingOwnership,
    setPurchasesError: store.setPurchasesError,
    setPurchaseError: store.setPurchaseError,
    setOwnershipError: store.setOwnershipError,
    clearErrors: store.clearErrors,
    clearPurchaseError: store.clearPurchaseError,
    clearOwnershipError: store.clearOwnershipError,
  }
}