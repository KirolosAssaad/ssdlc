// Environment configuration
export interface AppConfig {
  API_BASE_URL: string
  AUTH0_DOMAIN: string
  AUTH0_CLIENT_ID: string
  AUTH0_AUDIENCE: string
  AUTH0_REDIRECT_URI: string
  APP_NAME: string
  APP_VERSION: string
  DEV_MODE: boolean
  LOG_LEVEL: string
}

const config: AppConfig = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  AUTH0_DOMAIN: import.meta.env.VITE_AUTH0_DOMAIN || '',
  AUTH0_CLIENT_ID: import.meta.env.VITE_AUTH0_CLIENT_ID || '',
  AUTH0_AUDIENCE: import.meta.env.VITE_AUTH0_AUDIENCE || '',
  AUTH0_REDIRECT_URI:
    import.meta.env.VITE_AUTH0_REDIRECT_URI || 'http://localhost:3000',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'KAHF Ebook Store',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEV_MODE: import.meta.env.VITE_DEV_MODE === 'true' || import.meta.env.DEV,
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL || 'info',
}

// Validate required environment variables
const requiredEnvVars = ['VITE_AUTH0_DOMAIN', 'VITE_AUTH0_CLIENT_ID'] as const

export const validateConfig = (): void => {
  const missing = requiredEnvVars.filter(key => !import.meta.env[key])

  if (missing.length > 0 && !config.DEV_MODE) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    )
  }

  if (config.DEV_MODE && missing.length > 0) {
    console.warn(
      `Missing environment variables (development mode): ${missing.join(', ')}`
    )
  }
}

export default config

// Export query client configuration
export { 
  queryClient, 
  createQueryKeys, 
  invalidateRelatedQueries, 
  prefetchHelpers, 
  cacheHelpers 
} from './queryClient'

// Export security configuration
export { default as securityConfig, getSecurityConfig, securityPolicies } from './security'
