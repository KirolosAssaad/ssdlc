/**
 * Secure Input Component - Input component with built-in validation and sanitization
 */

import React, { useState, useCallback, useEffect } from 'react'
import { useSecurity } from './SecurityProvider'
import type { ValidationRule } from '@/services/security'

interface SecureInputProps {
  type?: 'text' | 'email' | 'password' | 'search' | 'url'
  placeholder?: string
  value?: string
  onChange?: (value: string, isValid: boolean) => void
  onValidationChange?: (errors: string[]) => void
  validationRules?: ValidationRule
  className?: string
  disabled?: boolean
  autoComplete?: string
  'data-testid'?: string
}

/**
 * Secure input component with automatic validation and sanitization
 */
export const SecureInput: React.FC<SecureInputProps> = ({
  type = 'text',
  placeholder,
  value = '',
  onChange,
  onValidationChange,
  validationRules = { sanitize: true },
  className = '',
  disabled = false,
  autoComplete,
  'data-testid': testId
}) => {
  const { validateInput, logSecurityEvent } = useSecurity()
  const [internalValue, setInternalValue] = useState(value)
  const [errors, setErrors] = useState<string[]>([])
  const [isValid, setIsValid] = useState(true)

  // Update internal value when prop changes
  useEffect(() => {
    setInternalValue(value)
  }, [value])

  // Validate input with debouncing
  const validateAndSanitize = useCallback((inputValue: string) => {
    const validation = validateInput(inputValue, validationRules)
    
    setErrors(validation.errors)
    setIsValid(validation.isValid)
    
    // Call validation change callback
    if (onValidationChange) {
      onValidationChange(validation.errors)
    }
    
    // Call change callback with sanitized value
    if (onChange) {
      onChange(validation.sanitized, validation.isValid)
    }
    
    return validation
  }, [validateInput, validationRules, onChange, onValidationChange])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    setInternalValue(newValue)
    
    // Debounce validation
    const timeoutId = setTimeout(() => {
      validateAndSanitize(newValue)
    }, 300)
    
    return () => clearTimeout(timeoutId)
  }

  const handleBlur = () => {
    // Immediate validation on blur
    validateAndSanitize(internalValue)
  }

  const handleFocus = () => {
    // Log focus event for security monitoring
    logSecurityEvent('SUSPICIOUS_ACTIVITY' as any, {
      action: 'input_focus',
      inputType: type,
      hasValue: !!internalValue
    }, 'low')
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = event.clipboardData.getData('text')
    
    // Log paste event for security monitoring
    logSecurityEvent('SUSPICIOUS_ACTIVITY' as any, {
      action: 'input_paste',
      inputType: type,
      dataLength: pastedData.length,
      containsHtml: /<[^>]*>/.test(pastedData)
    }, 'low')
    
    // Allow normal paste handling, validation will occur in onChange
  }

  // Base input classes
  const baseClasses = `
    w-full px-3 py-2 border rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-[#964722] focus:border-[#964722]
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-200
  `

  // Error state classes
  const errorClasses = !isValid ? 'border-red-500 bg-red-50' : 'border-gray-300'

  // Combine classes
  const inputClasses = `${baseClasses} ${errorClasses} ${className}`.trim()

  return (
    <div className="w-full">
      <input
        type={type}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        onPaste={handlePaste}
        className={inputClasses}
        disabled={disabled}
        autoComplete={autoComplete}
        data-testid={testId}
        // Security attributes
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck="false"
      />
      
      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mt-1 space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

export default SecureInput