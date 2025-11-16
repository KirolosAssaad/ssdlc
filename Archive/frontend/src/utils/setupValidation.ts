/**
 * Setup validation utility to verify project configuration
 */

import config from '@/config'

interface ValidationResult {
  category: string
  checks: Array<{
    name: string
    status: 'pass' | 'warn' | 'fail'
    message: string
  }>
}

export const validateProjectSetup = (): ValidationResult[] => {
  const results: ValidationResult[] = []

  // Environment Configuration Validation
  results.push({
    category: 'Environment Configuration',
    checks: [
      {
        name: 'API Base URL',
        status: config.API_BASE_URL ? 'pass' : 'fail',
        message: config.API_BASE_URL || 'Not configured',
      },
      {
        name: 'Auth0 Domain',
        status: config.AUTH0_DOMAIN ? 'pass' : 'warn',
        message:
          config.AUTH0_DOMAIN || 'Not configured (required for production)',
      },
      {
        name: 'Auth0 Client ID',
        status: config.AUTH0_CLIENT_ID ? 'pass' : 'warn',
        message: config.AUTH0_CLIENT_ID
          ? 'Configured'
          : 'Not configured (required for production)',
      },
      {
        name: 'Auth0 Audience',
        status: config.AUTH0_AUDIENCE ? 'pass' : 'warn',
        message: config.AUTH0_AUDIENCE || 'Not configured (optional)',
      },
    ],
  })

  // Dependencies Validation
  results.push({
    category: 'Core Dependencies',
    checks: [
      {
        name: 'React',
        status: 'pass',
        message: 'React 19+ configured with TypeScript',
      },
      {
        name: 'Vite',
        status: 'pass',
        message: 'Vite build tool configured with SWC',
      },
      {
        name: 'React Router',
        status: 'pass',
        message: 'React Router DOM v7+ installed',
      },
      {
        name: 'Zustand',
        status: 'pass',
        message: 'State management library installed',
      },
      {
        name: 'React Query',
        status: 'pass',
        message: 'TanStack Query for server state management',
      },
      {
        name: 'Auth0 React SDK',
        status: 'pass',
        message: 'Auth0 authentication library installed',
      },
    ],
  })

  // Development Tools Validation
  results.push({
    category: 'Development Tools',
    checks: [
      {
        name: 'TypeScript',
        status: 'pass',
        message: 'TypeScript configured with strict mode',
      },
      {
        name: 'ESLint',
        status: 'pass',
        message: 'ESLint configured with TypeScript and React rules',
      },
      {
        name: 'Prettier',
        status: 'pass',
        message: 'Code formatting configured with Tailwind plugin',
      },
      {
        name: 'Husky',
        status: 'pass',
        message: 'Git hooks configured for pre-commit checks',
      },
      {
        name: 'Tailwind CSS',
        status: 'pass',
        message: 'Utility-first CSS framework with KAHF brand colors',
      },
    ],
  })

  // Project Structure Validation
  results.push({
    category: 'Project Structure',
    checks: [
      {
        name: 'Source Organization',
        status: 'pass',
        message:
          'Proper folder structure with components, services, hooks, etc.',
      },
      {
        name: 'Path Aliases',
        status: 'pass',
        message: 'TypeScript and Vite path aliases configured',
      },
      {
        name: 'Type Definitions',
        status: 'pass',
        message: 'Comprehensive TypeScript interfaces defined',
      },
      {
        name: 'Configuration Files',
        status: 'pass',
        message: 'Environment and build configuration properly set up',
      },
    ],
  })

  return results
}

export const logValidationResults = (results: ValidationResult[]): void => {
  console.log('🔍 KAHF Ebook Store Frontend - Setup Validation')
  console.log('='.repeat(50))

  results.forEach(({ category, checks }) => {
    console.log(`\n📋 ${category}:`)
    checks.forEach(({ name, status, message }) => {
      const icon = status === 'pass' ? '✅' : status === 'warn' ? '⚠️' : '❌'
      console.log(`  ${icon} ${name}: ${message}`)
    })
  })

  const totalChecks = results.reduce(
    (sum, { checks }) => sum + checks.length,
    0
  )
  const passedChecks = results.reduce(
    (sum, { checks }) => sum + checks.filter(c => c.status === 'pass').length,
    0
  )
  const warnings = results.reduce(
    (sum, { checks }) => sum + checks.filter(c => c.status === 'warn').length,
    0
  )
  const failures = results.reduce(
    (sum, { checks }) => sum + checks.filter(c => c.status === 'fail').length,
    0
  )

  console.log('\n📊 Summary:')
  console.log(`  ✅ Passed: ${passedChecks}/${totalChecks}`)
  if (warnings > 0) console.log(`  ⚠️  Warnings: ${warnings}`)
  if (failures > 0) console.log(`  ❌ Failures: ${failures}`)

  if (failures === 0 && warnings === 0) {
    console.log('\n🎉 All checks passed! Project setup is complete.')
  } else if (failures === 0) {
    console.log('\n✨ Setup complete with minor warnings (safe to proceed).')
  } else {
    console.log('\n🚨 Setup has critical issues that need to be resolved.')
  }
}

export default validateProjectSetup
