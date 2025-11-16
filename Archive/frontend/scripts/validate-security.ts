#!/usr/bin/env tsx

/**
 * Security Validation Script - Validates security implementation
 */

import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')

interface ValidationResult {
  category: string
  checks: Array<{
    name: string
    status: 'pass' | 'fail' | 'warning'
    message: string
  }>
}

/**
 * Validate security implementation
 */
function validateSecurity(): ValidationResult[] {
  const results: ValidationResult[] = []

  // Security Services Validation
  results.push({
    category: 'Security Services',
    checks: [
      {
        name: 'Security Service',
        status: existsSync(join(projectRoot, 'src/services/security.ts')) ? 'pass' : 'fail',
        message: existsSync(join(projectRoot, 'src/services/security.ts')) 
          ? 'Security service implemented' 
          : 'Security service missing'
      },
      {
        name: 'Token Manager Security',
        status: existsSync(join(projectRoot, 'src/services/tokenManager.ts')) ? 'pass' : 'fail',
        message: existsSync(join(projectRoot, 'src/services/tokenManager.ts'))
          ? 'Token manager with security enhancements implemented'
          : 'Token manager missing'
      },
      {
        name: 'DRM Service Security',
        status: existsSync(join(projectRoot, 'src/services/drm.ts')) ? 'pass' : 'fail',
        message: existsSync(join(projectRoot, 'src/services/drm.ts'))
          ? 'DRM service with security logging implemented'
          : 'DRM service missing'
      }
    ]
  })

  // Security Components Validation
  results.push({
    category: 'Security Components',
    checks: [
      {
        name: 'Security Provider',
        status: existsSync(join(projectRoot, 'src/components/security/SecurityProvider.tsx')) ? 'pass' : 'fail',
        message: existsSync(join(projectRoot, 'src/components/security/SecurityProvider.tsx'))
          ? 'Security provider component implemented'
          : 'Security provider component missing'
      },
      {
        name: 'Secure Input',
        status: existsSync(join(projectRoot, 'src/components/security/SecureInput.tsx')) ? 'pass' : 'fail',
        message: existsSync(join(projectRoot, 'src/components/security/SecureInput.tsx'))
          ? 'Secure input component implemented'
          : 'Secure input component missing'
      },
      {
        name: 'Secure Form',
        status: existsSync(join(projectRoot, 'src/components/security/SecureForm.tsx')) ? 'pass' : 'fail',
        message: existsSync(join(projectRoot, 'src/components/security/SecureForm.tsx'))
          ? 'Secure form component implemented'
          : 'Secure form component missing'
      },
      {
        name: 'Security Monitor',
        status: existsSync(join(projectRoot, 'src/components/admin/SecurityMonitor.tsx')) ? 'pass' : 'fail',
        message: existsSync(join(projectRoot, 'src/components/admin/SecurityMonitor.tsx'))
          ? 'Security monitoring dashboard implemented'
          : 'Security monitoring dashboard missing'
      }
    ]
  })

  // Security Configuration Validation
  results.push({
    category: 'Security Configuration',
    checks: [
      {
        name: 'Security Config',
        status: existsSync(join(projectRoot, 'src/config/security.ts')) ? 'pass' : 'fail',
        message: existsSync(join(projectRoot, 'src/config/security.ts'))
          ? 'Security configuration implemented'
          : 'Security configuration missing'
      },
      {
        name: 'Security Utilities',
        status: existsSync(join(projectRoot, 'src/utils/security.ts')) ? 'pass' : 'fail',
        message: existsSync(join(projectRoot, 'src/utils/security.ts'))
          ? 'Security utilities implemented'
          : 'Security utilities missing'
      }
    ]
  })

  // Code Quality Validation
  results.push({
    category: 'Security Implementation Quality',
    checks: [
      {
        name: 'CSRF Protection',
        status: checkForImplementation('CSRF', ['generateCSRFToken', 'validateCSRFToken']) ? 'pass' : 'fail',
        message: checkForImplementation('CSRF', ['generateCSRFToken', 'validateCSRFToken'])
          ? 'CSRF protection implemented'
          : 'CSRF protection missing or incomplete'
      },
      {
        name: 'XSS Prevention',
        status: checkForImplementation('XSS', ['sanitizeHTML', 'sanitizeInput', 'validateInput']) ? 'pass' : 'fail',
        message: checkForImplementation('XSS', ['sanitizeHTML', 'sanitizeInput', 'validateInput'])
          ? 'XSS prevention implemented'
          : 'XSS prevention missing or incomplete'
      },
      {
        name: 'Input Validation',
        status: checkForImplementation('validation', ['validateInput', 'ValidationRule']) ? 'pass' : 'fail',
        message: checkForImplementation('validation', ['validateInput', 'ValidationRule'])
          ? 'Input validation implemented'
          : 'Input validation missing or incomplete'
      },
      {
        name: 'Secure Token Storage',
        status: checkForImplementation('token', ['encryptData', 'decryptData', 'storeTokensSecurely']) ? 'pass' : 'fail',
        message: checkForImplementation('token', ['encryptData', 'decryptData', 'storeTokensSecurely'])
          ? 'Secure token storage implemented'
          : 'Secure token storage missing or incomplete'
      },
      {
        name: 'Audit Logging',
        status: checkForImplementation('audit', ['logSecurityEvent', 'SecurityEventType']) ? 'pass' : 'fail',
        message: checkForImplementation('audit', ['logSecurityEvent', 'SecurityEventType'])
          ? 'Security audit logging implemented'
          : 'Security audit logging missing or incomplete'
      },
      {
        name: 'DRM Protection',
        status: checkForImplementation('drm', ['preventRightClick', 'preventTextSelection', 'addWatermark']) ? 'pass' : 'fail',
        message: checkForImplementation('drm', ['preventRightClick', 'preventTextSelection', 'addWatermark'])
          ? 'DRM protection measures implemented'
          : 'DRM protection measures missing or incomplete'
      }
    ]
  })

  return results
}

