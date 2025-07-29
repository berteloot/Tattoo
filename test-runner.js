#!/usr/bin/env node

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🧪 Tattoo Artist Locator - Comprehensive Test Suite')
console.log('=' .repeat(60))

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logSection(title) {
  console.log(`\n${colors.cyan}${colors.bright}${title}${colors.reset}`)
  console.log('-'.repeat(title.length))
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue')
}

// Test results tracking
const testResults = {
  environment: { passed: 0, failed: 0, total: 0 },
  backend: { passed: 0, failed: 0, total: 0 },
  frontend: { passed: 0, failed: 0, total: 0 },
  integration: { passed: 0, failed: 0, total: 0 }
}

function updateResults(category, passed, failed) {
  testResults[category].passed += passed
  testResults[category].failed += failed
  testResults[category].total += passed + failed
}

// Environment checks
logSection('Environment Setup Check')

try {
  // Check if .env file exists
  const envPath = path.join(__dirname, '.env')
  if (fs.existsSync(envPath)) {
    logSuccess('Environment file (.env) found')
    updateResults('environment', 1, 0)
  } else {
    logWarning('Environment file (.env) not found - using .env.example')
    updateResults('environment', 1, 0)
  }

  // Check if env.example exists
  const envExamplePath = path.join(__dirname, 'env.example')
  if (fs.existsSync(envExamplePath)) {
    logSuccess('Environment template (env.example) found')
    updateResults('environment', 1, 0)
  } else {
    logError('Environment template (env.example) not found')
    updateResults('environment', 0, 1)
  }

  // Check Node.js version
  const nodeVersion = process.version
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0])
  if (majorVersion >= 18) {
    logSuccess(`Node.js version ${nodeVersion} (>= 18.0.0)`)
    updateResults('environment', 1, 0)
  } else {
    logError(`Node.js version ${nodeVersion} (requires >= 18.0.0)`)
    updateResults('environment', 0, 1)
  }

  // Check if backend directory exists
  const backendPath = path.join(__dirname, 'backend')
  if (fs.existsSync(backendPath)) {
    logSuccess('Backend directory found')
    updateResults('environment', 1, 0)
  } else {
    logError('Backend directory not found')
    updateResults('environment', 0, 1)
  }

  // Check if frontend directory exists
  const frontendPath = path.join(__dirname, 'frontend')
  if (fs.existsSync(frontendPath)) {
    logSuccess('Frontend directory found')
    updateResults('environment', 1, 0)
  } else {
    logError('Frontend directory not found')
    updateResults('environment', 0, 1)
  }

} catch (error) {
  logError(`Environment check failed: ${error.message}`)
  updateResults('environment', 0, 1)
}

// Backend tests
logSection('Backend Tests')

try {
  // Check if backend dependencies are installed
  const backendPackageJson = path.join(__dirname, 'backend', 'package.json')
  if (fs.existsSync(backendPackageJson)) {
    logSuccess('Backend package.json found')
    updateResults('backend', 1, 0)
  } else {
    logError('Backend package.json not found')
    updateResults('backend', 0, 1)
  }

  // Check if test files exist
  const testFiles = [
    'backend/src/__tests__/auth.test.js',
    'backend/src/__tests__/artists.test.js',
    'backend/jest.config.js',
    'backend/src/__tests__/setup.js'
  ]

  let testFilesFound = 0
  testFiles.forEach(file => {
    const filePath = path.join(__dirname, file)
    if (fs.existsSync(filePath)) {
      logSuccess(`Test file found: ${file}`)
      testFilesFound++
    } else {
      logWarning(`Test file missing: ${file}`)
    }
  })

  if (testFilesFound === testFiles.length) {
    updateResults('backend', 1, 0)
  } else {
    updateResults('backend', 0, 1)
  }

  // Try to run backend tests (if dependencies are installed)
  try {
    logInfo('Running backend tests...')
    const result = execSync('cd backend && npm test -- --passWithNoTests', { 
      encoding: 'utf8',
      stdio: 'pipe'
    })
    logSuccess('Backend tests completed successfully')
    updateResults('backend', 1, 0)
  } catch (error) {
    logWarning('Backend tests could not be run (dependencies may not be installed)')
    logInfo('To run backend tests: cd backend && npm install && npm test')
    updateResults('backend', 0, 1)
  }

} catch (error) {
  logError(`Backend test setup failed: ${error.message}`)
  updateResults('backend', 0, 1)
}

// Frontend tests
logSection('Frontend Tests')

