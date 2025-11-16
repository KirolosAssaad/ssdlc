import React, { useState } from 'react'
import { FilterPanelProps, BookFilters } from '../../types'

const FilterPanel: React.FC<FilterPanelProps> = ({
  authors,
  genres,
  onFilterChange,
  activeFilters,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleAuthorChange = (author: string) => {
    const newFilters: BookFilters = {
      ...activeFilters,
      author: activeFilters.author === author ? undefined : author,
    }
    onFilterChange(newFilters)
  }

  const handleGenreChange = (genre: string) => {
    const newFilters: BookFilters = {
      ...activeFilters,
      genre: activeFilters.genre === genre ? undefined : genre,
    }
    onFilterChange(newFilters)
  }

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: activeFilters.searchQuery, // Keep search query
    })
  }

  const hasActiveFilters = activeFilters.author || activeFilters.genre
  const activeFilterCount = [activeFilters.author, activeFilters.genre].filter(
    Boolean
  ).length

  return (
    <div className='rounded-lg border border-gray-200 bg-white shadow-sm'>
      {/* Filter Header */}
      <div className='flex items-center justify-between border-b border-gray-200 p-4'>
        <div className='flex items-center gap-2'>
          <h3 className='font-semibold text-kahf-primary'>Filters</h3>
          {activeFilterCount > 0 && (
            <span className='rounded-full bg-kahf-primary px-2 py-1 text-xs text-white'>
              {activeFilterCount}
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className='text-sm text-kahf-secondary transition-colors duration-200 hover:text-kahf-primary'
            >
              Clear All
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className='p-1 text-gray-500 transition-colors duration-200 hover:text-gray-700 lg:hidden'
          >
            <svg
              className={`h-5 w-5 transform transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 9l-7 7-7-7'
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className={`${isExpanded ? 'block' : 'hidden'} lg:block`}>
        <div className='space-y-6 p-4'>
          {/* Author Filter */}
          {authors.length > 0 && (
            <div>
              <h4 className='mb-3 font-medium text-gray-900'>Authors</h4>
              <div className='max-h-48 space-y-2 overflow-y-auto'>
                {authors.map(author => (
                  <label
                    key={author}
                    className='flex cursor-pointer items-center gap-2 rounded p-2 transition-colors duration-200 hover:bg-gray-50'
                  >
                    <input
                      type='radio'
                      name='author'
                      checked={activeFilters.author === author}
                      onChange={() => handleAuthorChange(author)}
                      className='h-4 w-4 border-gray-300 text-kahf-primary focus:ring-2 focus:ring-kahf-primary'
                    />
                    <span className='flex-1 text-sm text-gray-700'>
                      {author}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Genre Filter */}
          {genres.length > 0 && (
            <div>
              <h4 className='mb-3 font-medium text-gray-900'>Genres</h4>
              <div className='max-h-48 space-y-2 overflow-y-auto'>
                {genres.map(genre => (
                  <label
                    key={genre}
                    className='flex cursor-pointer items-center gap-2 rounded p-2 transition-colors duration-200 hover:bg-gray-50'
                  >
                    <input
                      type='radio'
                      name='genre'
                      checked={activeFilters.genre === genre}
                      onChange={() => handleGenreChange(genre)}
                      className='h-4 w-4 border-gray-300 text-kahf-primary focus:ring-2 focus:ring-kahf-primary'
                    />
                    <span className='flex-1 text-sm text-gray-700'>
                      {genre}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* No Filters Available */}
          {authors.length === 0 && genres.length === 0 && (
            <div className='py-8 text-center text-gray-500'>
              <svg
                className='mx-auto mb-3 h-12 w-12 text-gray-300'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                />
              </svg>
              <p className='text-sm'>No filters available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilterPanel
