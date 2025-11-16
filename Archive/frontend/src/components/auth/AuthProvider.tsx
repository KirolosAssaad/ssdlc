import React from 'react'
import { Auth0Provider } from '@auth0/auth0-react'
import config from '@/config'
import { useAuthIntegration } from '@/hooks/useAuthIntegration'

interface AuthProviderProps {
  children: React.ReactNode
}

/**
 * Internal component that handles Auth0 integration
 */
const AuthIntegrationHandler: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useAuthIntegration()
  return <>{children}</>
}

/**
 * AuthProvider component that wraps Auth0Provider and integrates with our store
 */
const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return (
    <Auth0Provider
      domain={config.AUTH0_DOMAIN}
      clientId={config.AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: config.AUTH0_REDIRECT_URI,
        audience: config.AUTH0_AUDIENCE,
        scope: 'openid profile email',
      }}
      useRefreshTokens={true}
      cacheLocation='memory' // Store tokens in memory for security
    >
      <AuthIntegrationHandler>{children}</AuthIntegrationHandler>
    </Auth0Provider>
  )
}

export default AuthProvider
