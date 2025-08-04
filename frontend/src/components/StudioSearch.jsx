import React, { useState, useEffect } from 'react';
import { Search, Plus, MapPin, ExternalLink, CheckCircle, XCircle } from 'lucide-react';
import { studiosAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const StudioSearch = ({ onStudioLinked, currentArtistId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { showToast } = useToast();

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await studiosAPI.search(searchQuery);
      if (response.data.success) {
        setSearchResults(response.data.data.studios || []);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Studio search error:', error);
      showToast('Error searching for studios', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkToStudio = async (studio) => {
    if (!currentArtistId) {
      showToast('Artist profile not found', 'error');
      return;
    }

    setIsLinking(true);
    try {
      // Add artist to studio
      await studiosAPI.addArtist(studio.id, currentArtistId, 'ARTIST');
      
      showToast(`Successfully linked to ${studio.title}`, 'success');
      setShowResults(false);
      setSearchQuery('');
      
      // Callback to parent component
      if (onStudioLinked) {
        onStudioLinked(studio);
      }
    } catch (error) {
      console.error('Error linking to studio:', error);
      if (error.response?.data?.error) {
        showToast(error.response.data.error, 'error');
      } else {
        showToast('Error linking to studio', 'error');
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleClaimStudio = async (studio) => {
    if (!currentArtistId) {
      showToast('Artist profile not found', 'error');
      return;
    }

    setIsLinking(true);
    try {
      // Claim the studio
      await studiosAPI.claim(studio.id);
      
      showToast(`Successfully claimed ${studio.title}`, 'success');
      setShowResults(false);
      setSearchQuery('');
      
      // Callback to parent component
      if (onStudioLinked) {
        onStudioLinked(studio);
      }
    } catch (error) {
      console.error('Error claiming studio:', error);
      if (error.response?.data?.error) {
        showToast(error.response.data.error, 'error');
      } else {
        showToast('Error claiming studio', 'error');
      }
    } finally {
      setIsLinking(false);
    }
  };

  const getStudioStatus = (studio) => {
    if (studio.claimedBy) {
      return { text: 'Claimed', icon: CheckCircle, color: 'text-green-600' };
    }
    if (studio.isVerified) {
      return { text: 'Verified', icon: CheckCircle, color: 'text-blue-600' };
    }
    return { text: 'Unclaimed', icon: XCircle, color: 'text-gray-500' };
  };

  return (
    <div className="relative">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search for Your Studio
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for studio name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((studio) => {
            const status = getStudioStatus(studio);
            const StatusIcon = status.icon;
            
            return (
              <div key={studio.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{studio.title}</h3>
                      <StatusIcon className={`h-4 w-4 ${status.color}`} />
                      <span className={`text-xs ${status.color}`}>{status.text}</span>
                    </div>
                    
                    {studio.address && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {studio.address}
                          {studio.city && `, ${studio.city}`}
                          {studio.state && `, ${studio.state}`}
                        </span>
                      </div>
                    )}
                    
                    {studio._count && (
                      <p className="text-xs text-gray-500">
                        {studio._count.artists} artist{studio._count.artists !== 1 ? 's' : ''} linked
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {studio.website && (
                      <a
                        href={studio.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Visit website"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    
                    {studio.claimedBy ? (
                      <button
                        onClick={() => handleLinkToStudio(studio)}
                        disabled={isLinking}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLinking ? 'Linking...' : 'Join Studio'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleClaimStudio(studio)}
                        disabled={isLinking}
                        className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLinking ? 'Claiming...' : 'Claim Studio'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Results */}
      {showResults && searchResults.length === 0 && searchQuery.trim().length >= 2 && !isSearching && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg p-4">
          <div className="text-center text-gray-500">
            <p className="mb-2">No studios found for "{searchQuery}"</p>
            <p className="text-sm">Try a different search term or contact support to add your studio</p>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default StudioSearch; 