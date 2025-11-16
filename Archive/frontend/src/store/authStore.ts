import { create } from 'zustand'
import { User } from '@/types'
import { tokenManager } from '@/services/tokenManager'

interface AuthState {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (user: User, accessToken: string, refreshToken?: string) => void
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Actions
  setUser: user => set({ user }),

  setAuthenticated: authenticated => set({ isAuthenticated: authenticated }),

  setLoading: loading => set({ isLoading: loading }),

  setError: error => set({ error }),

  clearError: () => set({ error: null }),

  login: (user, accessToken, refreshToken) => {
    // Store tokens securely
    tokenManager.setTokens(accessToken, refreshToken)

    // Update auth state
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      error: null,
    })
  },

  logout: () => {
    // Clear tokens
    tokenManager.clearTokens()

    // Reset auth state
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })
  },
}))

// Helper hooks for common auth operations
export const useAuth = () => {
  const store = useAuthStore()
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    error: store.error,
    login: store.login,
    logout: store.logout,
    setError: store.setError,
    clearError: store.clearError,
  }
}

export const useAuthActions = () => {
  const store = useAuthStore()
  return {
    setUser: store.setUser,
    setAuthenticated: store.setAuthenticated,
    setLoading: store.setLoading,
    setError: store.setError,
    login: store.login,
    logout: store.logout,
    clearError: store.clearError,
  }
}
