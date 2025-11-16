/**
 * Toast notification components
 * Provides success, error, warning, and info notifications with auto-dismiss
 */

import React, { useEffect } from 'react'
import { Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { Notification } from '@/store/uiStore'

interface ToastProps {
  notification: Notification
  onDismiss: (id: string) => void
}

export const Toast: React.FC<ToastProps> = ({ notification, onDismiss }) => {
  const { id, type, title, message, duration } = notification

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onDismiss(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onDismiss])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-400" />
      case 'error':
        return <ExclamationCircleIcon className="w-5 h-5 text-red-400" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400" />
      case 'info':
        return <InformationCircleIcon className="w-5 h-5 text-blue-400" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-400" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  const getMessageColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-700'
      case 'error':
        return 'text-red-700'
      case 'warning':
        return 'text-yellow-700'
      case 'info':
        return 'text-blue-700'
      default:
        return 'text-gray-700'
    }
  }

  return (
    <div className={`max-w-sm w-full border rounded-lg shadow-lg ${getBackgroundColor()}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={`text-sm font-medium ${getTitleColor()}`}>
              {title}
            </p>
            {message && (
              <p className={`mt-1 text-sm ${getMessageColor()}`}>
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                type === 'success' ? 'text-green-400 hover:text-green-500 focus:ring-green-500' :
                type === 'error' ? 'text-red-400 hover:text-red-500 focus:ring-red-500' :
                type === 'warning' ? 'text-yellow-400 hover:text-yellow-500 focus:ring-yellow-500' :
                'text-blue-400 hover:text-blue-500 focus:ring-blue-500'
              }`}
              onClick={() => onDismiss(id)}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ToastContainerProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  notifications,
  onDismiss,
  position = 'top-right'
}) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-0 right-0 mt-4 mr-4'
      case 'top-left':
        return 'top-0 left-0 mt-4 ml-4'
      case 'bottom-right':
        return 'bottom-0 right-0 mb-4 mr-4'
      case 'bottom-left':
        return 'bottom-0 left-0 mb-4 ml-4'
      case 'top-center':
        return 'top-0 left-1/2 transform -translate-x-1/2 mt-4'
      case 'bottom-center':
        return 'bottom-0 left-1/2 transform -translate-x-1/2 mb-4'
      default:
        return 'top-0 right-0 mt-4 mr-4'
    }
  }

  return (
    <div
      className={`fixed z-50 pointer-events-none ${getPositionClasses()}`}
      aria-live="assertive"
    >
      <div className="flex flex-col space-y-4 pointer-events-auto">
        {notifications.map((notification) => (
          <Transition
            key={notification.id}
            show={true}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Toast notification={notification} onDismiss={onDismiss} />
          </Transition>
        ))}
      </div>
    </div>
  )
}

// Hook for easy toast usage
export const useToast = () => {
  const { notifications, add, remove } = useNotifications()

  const showToast = (
    type: Notification['type'],
    title: string,
    message?: string,
    duration: number = 5000
  ) => {
    add({
      type,
      title,
      message,
      duration
    })
  }

  const showSuccess = (title: string, message?: string, duration?: number) => {
    showToast('success', title, message, duration)
  }

  const showError = (title: string, message?: string, duration?: number) => {
    showToast('error', title, message, duration || 7000) // Errors stay longer
  }

  const showWarning = (title: string, message?: string, duration?: number) => {
    showToast('warning', title, message, duration)
  }

  const showInfo = (title: string, message?: string, duration?: number) => {
    showToast('info', title, message, duration)
  }

  return {
    notifications,
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    dismiss: remove
  }
}

// Import useNotifications from store
import { useNotifications } from '@/store/uiStore'

export default Toast