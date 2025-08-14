import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, MapPin, ExternalLink, CheckCircle, XCircle, Globe } from 'lucide-react';
import { studiosAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const StudioSearch = ({ onStudioLinked, currentArtistId }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { error: showError, success: showSuccess } = useToast();

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
      showError('Error searching for studios', 'Failed to search for studios');
    } finally {
      setIsSearching(false);
    }
  };

  const handleLinkToStudio = async (studio) => {
    setIsLinking(true);
    try {
      // If user has an artist profile, link them to the studio
      if (currentArtistId) {
        await studiosAPI.addArtist(studio.id, currentArtistId, 'ARTIST');
        showSuccess(`Successfully linked to ${studio.title}`, 'You are now a member of this studio');
      } else {
        // For new users, just store the studio info for profile creation
        showSuccess(`Studio selected: ${studio.title}`, 'Studio will be linked when you create your profile');
      }
      
      setShowResults(false);
      setSearchQuery('');
      
      // Callback to parent component
      if (onStudioLinked) {
        onStudioLinked(studio);
      }
    } catch (error) {
      console.error('Error linking to studio:', error);
      try {
        if (error.response?.data?.error) {
          showError('Error linking to studio', error.response.data.error);
        } else {
          showError('Error linking to studio', 'Failed to link to studio');
        }
      } catch (toastError) {
        console.error('Error showing toast:', toastError);
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleClaimStudio = async (studio) => {
    setIsLinking(true);
    try {
      // If user has an artist profile, claim the studio
      if (currentArtistId) {
        await studiosAPI.claim(studio.id);
        showSuccess(`Successfully claimed ${studio.title}`, 'You are now the owner of this studio');
      } else {
        // For new users, just store the studio info for profile creation
        showSuccess(`Studio selected: ${studio.title}`, 'Studio will be claimed when you create your profile');
      }
      
      setShowResults(false);
      setSearchQuery('');
      
      // Callback to parent component
      if (onStudioLinked) {
        onStudioLinked(studio);
      }
    } catch (error) {
      console.error('Error claiming studio:', error);
      try {
        if (error.response?.data?.error) {
          showError('Error claiming studio', error.response.data.error);
        } else {
          showError('Error claiming studio', 'Failed to claim studio');
        }
      } catch (toastError) {
        console.error('Error showing toast:', toastError);
      }
    } finally {
      setIsLinking(false);
    }
  };

  const handleCreateStudio = async (studioName) => {
    console.log('🎯 handleCreateStudio called with:', studioName);
    // Redirect to dedicated studio creation page with pre-filled studio name
    navigate('/create-studio', { 
      state: { 
        prefillStudioName: studioName 
      } 
    });
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
            placeholder="Search for your studio name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Search Results */}
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {searchResults.map((studio) => {
            const status = getStudioStatus(studio);
            return (
              <div key={studio.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-gray-900">{studio.title}</h3>
                      <span className={`inline-flex items-center gap-1 text-xs ${status.color}`}>
                        <status.icon className="h-3 w-3" />
                        {status.text}
                      </span>
                    </div>
                    {studio.address && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{studio.address}, {studio.city}, {studio.state}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {studio.website && (
                        <a
                          href={studio.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Globe className="h-3 w-3" />
                          Website
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {studio.claimedBy ? (
                      <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        Already Claimed
                      </span>
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
            <p className="mb-3">No studios found for "{searchQuery}"</p>
            <div className="space-y-3">
              <p className="text-sm">Would you like to create this studio?</p>
              <button
                onClick={() => handleCreateStudio(searchQuery)}
                disabled={isLinking}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                {isLinking ? 'Creating...' : 'Create Studio'}
              </button>
            </div>
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
