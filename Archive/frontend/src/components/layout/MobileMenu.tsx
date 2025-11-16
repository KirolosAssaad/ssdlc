import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { useRoleAccess } from '@/hooks/useRoleAccess'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0()
  const { isAdmin } = useRoleAccess()

  if (!isOpen) return null

  return (
    <div className='md:hidden'>
      <div className='space-y-1 border-t border-gray-200 bg-white px-2 pb-3 pt-2 sm:px-3'>
        {/* Navigation Links */}
        <Link
          to='/'
          onClick={onClose}
          className='block rounded-md px-3 py-2 text-base font-medium text-kahf-primary transition-colors duration-200 hover:bg-kahf-accent hover:text-kahf-secondary'
        >
          Home
        </Link>
        <Link
          to='/catalog'
          onClick={onClose}
          className='block rounded-md px-3 py-2 text-base font-medium text-kahf-primary transition-colors duration-200 hover:bg-kahf-accent hover:text-kahf-secondary'
        >
          Catalog
        </Link>

        {isAuthenticated && (
          <>
            <Link
              to='/library'
              onClick={onClose}
              className='block rounded-md px-3 py-2 text-base font-medium text-kahf-primary transition-colors duration-200 hover:bg-kahf-accent hover:text-kahf-secondary'
            >
              My Library
            </Link>
            {isAdmin && (
              <Link
                to='/admin'
                onClick={onClose}
                className='block rounded-md px-3 py-2 text-base font-medium text-kahf-primary transition-colors duration-200 hover:bg-kahf-accent hover:text-kahf-secondary'
              >
                Admin Panel
              </Link>
            )}
            <Link
              to='/profile'
              onClick={onClose}
              className='block rounded-md px-3 py-2 text-base font-medium text-kahf-primary transition-colors duration-200 hover:bg-kahf-accent hover:text-kahf-secondary'
            >
              Profile
            </Link>
          </>
        )}

        {/* User Section */}
        <div className='border-t border-gray-200 pt-4'>
          {isAuthenticated ? (
            <div className='space-y-2'>
              <div className='flex items-center px-3 py-2'>
                {user?.picture && (
                  <img
                    src={user.picture}
                    alt={user.name || 'User'}
                    className='mr-3 h-8 w-8 rounded-full'
                  />
                )}
                <span className='text-sm font-medium text-kahf-primary'>
                  {user?.name}
                </span>
              </div>
              <button
                onClick={() => {
                  logout({ logoutParams: { returnTo: window.location.origin } })
                  onClose()
                }}
                className='block w-full rounded-md px-3 py-2 text-left text-base font-medium text-red-600 transition-colors duration-200 hover:bg-red-50 hover:text-red-800'
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                loginWithRedirect()
                onClose()
              }}
              className='block w-full rounded-md bg-kahf-primary px-3 py-2 text-left text-base font-medium text-white transition-colors duration-200 hover:bg-kahf-secondary'
            >
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MobileMenu
