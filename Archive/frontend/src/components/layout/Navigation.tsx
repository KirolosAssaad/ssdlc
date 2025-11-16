import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { useRoleAccess } from '@/hooks/useRoleAccess'

interface NavigationItem {
  name: string
  href: string
  requiresAuth?: boolean
  requiredRoles?: string[]
}

const Navigation: React.FC = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuth0()
  const { isAdmin } = useRoleAccess()

  const navigationItems: NavigationItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Catalog', href: '/catalog' },
    {
      name: 'My Library',
      href: '/library',
      requiresAuth: true,
    },
    {
      name: 'Admin',
      href: '/admin',
      requiresAuth: true,
      requiredRoles: ['admin', 'sudo_admin'],
    },
  ]

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  const shouldShowItem = (item: NavigationItem) => {
    if (item.requiresAuth && !isAuthenticated) return false
    if (item.requiredRoles && item.requiredRoles.includes('admin') && !isAdmin) return false
    return true
  }

  return (
    <nav className='flex space-x-6'>
      {navigationItems.filter(shouldShowItem).map(item => (
        <Link
          key={item.name}
          to={item.href}
          className={`rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200 ${
            isActiveLink(item.href)
              ? 'bg-kahf-primary text-white'
              : 'text-kahf-primary hover:bg-kahf-accent hover:text-kahf-secondary'
          }`}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}

export default Navigation
