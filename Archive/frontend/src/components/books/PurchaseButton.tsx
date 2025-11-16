import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiService, { ApiServiceError } from '@/services/api'
import PurchaseConfirmationDialog from './PurchaseConfirmationDialog'
import type { PurchaseResponse } from '@/types'

interface PurchaseButtonProps {
  bookId: number
  isLoading?: boolean
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  disabled?: boolean
}

/**
 * PurchaseButton component with ownership checking and purchase flow
 */
const PurchaseButton: React.FC<PurchaseButtonProps> = ({
  bookId,
  isLoading = false,
  onSuccess,
  onError,
  className = '',
  disabled = false,
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Purchase mutation
  const purchaseMutation = useMutation<
    PurchaseResponse,
    ApiServiceError,
    number
  >({
    mutationFn: (bookId: number) => apiService.purchaseBook(bookId),
    onSuccess: data => {
      if (data.success) {
        // Invalidate relevant queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['ownership', bookId] })
        queryClient.invalidateQueries({ queryKey: ['myBooks'] })
        queryClient.invalidateQueries({ queryKey: ['myPurchases'] })

        setShowConfirmation(false)
        setPurchaseError(null)
        onSuccess?.()
      } else {
        const errorMessage =
          data.message || 'Purchase failed. Please try again.'
        setPurchaseError(errorMessage)
        onError?.(errorMessage)
      }
    },
    onError: error => {
      let errorMessage = 'Purchase failed. Please try again.'

      if (error instanceof ApiServiceError) {
        switch (error.status) {
          case 400:
            errorMessage = 'You already own this book.'
            break
          case 401:
            errorMessage = 'Please log in to purchase this book.'
            break
          case 403:
            errorMessage = "You don't have permission to purchase books."
            break
          case 404:
            errorMessage = 'This book is no longer available for purchase.'
            break
          case 429:
            errorMessage = 'Too many purchase attempts. Please try again later.'
            break
          case 500:
            errorMessage = 'Server error. Please try again later.'
            break
          default:
            errorMessage = error.message || errorMessage
        }
      }

      setPurchaseError(errorMessage)
      onError?.(errorMessage)
    },
  })

  const handlePurchaseClick = () => {
    setPurchaseError(null)
    setShowConfirmation(true)
  }

  const handleConfirmPurchase = () => {
    purchaseMutation.mutate(bookId)
  }

  const handleCancelPurchase = () => {
    setShowConfirmation(false)
    setPurchaseError(null)
  }

  const isButtonDisabled = disabled || isLoading || purchaseMutation.isPending

  return (
    <>
      <button
        onClick={handlePurchaseClick}
        disabled={isButtonDisabled}
        className={`relative transform overflow-hidden rounded-md bg-kahf-secondary px-6 py-3 font-medium text-white transition-all duration-200 ${
          isButtonDisabled
            ? 'cursor-not-allowed opacity-50'
            : 'hover:scale-105 hover:bg-kahf-primary active:scale-95'
        } ${className} `}
      >
        {isLoading || purchaseMutation.isPending ? (
          <div className='flex items-center justify-center'>
            <svg
              className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
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
            {purchaseMutation.isPending ? 'Processing...' : 'Loading...'}
          </div>
        ) : (
          <div className='flex items-center justify-center'>
            <svg
              className='mr-2 h-5 w-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l1.5 1.5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z'
              />
            </svg>
            Purchase Book
          </div>
        )}
      </button>

      {/* Error Message */}
      {purchaseError && (
        <div className='mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-600'>
          <div className='flex items-center'>
            <svg
              className='mr-2 h-4 w-4 flex-shrink-0'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                clipRule='evenodd'
              />
            </svg>
            {purchaseError}
          </div>
        </div>
      )}

      {/* Purchase Confirmation Dialog */}
      <PurchaseConfirmationDialog
        isOpen={showConfirmation}
        bookId={bookId}
        isProcessing={purchaseMutation.isPending}
        error={purchaseError}
        onConfirm={handleConfirmPurchase}
        onCancel={handleCancelPurchase}
      />
    </>
  )
}

export default PurchaseButton
