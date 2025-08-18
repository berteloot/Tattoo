import React from 'react';
import { MapPin, AlertTriangle, RefreshCw } from 'lucide-react';

class GoogleMapsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Google Maps Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    // Force a re-render of the map component
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI for Google Maps errors
      return (
        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Map Loading Error
            </h3>
            <p className="text-gray-600 mb-4">
              There was an issue loading the Google Maps component. This usually happens when the map API isn't ready yet.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Loading Map</span>
              </button>
              
              <div className="text-xs text-gray-500">
                <p>If the problem persists, try:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Refreshing the page</li>
                  <li>Checking your internet connection</li>
                  <li>Waiting a few moments before retrying</li>
                </ul>
              </div>
            </div>
            
            {/* Show fallback content if provided */}
            {this.props.fallback && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-700 mb-2">Alternative View:</h4>
                {this.props.fallback}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GoogleMapsErrorBoundary;
