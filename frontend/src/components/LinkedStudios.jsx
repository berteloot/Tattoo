import React, { useState, useEffect } from 'react';
import { MapPin, ExternalLink, Users, Calendar, X } from 'lucide-react';
import { artistsAPI, studiosAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const LinkedStudios = ({ artistId, onStudioUnlinked, refreshTrigger }) => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlinkingStudio, setUnlinkingStudio] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (artistId) {
      fetchStudios();
    }
  }, [artistId, refreshTrigger]);

  const fetchStudios = async () => {
    if (!artistId) return;

    setLoading(true);
    try {
      const response = await artistsAPI.getStudios(artistId);
      if (response.data.success) {
        setStudios(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching artist studios:', error);
      showToast('Error loading studios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkStudio = async (studioId) => {
    setUnlinkingStudio(studioId);
    try {
      // Leave the studio
      await studiosAPI.leaveStudio(studioId);
      
      // Remove from local state
      setStudios(prev => prev.filter(sa => sa.studio.id !== studioId));
      showToast('Successfully left the studio', 'success');
      
      if (onStudioUnlinked) {
        onStudioUnlinked(studioId);
      }
    } catch (error) {
      console.error('Error leaving studio:', error);
      if (error.response?.data?.error) {
        showToast(error.response.data.error, 'error');
      } else {
        showToast('Error leaving studio', 'error');
      }
    } finally {
      setUnlinkingStudio(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      OWNER: { color: 'bg-red-100 text-red-800', label: 'Owner' },
      MANAGER: { color: 'bg-orange-100 text-orange-800', label: 'Manager' },
      ARTIST: { color: 'bg-blue-100 text-blue-800', label: 'Artist' },
      GUEST: { color: 'bg-gray-100 text-gray-800', label: 'Guest' }
    };
    
    const config = roleConfig[role] || roleConfig.ARTIST;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Linked Studios</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (studios.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Linked Studios</h3>
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 mb-2">No studios linked yet</p>
          <p className="text-sm text-gray-400">Search for and link to your studio to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Linked Studios</h3>
      
      <div className="space-y-4">
        {studios.map((studioArtist) => {
          const studio = studioArtist.studio;
          
          return (
            <div key={studio.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{studio.title}</h4>
                    {getRoleBadge(studioArtist.role)}
                  </div>
                  
                  {studio.address && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                      <MapPin className="h-3 w-3" />
                      <span>
                        {studio.address}
                        {studio.city && `, ${studio.city}`}
                        {studio.state && `, ${studio.state}`}
                        {studio.zipCode && ` ${studio.zipCode}`}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {formatDate(studioArtist.joinedAt)}</span>
                    </div>
                    
                    {studio.isVerified && (
                      <span className="text-green-600 font-medium">✓ Verified</span>
                    )}
                    
                    {studio.isFeatured && (
                      <span className="text-blue-600 font-medium">★ Featured</span>
                    )}
                  </div>
                  
                  {studio.website && (
                    <div className="mt-2">
                      <a
                        href={studio.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  {studioArtist.role !== 'OWNER' && (
                    <button
                      onClick={() => handleUnlinkStudio(studio.id)}
                      disabled={unlinkingStudio === studio.id}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Unlink from studio"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LinkedStudios; 