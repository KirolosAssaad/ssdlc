import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Navigation from './Navigation'
import UserMenu from './UserMenu'
import MobileMenu from './MobileMenu'

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className='border-b border-gray-200 bg-white shadow-md'>
      <div className='container mx-auto px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link to='/' className='flex items-center space-x-3'>
            <img src='/KAHF.jpeg' alt='KAHF Logo' className='h-10 w-auto' />
            <span className='text-xl font-bold text-kahf-primary'>
              KAHF Ebook Store
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden items-center space-x-8 md:flex'>
            <Navigation />
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className='rounded-md p-2 text-kahf-primary hover:bg-kahf-accent focus:outline-none focus:ring-2 focus:ring-kahf-primary md:hidden'
            aria-label='Toggle mobile menu'
          >
            <svg
              className='h-6 w-6'
              fill='none'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              {isMobileMenuOpen ? (
                <path d='M6 18L18 6M6 6l12 12' />
              ) : (
                <path d='M4 6h16M4 12h16M4 18h16' />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </div>
    </header>
  )
}

export default Header
