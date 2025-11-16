import React, { useState, useEffect, useRef } from 'react'
import { SearchBarProps } from '../../types'

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search books...',
  className = '',
}) => {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  // Debounced search effect
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setIsSearching(true)
    timeoutRef.current = window.setTimeout(() => {
      onSearch(query)
      setIsSearching(false)
    }, 300) // 300ms debounce delay

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query, onSearch])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
    setIsSearching(false)
  }

  const clearSearch = () => {
    setQuery('')
    setIsSearching(false)
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className='relative'>
        {/* Search Icon */}
        <div className='pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3'>
          <svg
            className='h-5 w-5 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>

        {/* Search Input */}
        <input
          type='text'
          value={query}
          onChange={handleInputChange}
          placeholder={placeholder}
          className='w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-12 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-kahf-primary'
        />

        {/* Loading Spinner or Clear Button */}
        <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
          {isSearching ? (
            <div className='h-5 w-5 animate-spin rounded-full border-2 border-kahf-primary border-t-transparent' />
          ) : query ? (
            <button
              type='button'
              onClick={clearSearch}
              className='h-5 w-5 text-gray-400 transition-colors duration-200 hover:text-gray-600'
            >
              <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    </form>
  )
}

export default SearchBar
