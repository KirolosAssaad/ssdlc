import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/components/auth'
import { Layout } from '@/components/layout'
import { Home, BookCatalog, BookDetails, BookReader, Library, Admin } from '@/pages'
import { ErrorHandlingDemo } from '@/components/examples/ErrorHandlingDemo'
import { StateProvider } from '@/providers'
import { queryClient } from '@/config/queryClient'
import { ErrorBoundary, GlobalErrorHandler, ErrorHandlingProvider, OfflineHandler } from '@/components/common'
import validateEnvironment from '@/utils/validateEnv'
import './App.css'

/**
 * Main App component with routing
 */
const AppContent: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/catalog' element={<BookCatalog />} />
        <Route path='/book/:bookId' element={<BookDetails />} />
        <Route path='/reader/:bookId' element={<BookReader />} />
        <Route path='/library' element={<Library />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/error-demo' element={<ErrorHandlingDemo />} />
        {/* TODO: Add more routes in subsequent tasks */}
      </Routes>
    </Layout>
  )
}

const App: React.FC = () => {
  useEffect(() => {
    // Validate environment configuration on app start
    validateEnvironment()
  }, [])

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <StateProvider>
            <ErrorHandlingProvider>
              <OfflineHandler>
                <GlobalErrorHandler>
                  <Router>
                    <AppContent />
                  </Router>
                </GlobalErrorHandler>
              </OfflineHandler>
            </ErrorHandlingProvider>
          </StateProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
