#!/usr/bin/env tsx

/**
 * Setup validation script for KAHF Ebook Store Frontend
 * Run with: pnpm tsx scripts/validate-setup.ts
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

interface ValidationResult {
  category: string
  checks: Array<{
    name: string
    status: 'pass' | 'warn' | 'fail'
    message: string
  }>
}

const validateProjectSetup = (): ValidationResult[] => {
  const results: ValidationResult[] = []

  // Check if .env.local exists and read it
  const envLocalPath = join(process.cwd(), '.env.local')
  const envExamplePath = join(process.cwd(), '.env.example')

  const envVars: Record<string, string> = {}

  if (existsSync(envLocalPath)) {
    const envContent = readFileSync(envLocalPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        envVars[key.trim()] = value.trim()
      }
    })
  }

  // Environment Configuration Validation
  results.push({
    category: 'Environment Configuration',
    checks: [
      {
        name: 'API Base URL',
        status: envVars.VITE_API_BASE_URL ? 'pass' : 'pass',
        message:
          envVars.VITE_API_BASE_URL || 'Using default: http://localhost:8000',
      },
      {
        name: 'Auth0 Domain',
        status: envVars.VITE_AUTH0_DOMAIN ? 'pass' : 'warn',
        message:
          envVars.VITE_AUTH0_DOMAIN ||
          'Not configured (required for production)',
      },
      {
        name: 'Auth0 Client ID',
        status: envVars.VITE_AUTH0_CLIENT_ID ? 'pass' : 'warn',
        message: envVars.VITE_AUTH0_CLIENT_ID
          ? 'Configured'
          : 'Not configured (required for production)',
      },
      {
        name: 'Environment Files',
        status:
          existsSync(envLocalPath) && existsSync(envExamplePath)
            ? 'pass'
            : 'warn',
        message: existsSync(envLocalPath)
          ? '.env.local exists'
          : '.env.local missing (copy from .env.example)',
      },
    ],
  })

  // Check package.json dependencies
  const packageJsonPath = join(process.cwd(), 'package.json')
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }

  // Dependencies Validation
  results.push({
    category: 'Core Dependencies',
    checks: [
      {
        name: 'React',
        status: deps.react ? 'pass' : 'fail',
        message: deps.react ? `React ${deps.react}` : 'Not installed',
      },
      {
        name: 'Vite',
        status: deps.vite ? 'pass' : 'fail',
        message: deps.vite ? `Vite ${deps.vite}` : 'Not installed',
      },
      {
        name: 'React Router',
        status: deps['react-router-dom'] ? 'pass' : 'fail',
        message: deps['react-router-dom']
          ? `React Router ${deps['react-router-dom']}`
          : 'Not installed',
      },
      {
        name: 'Zustand',
        status: deps.zustand ? 'pass' : 'fail',
        message: deps.zustand ? `Zustand ${deps.zustand}` : 'Not installed',
      },
      {
        name: 'React Query',
        status: deps['@tanstack/react-query'] ? 'pass' : 'fail',
        message: deps['@tanstack/react-query']
          ? `TanStack Query ${deps['@tanstack/react-query']}`
          : 'Not installed',
      },
      {
        name: 'Auth0 React SDK',
        status: deps['@auth0/auth0-react'] ? 'pass' : 'fail',
        message: deps['@auth0/auth0-react']
          ? `Auth0 React ${deps['@auth0/auth0-react']}`
          : 'Not installed',
      },
    ],
  })

  // Development Tools Validation
  results.push({
    category: 'Development Tools',
    checks: [
      {
        name: 'TypeScript',
        status: deps.typescript ? 'pass' : 'fail',
        message: deps.typescript
          ? `TypeScript ${deps.typescript}`
          : 'Not installed',
      },
      {
        name: 'ESLint',
        status: deps.eslint ? 'pass' : 'fail',
        message: deps.eslint ? `ESLint ${deps.eslint}` : 'Not installed',
      },
      {
        name: 'Prettier',
        status: deps.prettier ? 'pass' : 'fail',
        message: deps.prettier ? `Prettier ${deps.prettier}` : 'Not installed',
      },
      {
        name: 'Husky',
        status: deps.husky ? 'pass' : 'fail',
        message: deps.husky ? `Husky ${deps.husky}` : 'Not installed',
      },
      {
        name: 'Tailwind CSS',
        status: deps.tailwindcss ? 'pass' : 'fail',
        message: deps.tailwindcss
          ? `Tailwind CSS ${deps.tailwindcss}`
          : 'Not installed',
      },
    ],
  })

  // Project Structure Validation
  const requiredFiles = [
    'src/components/index.ts',
    'src/services/index.ts',
    'src/hooks/index.ts',
    'src/types/index.ts',
    'src/utils/index.ts',
    'src/store/index.ts',
    'src/config/index.ts',
    'vite.config.ts',
    'tailwind.config.js',
    'tsconfig.json',
    'eslint.config.js',
    '.prettierrc',
  ]

  results.push({
    category: 'Project Structure',
    checks: requiredFiles.map(file => ({
      name: file,
      status: existsSync(join(process.cwd(), file)) ? 'pass' : 'fail',
      message: existsSync(join(process.cwd(), file)) ? 'Exists' : 'Missing',
    })),
  })

  return results
}

const logValidationResults = (results: ValidationResult[]): void => {
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

const main = () => {
  try {
    const results = validateProjectSetup()
    logValidationResults(results)

    // Exit with appropriate code
    const hasFailures = results.some(({ checks }) =>
      checks.some(check => check.status === 'fail')
    )

    process.exit(hasFailures ? 1 : 0)
  } catch (error) {
    console.error('❌ Validation failed:', error)
    process.exit(1)
  }
}

main()
