import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'react-router-dom'
import { useRoleAccess } from '@/hooks/useRoleAccess'

const UserMenu: React.FC = () => {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0()
  const { isAdmin } = useRoleAccess()

  if (!isAuthenticated) {
    return (
      <button
        onClick={() => loginWithRedirect()}
        className='rounded-md bg-kahf-primary px-4 py-2 text-white transition-colors duration-200 hover:bg-kahf-secondary'
      >
        Login
      </button>
    )
  }

  return (
    <div className='group relative'>
      <button className='flex items-center space-x-2 text-kahf-primary transition-colors duration-200 hover:text-kahf-secondary'>
        {user?.picture && (
          <img
            src={user.picture}
            alt={user.name || 'User'}
            className='h-8 w-8 rounded-full'
          />
        )}
        <span className='hidden sm:block'>{user?.name}</span>
        <svg
          className='h-4 w-4'
          fill='none'
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path d='M19 9l-7 7-7-7' />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div className='invisible absolute right-0 z-50 mt-2 w-48 rounded-md bg-white opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:opacity-100'>
        <div className='py-1'>
          <a
            href='/profile'
            className='block px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-kahf-accent'
          >
            Profile
          </a>
          <Link
            to='/library'
            className='block px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-kahf-accent'
          >
            My Library
          </Link>
          {isAdmin && (
            <Link
              to='/admin'
              className='block px-4 py-2 text-sm text-gray-700 transition-colors duration-200 hover:bg-kahf-accent'
            >
              Admin Panel
            </Link>
          )}
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            className='block w-full px-4 py-2 text-left text-sm text-gray-700 transition-colors duration-200 hover:bg-kahf-accent'
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserMenu
