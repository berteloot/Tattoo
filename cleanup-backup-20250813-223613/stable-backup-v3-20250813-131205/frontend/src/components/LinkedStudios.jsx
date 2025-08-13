import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Calendar, ExternalLink, X, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

const LinkedStudios = ({ artistId, onStudioUnlinked, refreshTrigger }) => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlinkingStudio, setUnlinkingStudio] = useState(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchStudios = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/artists/${artistId}/studios`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStudios(result.data.studioArtists || []);
        } else {
          console.error('Failed to fetch studios:', result.error);
        }
      } else {
        console.error('Failed to fetch studios');
      }
    } catch (error) {
      console.error('Error fetching studios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudios();
  }, [artistId, refreshTrigger]);

  const handleUnlinkStudio = async (studioId) => {
    if (!confirm('Are you sure you want to unlink from this studio?')) {
      return;
    }

    try {
      setUnlinkingStudio(studioId);
      const response = await fetch(`/api/artists/${artistId}/studios/${studioId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          showSuccess('Studio unlinked successfully');
          setStudios(studios.filter(sa => sa.studio.id !== studioId));
          if (onStudioUnlinked) {
            onStudioUnlinked(studioId);
          }
        } else {
          showError('Failed to unlink studio', result.error);
        }
      } else {
        showError('Failed to unlink studio', 'Network error');
      }
    } catch (error) {
      console.error('Error unlinking studio:', error);
      showError('Failed to unlink studio', 'Network error');
    } finally {
      setUnlinkingStudio(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getRoleBadge = (role) => {
    const colors = {
      'OWNER': 'bg-purple-100 text-purple-800',
      'MANAGER': 'bg-blue-100 text-blue-800',
      'ARTIST': 'bg-green-100 text-green-800',
      'APPRENTICE': 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[role] || 'bg-gray-100 text-gray-800'}`}>
        {role}
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
                      <span className="flex-1">
                        {studio.address}
                        {studio.city && `, ${studio.city}`}
                        {studio.state && `, ${studio.state}`}
                        {studio.zipCode && ` ${studio.zipCode}`}
                      </span>
                      {studio.latitude && studio.longitude && (
                        <Link
                          to="/map"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View on map"
                        >
                          <MapPin className="h-3 w-3" />
                        </Link>
                      )}
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