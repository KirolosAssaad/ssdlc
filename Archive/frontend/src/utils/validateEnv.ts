import config from '@/config'

/**
 * Validates environment configuration and logs warnings for missing values
 */
export const validateEnvironment = (): void => {
  console.log('🔧 Environment Configuration:')
  console.log(`- API Base URL: ${config.API_BASE_URL}`)
  console.log(`- Auth0 Domain: ${config.AUTH0_DOMAIN || 'NOT SET'}`)
  console.log(
    `- Auth0 Client ID: ${config.AUTH0_CLIENT_ID ? 'SET' : 'NOT SET'}`
  )
  console.log(`- Auth0 Audience: ${config.AUTH0_AUDIENCE || 'NOT SET'}`)
  console.log(`- Development Mode: ${config.DEV_MODE}`)

  // Validate required environment variables
  const requiredVars = [
    { key: 'AUTH0_DOMAIN', value: config.AUTH0_DOMAIN },
    { key: 'AUTH0_CLIENT_ID', value: config.AUTH0_CLIENT_ID },
  ]

  const missing = requiredVars.filter(({ value }) => !value)

  if (missing.length > 0) {
    if (config.DEV_MODE) {
      console.warn(
        '⚠️  Missing environment variables (development mode):',
        missing.map(({ key }) => key).join(', ')
      )
      console.warn(
        '💡 Update your .env.local file with proper Auth0 configuration'
      )
    } else {
      throw new Error(
        `❌ Missing required environment variables: ${missing
          .map(({ key }) => key)
          .join(', ')}`
      )
    }
  } else {
    console.log('✅ All required environment variables are configured')
  }
}

export default validateEnvironment