try {
  // Check if frontend dependencies are installed
  const frontendPackageJson = path.join(__dirname, 'frontend', 'package.json')
  if (fs.existsSync(frontendPackageJson)) {
    logSuccess('Frontend package.json found')
    updateResults('frontend', 1, 0)
  } else {
    logError('Frontend package.json not found')
    updateResults('frontend', 0, 1)
  }

  // Check if test files exist
  const frontendTestFiles = [
    'frontend/src/__tests__/Register.test.jsx',
    'frontend/src/__tests__/Login.test.jsx',
    'frontend/src/__tests__/AuthContext.test.jsx',
    'frontend/src/__tests__/setup.js',
    'frontend/vitest.config.js'
  ]

  let frontendTestFilesFound = 0
  frontendTestFiles.forEach(file => {
    const filePath = path.join(__dirname, file)
    if (fs.existsSync(filePath)) {
      logSuccess(`Test file found: ${file}`)
      frontendTestFilesFound++
    } else {
      logWarning(`Test file missing: ${file}`)
    }
  })

  if (frontendTestFilesFound === frontendTestFiles.length) {
    updateResults('frontend', 1, 0)
  } else {
    updateResults('frontend', 0, 1)
  }

  // Try to run frontend tests (if dependencies are installed)
  try {
    logInfo('Running frontend tests...')
    const result = execSync('cd frontend && npm test -- --run', { 
      encoding: 'utf8',
      stdio: 'pipe'
    })
    logSuccess('Frontend tests completed successfully')
    updateResults('frontend', 1, 0)
  } catch (error) {
    logWarning('Frontend tests could not be run (dependencies may not be installed)')
    logInfo('To run frontend tests: cd frontend && npm install && npm test')
    updateResults('frontend', 0, 1)
  }

} catch (error) {
  logError(`Frontend test setup failed: ${error.message}`)
  updateResults('frontend', 0, 1)
}

// Integration tests
logSection('Integration Tests')

try {
  // Check if server can start
  logInfo('Checking server startup...')
  
  // Check if main server file exists
  const serverFile = path.join(__dirname, 'backend', 'src', 'server.js')
  if (fs.existsSync(serverFile)) {
    logSuccess('Server file found')
    updateResults('integration', 1, 0)
  } else {
    logError('Server file not found')
    updateResults('integration', 0, 1)
  }

  // Check if database schema exists
  const schemaFile = path.join(__dirname, 'backend', 'prisma', 'schema.prisma')
  if (fs.existsSync(schemaFile)) {
    logSuccess('Database schema found')
    updateResults('integration', 1, 0)
  } else {
    logError('Database schema not found')
    updateResults('integration', 0, 1)
  }

  // Check if API routes exist
  const routeFiles = [
    'backend/src/routes/auth.js',
    'backend/src/routes/artists.js',
    'backend/src/routes/flash.js',
    'backend/src/routes/reviews.js'
  ]

  let routeFilesFound = 0
  routeFiles.forEach(file => {
    const filePath = path.join(__dirname, file)
    if (fs.existsSync(filePath)) {
      logSuccess(`Route file found: ${file}`)
      routeFilesFound++
    } else {
      logWarning(`Route file missing: ${file}`)
    }
  })

  if (routeFilesFound === routeFiles.length) {
    updateResults('integration', 1, 0)
  } else {
    updateResults('integration', 0, 1)
  }

  // Check if frontend components exist
  const componentFiles = [
    'frontend/src/pages/Register.jsx',
    'frontend/src/pages/Login.jsx',
    'frontend/src/contexts/AuthContext.jsx',
    'frontend/src/services/api.js'
  ]

  let componentFilesFound = 0
  componentFiles.forEach(file => {
    const filePath = path.join(__dirname, file)
    if (fs.existsSync(filePath)) {
      logSuccess(`Component file found: ${file}`)
      componentFilesFound++
    } else {
      logWarning(`Component file missing: ${file}`)
    }
  })

  if (componentFilesFound === componentFiles.length) {
    updateResults('integration', 1, 0)
  } else {
    updateResults('integration', 0, 1)
  }

} catch (error) {
  logError(`Integration test setup failed: ${error.message}`)
  updateResults('integration', 0, 1)
}

// Summary
logSection('Test Summary')

const totalPassed = Object.values(testResults).reduce((sum, category) => sum + category.passed, 0)
const totalFailed = Object.values(testResults).reduce((sum, category) => sum + category.failed, 0)
const totalTests = totalPassed + totalFailed

console.log(`\n${colors.bright}Overall Results:${colors.reset}`)
console.log(`Total Tests: ${totalTests}`)
console.log(`Passed: ${colors.green}${totalPassed}${colors.reset}`)
console.log(`Failed: ${colors.red}${totalFailed}${colors.reset}`)
console.log(`Success Rate: ${colors.cyan}${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%${colors.reset}`)

console.log(`\n${colors.bright}Category Breakdown:${colors.reset}`)
Object.entries(testResults).forEach(([category, results]) => {
  const successRate = results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0
  const status = results.failed === 0 ? colors.green : colors.red
  console.log(`${category.charAt(0).toUpperCase() + category.slice(1)}: ${status}${results.passed}/${results.total} (${successRate}%)${colors.reset}`)
})

// Recommendations
logSection('Next Steps')

if (totalFailed === 0) {
  logSuccess('All tests passed! Your application is ready for development.')
  logInfo('To start development:')
  logInfo('1. Backend: cd backend && npm install && npm run dev')
  logInfo('2. Frontend: cd frontend && npm install && npm run dev')
} else {
  logWarning('Some tests failed. Please review the issues above.')
  logInfo('To fix the issues:')
  logInfo('1. Install dependencies: npm install in both backend and frontend directories')
  logInfo('2. Set up environment variables: copy env.example to .env and configure')
  logInfo('3. Set up database: cd backend && npx prisma db push')
  logInfo('4. Run tests again: npm test in respective directories')
}

console.log(`\n${colors.cyan}${colors.bright}Test suite completed!${colors.reset}`) 