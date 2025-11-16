import { useMemo } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

/**
 * Hook for checking role-based access control
 */
export const useRoleAccess = (requiredRoles: string[] = []) => {
  const { user, isAuthenticated } = useAuth0()

  const hasAccess = useMemo(() => {
    if (!isAuthenticated || !user) {
      return false
    }

    if (requiredRoles.length === 0) {
      return true // No specific roles required, just authentication
    }

    const userRoles = user['https://kahf.com/roles'] || []
    return requiredRoles.some(role => userRoles.includes(role))
  }, [user, isAuthenticated, requiredRoles])

  const userRoles = useMemo(() => {
    if (!isAuthenticated || !user) {
      return []
    }
    return user['https://kahf.com/roles'] || []
  }, [user, isAuthenticated])

  const isAdmin = useMemo(() => {
    return userRoles.includes('admin') || userRoles.includes('sudo_admin')
  }, [userRoles])

  const isSudoAdmin = useMemo(() => {
    return userRoles.includes('sudo_admin')
  }, [userRoles])

  return {
    hasAccess,
    userRoles,
    isAdmin,
    isSudoAdmin,
    checkRole: (role: string) => userRoles.includes(role),
    checkAnyRole: (roles: string[]) =>
      roles.some(role => userRoles.includes(role)),
    checkAllRoles: (roles: string[]) =>
      roles.every(role => userRoles.includes(role)),
  }
}
