import { create } from 'zustand'

interface UIState {
  // Loading states
  isGlobalLoading: boolean
  loadingMessage: string
  
  // Modal states
  isModalOpen: boolean
  modalContent: React.ReactNode | null
  modalTitle: string
  
  // Notification states
  notifications: Notification[]
  
  // Navigation states
  isMobileMenuOpen: boolean
  currentPage: string
  breadcrumbs: Breadcrumb[]
  
  // Theme and preferences
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  
  // Error states
  globalError: string | null
  
  // Actions
  setGlobalLoading: (loading: boolean, message?: string) => void
  openModal: (content: React.ReactNode, title?: string) => void
  closeModal: () => void
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setMobileMenuOpen: (open: boolean) => void
  setCurrentPage: (page: string) => void
  setBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setGlobalError: (error: string | null) => void
  clearGlobalError: () => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  timestamp: number
  duration?: number // Auto-dismiss after this many ms
}

interface Breadcrumb {
  label: string
  href?: string
  current?: boolean
}

export const useUIStore = create<UIState>((set, get) => ({
  // Initial state
  isGlobalLoading: false,
  loadingMessage: '',
  isModalOpen: false,
  modalContent: null,
  modalTitle: '',
  notifications: [],
  isMobileMenuOpen: false,
  currentPage: '',
  breadcrumbs: [],
  theme: 'system',
  sidebarCollapsed: false,
  globalError: null,

  // Actions
  setGlobalLoading: (loading, message = '') => set({ 
    isGlobalLoading: loading, 
    loadingMessage: message 
  }),
  
  openModal: (content, title = '') => set({ 
    isModalOpen: true, 
    modalContent: content, 
    modalTitle: title 
  }),
  
  closeModal: () => set({ 
    isModalOpen: false, 
    modalContent: null, 
    modalTitle: '' 
  }),
  
  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
    }
    
    set((state) => ({
      notifications: [...state.notifications, newNotification]
    }))
    
    // Auto-remove notification after duration
    if (notification.duration) {
      setTimeout(() => {
        get().removeNotification(id)
      }, notification.duration)
    }
  },
  
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  
  clearNotifications: () => set({ notifications: [] }),
  
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  
  setTheme: (theme) => set({ theme }),
  
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  
  setGlobalError: (error) => set({ globalError: error }),
  
  clearGlobalError: () => set({ globalError: null }),
}))

// Helper hooks for specific UI operations
export const useLoading = () => {
  const store = useUIStore()
  return {
    isLoading: store.isGlobalLoading,
    message: store.loadingMessage,
    setLoading: store.setGlobalLoading,
  }
}

export const useModal = () => {
  const store = useUIStore()
  return {
    isOpen: store.isModalOpen,
    content: store.modalContent,
    title: store.modalTitle,
    open: store.openModal,
    close: store.closeModal,
  }
}

export const useNotifications = () => {
  const store = useUIStore()
  return {
    notifications: store.notifications,
    add: store.addNotification,
    remove: store.removeNotification,
    clear: store.clearNotifications,
  }
}

export const useNavigation = () => {
  const store = useUIStore()
  return {
    isMobileMenuOpen: store.isMobileMenuOpen,
    currentPage: store.currentPage,
    breadcrumbs: store.breadcrumbs,
    setMobileMenuOpen: store.setMobileMenuOpen,
    setCurrentPage: store.setCurrentPage,
    setBreadcrumbs: store.setBreadcrumbs,
  }
}

export const useTheme = () => {
  const store = useUIStore()
  return {
    theme: store.theme,
    sidebarCollapsed: store.sidebarCollapsed,
    setTheme: store.setTheme,
    setSidebarCollapsed: store.setSidebarCollapsed,
  }
}

export const useGlobalError = () => {
  const store = useUIStore()
  return {
    error: store.globalError,
    setError: store.setGlobalError,
    clearError: store.clearGlobalError,
  }
}

export const useUIActions = () => {
  const store = useUIStore()
  return {
    setGlobalLoading: store.setGlobalLoading,
    openModal: store.openModal,
    closeModal: store.closeModal,
    addNotification: store.addNotification,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications,
    setMobileMenuOpen: store.setMobileMenuOpen,
    setCurrentPage: store.setCurrentPage,
    setBreadcrumbs: store.setBreadcrumbs,
    setTheme: store.setTheme,
    setSidebarCollapsed: store.setSidebarCollapsed,
    setGlobalError: store.setGlobalError,
    clearGlobalError: store.clearGlobalError,
  }
}

// Export types for use in components
export type { Notification, Breadcrumb }