/**
 * Check if specific implementation exists in codebase
 */
function checkForImplementation(feature: string, keywords: string[]): boolean {
  const filesToCheck = [
    'src/services/security.ts',
    'src/services/tokenManager.ts',
    'src/services/drm.ts',
    'src/services/api.ts'
  ]

  for (const file of filesToCheck) {
    const filePath = join(projectRoot, file)
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, 'utf-8')
      const hasAllKeywords = keywords.every(keyword => content.includes(keyword))
      if (hasAllKeywords) {
        return true
      }
    }
  }

  return false
}

/**
 * Log validation results
 */
function logValidationResults(results: ValidationResult[]): void {
  console.log('🔒 KAHF Ebook Store Frontend - Security Validation')
  console.log('='.repeat(60))
  console.log()

  let totalChecks = 0
  let passedChecks = 0
  let failedChecks = 0
  let warningChecks = 0

  results.forEach(result => {
    console.log(`📋 ${result.category}`)
    console.log('-'.repeat(40))

    result.checks.forEach(check => {
      totalChecks++
      const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️'
      
      if (check.status === 'pass') passedChecks++
      else if (check.status === 'fail') failedChecks++
      else warningChecks++

      console.log(`  ${icon} ${check.name}: ${check.message}`)
    })
    console.log()
  })

  // Summary
  console.log('📊 Summary')
  console.log('-'.repeat(40))
  console.log(`Total Checks: ${totalChecks}`)
  console.log(`✅ Passed: ${passedChecks}`)
  console.log(`❌ Failed: ${failedChecks}`)
  console.log(`⚠️  Warnings: ${warningChecks}`)
  console.log()

  const successRate = Math.round((passedChecks / totalChecks) * 100)
  console.log(`🎯 Success Rate: ${successRate}%`)

  if (successRate >= 90) {
    console.log('🎉 Excellent! Security implementation is comprehensive.')
  } else if (successRate >= 75) {
    console.log('👍 Good! Security implementation is solid with minor gaps.')
  } else if (successRate >= 50) {
    console.log('⚠️  Fair. Security implementation needs improvement.')
  } else {
    console.log('🚨 Poor. Security implementation requires significant work.')
  }

  console.log()
  console.log('🔍 For detailed security requirements, see:')
  console.log('   - .kiro/specs/kahf-ebook-store-frontend/requirements.md')
  console.log('   - .kiro/specs/kahf-ebook-store-frontend/design.md')
}

// Run validation
try {
  const results = validateSecurity()
  logValidationResults(results)
  
  // Exit with appropriate code
  const hasFailures = results.some(result => 
    result.checks.some(check => check.status === 'fail')
  )
  
  process.exit(hasFailures ? 1 : 0)
} catch (error) {
  console.error('❌ Security validation failed:', error)
  process.exit(1)
}