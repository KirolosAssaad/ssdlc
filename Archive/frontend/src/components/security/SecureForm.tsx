/**
 * Secure Form Component - Form component with built-in CSRF protection and validation
 */

import React, { FormEvent, ReactNode, useCallback } from 'react'
import { useSecurity } from './SecurityProvider'
import { SecurityEventType } from '@/services/security'

interface SecureFormProps {
  onSubmit: (formData: FormData, event: FormEvent<HTMLFormElement>) => void | Promise<void>
  children: ReactNode
  className?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  encType?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
  noValidate?: boolean
  'data-testid'?: string
}

/**
 * Secure form component with automatic CSRF protection and security validation
 */
export const SecureForm: React.FC<SecureFormProps> = ({
  onSubmit,
  children,
  className = '',
  method = 'POST',
  encType = 'application/x-www-form-urlencoded',
  noValidate = false,
  'data-testid': testId
}) => {
  const { csrfToken, logSecurityEvent, validateInput } = useSecurity()

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    const form = event.currentTarget
    const formData = new FormData(form)
    
    // Log form submission attempt
    logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
      action: 'form_submission_attempt',
      method,
      formFields: Array.from(formData.keys()),
      hasCSRFToken: !!csrfToken
    }, 'low')

    try {
      // Add CSRF token for state-changing operations
      if (['POST', 'PUT', 'DELETE'].includes(method) && csrfToken) {
        formData.append('csrf_token', csrfToken)
      }

      // Validate all form inputs
      let hasValidationErrors = false
      const validationErrors: Record<string, string[]> = {}

      for (const [key, value] of formData.entries()) {
        if (typeof value === 'string' && key !== 'csrf_token') {
          const validation = validateInput(value, { 
            sanitize: true,
            maxLength: 10000 // Prevent extremely long inputs
          })
          
          if (!validation.isValid) {
            hasValidationErrors = true
            validationErrors[key] = validation.errors
            
            // Update form data with sanitized value
            formData.set(key, validation.sanitized)
          }
        }
      }

      // Log validation results
      if (hasValidationErrors) {
        logSecurityEvent(SecurityEventType.INPUT_VALIDATION_FAILURE, {
          action: 'form_validation_failed',
          errors: validationErrors,
          fieldCount: Object.keys(validationErrors).length
        }, 'medium')
        
        // You might want to show validation errors to the user here
        // For now, we'll continue with sanitized values
      }

      // Validate form size (prevent large payloads)
      const formValues = Array.from(formData.values()).map(v => String(v))
      const formSize = new Blob(formValues).size
      if (formSize > 1024 * 1024) { // 1MB limit
        logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
          action: 'form_size_exceeded',
          size: formSize,
          limit: 1024 * 1024
        }, 'high')
        throw new Error('Form data too large')
      }

      // Call the provided onSubmit handler
      await onSubmit(formData, event)
      
      // Log successful submission
      logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'form_submission_success',
        method,
        fieldCount: Array.from(formData.keys()).length
      }, 'low')
      
    } catch (error) {
      // Log submission error
      logSecurityEvent(SecurityEventType.SUSPICIOUS_ACTIVITY, {
        action: 'form_submission_error',
        method,
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 'medium')
      
      // Re-throw error for handling by parent component
      throw error
    }
  }, [onSubmit, method, csrfToken, logSecurityEvent, validateInput])

  // Base form classes
  const baseClasses = 'space-y-4'
  const formClasses = `${baseClasses} ${className}`.trim()

  return (
    <form
      onSubmit={handleSubmit}
      className={formClasses}
      method={method}
      encType={encType}
      noValidate={noValidate}
      data-testid={testId}
      // Security attributes
      autoComplete="off"
    >
      {/* Hidden CSRF token field for state-changing operations */}
      {['POST', 'PUT', 'DELETE'].includes(method) && csrfToken && (
        <input
          type="hidden"
          name="csrf_token"
          value={csrfToken}
        />
      )}
      
      {children}
    </form>
  )
}

export default SecureForm