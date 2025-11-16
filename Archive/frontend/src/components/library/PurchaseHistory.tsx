import React, { useState, useMemo } from 'react'
import { Purchase } from '@/types'

interface PurchaseHistoryProps {
  purchases: Purchase[]
}

type SortOption =
  | 'date-desc'
  | 'date-asc'
  | 'title'
  | 'author'
  | 'price-desc'
  | 'price-asc'

const PurchaseHistory: React.FC<PurchaseHistoryProps> = ({ purchases }) => {
  const [sortBy, setSortBy] = useState<SortOption>('date-desc')
  const [searchQuery, setSearchQuery] = useState('')

  // Filter purchases based on search query
  const filteredPurchases = useMemo(() => {
    if (!searchQuery) return purchases

    const query = searchQuery.toLowerCase()
    return purchases.filter(
      purchase =>
        purchase.book_title.toLowerCase().includes(query) ||
        purchase.book_author.toLowerCase().includes(query) ||
        purchase.book_genre.toLowerCase().includes(query)
    )
  }, [purchases, searchQuery])

  // Sort purchases based on selected option
  const sortedPurchases = useMemo(() => {
    const sorted = [...filteredPurchases]

    switch (sortBy) {
      case 'date-desc':
        return sorted.sort(
          (a, b) =>
            new Date(b.purchased_at).getTime() -
            new Date(a.purchased_at).getTime()
        )
      case 'date-asc':
        return sorted.sort(
          (a, b) =>
            new Date(a.purchased_at).getTime() -
            new Date(b.purchased_at).getTime()
        )
      case 'title':
        return sorted.sort((a, b) => a.book_title.localeCompare(b.book_title))
      case 'author':
        return sorted.sort((a, b) => a.book_author.localeCompare(b.book_author))
      case 'price-desc':
        return sorted.sort((a, b) => b.purchase_price - a.purchase_price)
      case 'price-asc':
        return sorted.sort((a, b) => a.purchase_price - b.purchase_price)
      default:
        return sorted
    }
  }, [filteredPurchases, sortBy])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const totalSpent = useMemo(() => {
    return purchases.reduce((sum, purchase) => sum + purchase.purchase_price, 0)
  }, [purchases])

  return (
    <div className='space-y-6'>
      {/* Header with Stats */}
      <div className='rounded-lg bg-white p-6 shadow-sm'>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-kahf-primary'>
              {purchases.length}
            </div>
            <div className='text-sm text-gray-600'>Total Purchases</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-kahf-primary'>
              {formatPrice(totalSpent)}
            </div>
            <div className='text-sm text-gray-600'>Total Spent</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-kahf-primary'>
              {purchases.length > 0
                ? formatPrice(totalSpent / purchases.length)
                : '$0.00'}
            </div>
            <div className='text-sm text-gray-600'>Average per Book</div>
          </div>
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='max-w-md flex-1'>
          <div className='relative'>
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
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search purchase history...'
              className='w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 outline-none transition-all duration-200 focus:border-transparent focus:ring-2 focus:ring-kahf-primary'
            />
          </div>
        </div>

        {purchases.length > 0 && (
          <div className='flex items-center gap-2'>
            <label htmlFor='sort-select' className='text-sm text-gray-600'>
              Sort by:
            </label>
            <select
              id='sort-select'
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              className='rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-kahf-primary focus:outline-none focus:ring-1 focus:ring-kahf-primary'
            >
              <option value='date-desc'>Newest First</option>
              <option value='date-asc'>Oldest First</option>
              <option value='title'>Title (A-Z)</option>
              <option value='author'>Author (A-Z)</option>
              <option value='price-desc'>Price (High to Low)</option>
              <option value='price-asc'>Price (Low to High)</option>
            </select>
          </div>
        )}
      </div>

      {/* Purchase History List */}
      {sortedPurchases.length > 0 ? (
        <div className='space-y-4'>
          {sortedPurchases.map(purchase => (
            <PurchaseItem
              key={purchase.purchase_id}
              purchase={purchase}
              formatDate={formatDate}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          hasPurchases={purchases.length > 0}
          searchQuery={searchQuery}
        />
      )}
    </div>
  )
}

interface PurchaseItemProps {
  purchase: Purchase
  formatDate: (date: string) => string
  formatPrice: (price: number) => string
}

const PurchaseItem: React.FC<PurchaseItemProps> = ({
  purchase,
  formatDate,
  formatPrice,
}) => {
  return (
    <div className='rounded-lg bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex-1'>
          <div className='flex items-start gap-4'>
            {/* Book Cover Placeholder */}
            <div className='flex h-16 w-12 flex-shrink-0 items-center justify-center rounded bg-gradient-to-br from-kahf-secondary to-kahf-primary text-white'>
              <svg
                className='h-6 w-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                />
              </svg>
            </div>

            {/* Book Details */}
            <div className='min-w-0 flex-1'>
              <h3 className='truncate text-lg font-semibold text-kahf-primary'>
                {purchase.book_title}
              </h3>
              <p className='text-sm text-gray-600'>by {purchase.book_author}</p>
              <p className='text-xs text-gray-500'>{purchase.book_genre}</p>
              <p className='mt-2 text-sm text-gray-600'>
                Purchased on {formatDate(purchase.purchased_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Purchase Details */}
        <div className='flex flex-col items-end gap-2 sm:flex-shrink-0'>
          <div className='text-lg font-bold text-kahf-primary'>
            {formatPrice(purchase.purchase_price)}
          </div>
          <div className='text-xs text-gray-500'>
            Order #{purchase.purchase_id}
          </div>
          <a
            href={`/book/${purchase.book_id}`}
            className='text-sm text-kahf-secondary transition-colors duration-200 hover:text-kahf-primary'
          >
            View Details →
          </a>
        </div>
      </div>
    </div>
  )
}

interface EmptyStateProps {
  hasPurchases: boolean
  searchQuery: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  hasPurchases,
  searchQuery,
}) => {
  if (!hasPurchases) {
    // No purchases at all
    return (
      <div className='py-12 text-center'>
        <div className='mx-auto mb-4 h-24 w-24 text-gray-300'>
          <svg
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            className='h-full w-full'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
            />
          </svg>
        </div>
        <h3 className='mb-2 text-lg font-medium text-gray-900'>
          No purchase history
        </h3>
        <p className='mb-6 text-gray-600'>
          You haven't made any purchases yet. Start exploring our book catalog
          to build your library.
        </p>
        <a
          href='/catalog'
          className='inline-flex items-center rounded-md bg-kahf-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-kahf-secondary'
        >
          Browse Books
          <svg
            className='ml-2 h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </a>
      </div>
    )
  }

  if (searchQuery) {
    // Has purchases but no results for current search
    return (
      <div className='py-12 text-center'>
        <div className='mx-auto mb-4 h-16 w-16 text-gray-300'>
          <svg
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
            className='h-full w-full'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
        <h3 className='mb-2 text-lg font-medium text-gray-900'>
          No purchases found
        </h3>
        <p className='mb-4 text-gray-600'>
          No purchases match your search for "{searchQuery}".
        </p>
        <p className='text-sm text-gray-600'>
          Try adjusting your search terms or clearing the search.
        </p>
      </div>
    )
  }

  return null
}

export default PurchaseHistory
