import React from 'react'
import { useAuth0 } from '@auth0/auth0-react'

interface LoginButtonProps {
  className?: string
  children?: React.ReactNode
}

const LoginButton: React.FC<LoginButtonProps> = ({
  className = '',
  children = 'Log In',
}) => {
  const { loginWithRedirect, isLoading } = useAuth0()

  const handleLogin = () => {
    loginWithRedirect({
      authorizationParams: {
        prompt: 'login',
      },
    })
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`inline-flex items-center justify-center rounded-md bg-kahf-primary px-4 py-2 font-medium text-white shadow-sm transition-colors duration-200 hover:bg-kahf-secondary focus:outline-none focus:ring-2 focus:ring-kahf-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className} `}
    >
      {isLoading ? (
        <>
          <svg
            className='-ml-1 mr-2 h-4 w-4 animate-spin text-white'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
          Logging in...
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default LoginButton
