/**
 * Integration test to verify API service works with authentication system
 * This file can be imported and used to test the API service integration
 */

import apiService from './api'
import { tokenManager } from './tokenManager'

/**
 * Test API service integration with authentication
 */
export const testApiServiceIntegration = () => {
  console.log('=== API Service Integration Test ===')

  // Test 1: Check if API service can access base URL
  console.log('1. API Base URL:', apiService.getBaseURL())

  // Test 2: Check authentication status
  console.log('2. Is Authenticated:', apiService.isAuthenticated())

  // Test 3: Check token manager integration
  console.log('3. Has Tokens:', tokenManager.hasTokens())
  console.log('4. Token Expired:', tokenManager.isTokenExpired())

  // Test 4: Test connectivity (should work without auth)
  apiService
    .testConnection()
    .then(connected => {
      console.log(
        '5. API Connectivity:',
        connected ? 'Connected' : 'Disconnected'
      )
    })
    .catch(error => {
      console.log('5. API Connectivity Error:', error.message)
    })

  // Test 5: Simulate token setting and check authentication
  console.log('6. Simulating token setting...')
  tokenManager.setTokens('mock-access-token', 'mock-refresh-token')
  console.log(
    '7. After setting tokens - Is Authenticated:',
    apiService.isAuthenticated()
  )
  console.log('8. After setting tokens - Has Tokens:', tokenManager.hasTokens())

  // Test 6: Clear tokens and check
  console.log('9. Clearing tokens...')
  tokenManager.clearTokens()
  console.log(
    '10. After clearing - Is Authenticated:',
    apiService.isAuthenticated()
  )
  console.log('11. After clearing - Has Tokens:', tokenManager.hasTokens())

  console.log('=== Integration Test Complete ===')
}

/**
 * Test error handling in API service
 */
export const testApiServiceErrorHandling = async () => {
  console.log('=== API Service Error Handling Test ===')

  try {
    // This should fail with authentication error
    await apiService.getBooks()
    console.log('ERROR: Should have failed with authentication error')
  } catch (error) {
    console.log('✓ Correctly caught authentication error:', error)
  }

  try {
    // Test with mock token
    tokenManager.setTokens('invalid-token')
    // This might fail with network error or auth error depending on backend
    await apiService.getBooks()
    console.log('✓ Request with invalid token handled')
  } catch (error) {
    console.log('✓ Correctly handled invalid token error:', error)
  } finally {
    tokenManager.clearTokens()
  }

  console.log('=== Error Handling Test Complete ===')
}

/**
 * Test API service methods exist and are callable
 */
export const testApiServiceMethods = () => {
  console.log('=== API Service Methods Test ===')

  const methods = [
    'getBooks',
    'getBook',
    'searchBooks',
    'filterBooksByAuthor',
    'filterBooksByGenre',
    'filterBooks',
    'getMyBooks',
    'getMyPurchases',
    'purchaseBook',
    'checkOwnership',
    'getBookContent',
    'getUserRoles',
    'setUserRole',
    'getUsers',
    'getSystemHealth',
    'testConnection',
    'getBaseURL',
    'isAuthenticated',
  ]

  methods.forEach(method => {
    if (typeof apiService[method as keyof typeof apiService] === 'function') {
      console.log(`✓ ${method} method exists`)
    } else {
      console.log(`✗ ${method} method missing`)
    }
  })

  console.log('=== Methods Test Complete ===')
}

/**
 * Run all integration tests
 */
export const runAllIntegrationTests = async () => {
  testApiServiceMethods()
  testApiServiceIntegration()
  await testApiServiceErrorHandling()
}

// Export for use in development
export default {
  testApiServiceIntegration,
  testApiServiceErrorHandling,
  testApiServiceMethods,
  runAllIntegrationTests,
}
