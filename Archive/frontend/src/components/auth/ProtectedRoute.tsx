import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { ProtectedRouteProps } from '@/types'
import LoginButton from './LoginButton'

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  fallback,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth0()

  // Show loading state while Auth0 is initializing
  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-kahf-primary border-t-transparent'></div>
          <p className='text-kahf-secondary'>Loading...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      fallback || (
        <div className='flex min-h-screen items-center justify-center bg-kahf-accent'>
          <div className='mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-lg'>
            <h2 className='mb-4 text-2xl font-semibold text-kahf-primary'>
              Authentication Required
            </h2>
            <p className='mb-6 text-gray-600'>
              Please log in to access this content.
            </p>
            <LoginButton className='w-full' />
          </div>
        </div>
      )
    )
  }

  // Check role-based access if roles are required
  if (requiredRoles.length > 0) {
    const userRoles = user?.['https://kahf.com/roles'] || []
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role))

    if (!hasRequiredRole) {
      return (
        fallback || (
          <div className='flex min-h-screen items-center justify-center bg-kahf-accent'>
            <div className='mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-lg'>
              <h2 className='mb-4 text-2xl font-semibold text-red-600'>
                Access Denied
              </h2>
              <p className='mb-6 text-gray-600'>
                You don't have the required permissions to access this content.
              </p>
              <p className='text-sm text-gray-500'>
                Required roles: {requiredRoles.join(', ')}
              </p>
            </div>
          </div>
        )
      )
    }
  }

  // User is authenticated and has required roles
  return <>{children}</>
}

export default ProtectedRoute
