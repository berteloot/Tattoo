import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MapPin, ExternalLink, CheckCircle, XCircle, X } from 'lucide-react';
import { studiosAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const StudioSearch = ({ onStudioLinked, currentArtistId }) => {
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

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    title: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    phoneNumber: '',
    email: ''
  });

  const handleCreateStudio = async (studioName) => {
    // Set the studio name and show the creation form
    setCreateFormData(prev => ({ ...prev, title: studioName }));
    setShowCreateForm(true);
    setShowResults(false);
  };

  const handleCreateStudioSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!createFormData.address || !createFormData.city || !createFormData.state || !createFormData.country) {
      showError('Missing Information', 'Address, city, state, and country are required');
      return;
    }

    setIsLinking(true);
    try {
      // Create a new studio with complete information
      const newStudio = {
        title: createFormData.title,
        slug: createFormData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        address: createFormData.address,
        city: createFormData.city,
        state: createFormData.state,
        country: createFormData.country,
        phoneNumber: createFormData.phoneNumber || '',
        email: createFormData.email || '',
        website: '',
        isActive: true,
        isVerified: false,
        verificationStatus: 'PENDING'
      };

      // Create the studio
      const response = await studiosAPI.create(newStudio);
      
      if (response.data.success) {
        const createdStudio = response.data.data.studio;
        
        // If user has an artist profile, automatically claim the newly created studio
        if (currentArtistId) {
          await studiosAPI.claim(createdStudio.id);
          showSuccess(`Successfully created and claimed ${createdStudio.title}`, 'You are now the owner of this studio');
        } else {
          showSuccess(`Studio created: ${createdStudio.title}`, 'Studio will be claimed when you create your profile');
        }
        
        setShowCreateForm(false);
        setSearchQuery('');
        setCreateFormData({
          title: '',
          address: '',
          city: '',
          state: '',
          country: 'USA',
          phoneNumber: '',
          email: ''
        });
        
        // Callback to parent component
        if (onStudioLinked) {
          onStudioLinked(createdStudio);
        }
      }
    } catch (error) {
      console.error('Error creating studio:', error);
      try {
        if (error.response?.data?.error) {
          showError('Error creating studio', error.response.data.error);
        } else {
          showError('Error creating studio', 'Failed to create studio');
        }
      } catch (toastError) {
        console.error('Error showing toast:', toastError);
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
                        <span className="flex-1">
                          {studio.address}
                          {studio.city && `, ${studio.city}`}
                          {studio.state && `, ${studio.state}`}
                        </span>
                        {studio.latitude && studio.longitude && (
                          <button
                            onClick={() => window.open(`/map?lat=${studio.latitude}&lng=${studio.longitude}`, '_blank')}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="View on map"
                          >
                            <MapPin className="h-3 w-3" />
                          </button>
                        )}
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

      {/* Studio Creation Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Create New Studio</h3>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateStudioSubmit} className="space-y-4">
              {/* Studio Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Studio Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Studio name is set from your search</p>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.address}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.city}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="New York"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State/Province <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createFormData.state}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="NY"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value={createFormData.country}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="USA">United States</option>
                  <option value="Canada">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="Australia">Australia</option>
                  <option value="Germany">Germany</option>
                  <option value="France">France</option>
                  <option value="Spain">Spain</option>
                  <option value="Italy">Italy</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Austria">Austria</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Norway">Norway</option>
                  <option value="Denmark">Denmark</option>
                  <option value="Finland">Finland</option>
                  <option value="Poland">Poland</option>
                  <option value="Czech Republic">Czech Republic</option>
                  <option value="Hungary">Hungary</option>
                  <option value="Slovakia">Slovakia</option>
                  <option value="Slovenia">Slovenia</option>
                  <option value="Croatia">Croatia</option>
                  <option value="Serbia">Serbia</option>
                  <option value="Bulgaria">Bulgaria</option>
                  <option value="Romania">Romania</option>
                  <option value="Greece">Greece</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Ireland">Ireland</option>
                  <option value="Iceland">Iceland</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Liechtenstein">Liechtenstein</option>
                  <option value="Monaco">Monaco</option>
                  <option value="Andorra">Andorra</option>
                  <option value="San Marino">San Marino</option>
                  <option value="Vatican City">Vatican City</option>
                  <option value="Malta">Malta</option>
                  <option value="Cyprus">Cyprus</option>
                  <option value="Estonia">Estonia</option>
                  <option value="Latvia">Latvia</option>
                  <option value="Lithuania">Lithuania</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={createFormData.phoneNumber}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="studio@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLinking}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLinking ? 'Creating...' : 'Create Studio'}
                </button>
              </div>
            </form>
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