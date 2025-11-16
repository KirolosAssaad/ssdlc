import React from 'react'
import Header from './Header'
import Footer from './Footer'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className='flex min-h-screen flex-col bg-kahf-accent'>
      <Header />
      <main className='container mx-auto flex-1 px-4 py-8'>{children}</main>
      <Footer />
    </div>
  )
}

export default Layout
