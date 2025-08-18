import { useEffect } from 'react'

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
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)
    
    return () => {
      // Cleanup script when component unmounts
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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