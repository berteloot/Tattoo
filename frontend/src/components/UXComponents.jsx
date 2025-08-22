import React from 'react'

export const SkipToMainContent = () => (
  <a
    href="#main-content"
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50"
  >
    Skip to main content
  </a>
)

export const ErrorBoundary = ({ children }) => {
  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      {children}
    </React.Suspense>
  )
}

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className={`${sizeClasses[size]} border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-2`}></div>
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  )
}

export const ResponsiveContainer = ({ children, className = '', maxWidth = 'max-w-7xl' }) => (
  <div className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${maxWidth} ${className}`}>
    {children}
  </div>
)

export const ResponsiveGrid = ({ children, cols = 1, className = '', gap = 'gap-6' }) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'
  }

  return (
    <div className={`grid ${gridCols[cols]} ${gap} ${className}`}>
      {children}
    </div>
  )
}

export const ResponsiveCard = ({ children, className = '', hover = true }) => (
  <div className={`bg-white border border-gray-200 rounded-lg p-4 sm:p-6 transition-all duration-200 ${
    hover ? 'hover:shadow-lg hover:border-gray-300' : ''
  } ${className}`}>
    {children}
  </div>
)

export const ResponsiveButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  fullWidth = false,
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }
  
  const widthClass = fullWidth ? 'w-full' : ''
  
  return (
    <button 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export const ResponsiveInput = ({ 
  label, 
  error, 
  className = '', 
  fullWidth = true,
  ...props 
}) => (
  <div className={fullWidth ? 'w-full' : ''}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    <input
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-500' : ''
      } ${className}`}
      {...props}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
)

export const ResponsiveSelect = ({ 
  label, 
  options, 
  error, 
  className = '', 
  fullWidth = true,
  ...props 
}) => (
  <div className={fullWidth ? 'w-full' : ''}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    <select
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
        error ? 'border-red-500' : ''
      } ${className}`}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
)

export const ResponsiveTextarea = ({ 
  label, 
  error, 
  className = '', 
  fullWidth = true,
  rows = 4,
  ...props 
}) => (
  <div className={fullWidth ? 'w-full' : ''}>
    {label && (
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
    )}
    <textarea
      rows={rows}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${
        error ? 'border-red-500' : ''
      } ${className}`}
      {...props}
    />
    {error && (
      <p className="mt-1 text-sm text-red-600">{error}</p>
    )}
  </div>
)

export const ResponsiveModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  className = '' 
}) => {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        ></div>
        
        <div className={`inline-block w-full ${sizeClasses[size]} text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle ${className}`}>
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
              >
                <span className="sr-only">Close</span>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export const ResponsiveTabs = ({ tabs, activeTab, onTabChange, className = '' }) => (
  <div className={`border-b border-gray-200 ${className}`}>
    <nav className="-mb-px flex space-x-8 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
            activeTab === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  </div>
)

export const ResponsiveBreadcrumb = ({ items, className = '' }) => (
  <nav className={`flex ${className}`} aria-label="Breadcrumb">
    <ol className="flex items-center space-x-2">
      {items.map((item, index) => (
        <li key={item.id} className="flex items-center">
          {index > 0 && (
            <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {item.href ? (
            <a
              href={item.href}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              {item.label}
            </a>
          ) : (
            <span className="text-sm font-medium text-gray-900">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
)

export const ResponsivePagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  className = '' 
}) => {
  const pages = []
  const maxVisiblePages = 5
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1)
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      
      <div className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
    </div>
  )
} 