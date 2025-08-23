import { useEffect, useState } from 'react'

/**
 * Calendly Widget Component
 * Embeds a Calendly booking widget for artist appointment scheduling
 * 
 * @param {Object} props
 * @param {string} props.calendlyUrl - The Calendly URL for the artist
 * @param {string} props.artistName - The artist's name for the widget title
 * @param {string} props.className - Additional CSS classes
 */
export const CalendlyWidget = ({ calendlyUrl, artistName, className = '' }) => {
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [scriptError, setScriptError] = useState(false)

  useEffect(() => {
    // Check if Calendly script is already loaded
    if (window.Calendly) {
      setScriptLoaded(true)
      return
    }

    // Check if script loading is blocked by CSP
    const testScript = document.createElement('script')
    testScript.src = 'https://assets.calendly.com/assets/external/widget.js'
    testScript.async = true
    
    // Try to load the script
    let scriptLoadedSuccessfully = false
    
    testScript.onload = () => {
      console.log('✅ Calendly script loaded successfully')
      scriptLoadedSuccessfully = true
      setScriptLoaded(true)
      setScriptError(false)
    }
    
    testScript.onerror = () => {
      console.error('❌ Failed to load Calendly script - likely blocked by CSP')
      setScriptError(true)
      setScriptLoaded(false)
    }
    
    // Set a timeout to detect CSP blocking
    const timeout = setTimeout(() => {
      if (!scriptLoadedSuccessfully) {
        console.warn('⚠️ Calendly script loading timed out - likely blocked by CSP')
        setScriptError(true)
        setScriptLoaded(false)
      }
    }, 5000) // 5 second timeout
    
    document.body.appendChild(testScript)
    
    return () => {
      clearTimeout(timeout)
      // Cleanup test script when component unmounts
      const existingScript = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]')
      if (existingScript) {
        document.body.removeChild(existingScript)
      }
    }
  }, [])

  if (!calendlyUrl) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <div className="text-gray-500 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Book Appointment</h3>
        <p className="text-gray-600 text-sm">
          {artistName ? `${artistName} hasn't set up online booking yet.` : 'Online booking not available.'}
        </p>
        <p className="text-gray-500 text-xs mt-2">Contact the artist directly to schedule your appointment.</p>
      </div>
    )
  }

  if (scriptError) {
    return (
      <div className={`bg-red-50 rounded-lg p-6 text-center ${className}`}>
        <div className="text-red-500 mb-2">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-red-900 mb-2">Booking Widget Error</h3>
        <p className="text-red-600 text-sm mb-2">
          Unable to load the online booking widget.
        </p>
        <a 
          href={calendlyUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
        >
          Book on Calendly
        </a>
        <p className="text-red-500 text-xs mt-2">
          You can also contact the artist directly to schedule your appointment.
        </p>
      </div>
    )
  }

  if (!scriptLoaded) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <div className="text-gray-500 mb-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Booking Widget</h3>
        <p className="text-gray-600 text-sm">
          Setting up your appointment scheduling...
        </p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Book Appointment</h3>
        <p className="text-sm text-gray-600">
          Schedule your consultation with {artistName || 'this artist'}
        </p>
      </div>
      <div className="p-4">
        <div 
          className="calendly-inline-widget" 
          data-url={calendlyUrl}
          style={{ 
            minWidth: '320px', 
            height: '700px',
            width: '100%'
          }}
        />
      </div>
    </div>
  )
}

export default CalendlyWidget 