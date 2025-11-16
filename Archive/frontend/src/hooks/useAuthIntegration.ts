import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useAuthActions } from '@/store/authStore'
import { User } from '@/types'

/**
 * Hook that integrates Auth0 with our Zustand auth store
 * Handles automatic token management and user state synchronization
 */
export const useAuthIntegration = () => {
  const {
    isAuthenticated,
    isLoading,
    user: auth0User,
    getAccessTokenSilently,
    error: auth0Error,
  } = useAuth0()

  const { login, logout, setLoading, setError } = useAuthActions()

  // Sync Auth0 state with our store
  useEffect(() => {
    const syncAuthState = async () => {
      setLoading(isLoading)

      if (auth0Error) {
        setError(auth0Error.message)
        return
      }

      if (isAuthenticated && auth0User) {
        try {
          // Get access token
          const accessToken = await getAccessTokenSilently()

          // Transform Auth0 user to our User type
          const user: User = {
            sub: auth0User.sub || '',
            name: auth0User.name || '',
            email: auth0User.email || '',
            email_verified: auth0User.email_verified || false,
            picture: auth0User.picture || '',
            updated_at: auth0User.updated_at || new Date().toISOString(),
            roles: auth0User['https://kahf.com/roles'] || [],
          }

          // Update our store
          login(user, accessToken)
        } catch (error) {
          console.error('Failed to get access token:', error)
          setError('Failed to authenticate. Please try logging in again.')
        }
      } else if (!isAuthenticated && !isLoading) {
        // User is not authenticated, clear our store
        logout()
      }
    }

    syncAuthState()
  }, [
    isAuthenticated,
    isLoading,
    auth0User,
    auth0Error,
    getAccessTokenSilently,
    login,
    logout,
    setLoading,
    setError,
  ])

  // Set up automatic token refresh
  useEffect(() => {
    if (!isAuthenticated) return

    const refreshInterval = setInterval(
      async () => {
        try {
          // This will automatically refresh the token if needed
          await getAccessTokenSilently()
        } catch (error) {
          console.error('Token refresh failed:', error)
          // Don't set error here as it might be a temporary network issue
        }
      },
      5 * 60 * 1000
    ) // Check every 5 minutes

    return () => clearInterval(refreshInterval)
  }, [isAuthenticated, getAccessTokenSilently])

  return {
    isAuthenticated,
    isLoading,
    error: auth0Error,
  }
}
