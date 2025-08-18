import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Calendar, ExternalLink, X, CheckCircle, XCircle, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

const StudioMemberships = ({ artistId, onStudioLeft }) => {
  const [studios, setStudios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leavingStudio, setLeavingStudio] = useState(null);
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const fetchStudios = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/artists/${artistId}/studios`);
      if (response.data.success) {
        setStudios(response.data.data || []);
      } else {
        console.error('Failed to fetch studios:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching studios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudios();
  }, [artistId]);

  const handleLeaveStudio = async (studioId, studioName) => {
    if (!confirm(`Are you sure you want to leave ${studioName}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLeavingStudio(studioId);
      const response = await api.post(`/studios/${studioId}/leave`);
      
      if (response.data.success) {
        showSuccess('Studio Left', `Successfully left ${studioName}`);
        // Refresh the studios list
        await fetchStudios();
        // Notify parent component
        if (onStudioLeft) {
          onStudioLeft(studioId);
        }
      } else {
        showError('Error', response.data.error || 'Failed to leave studio');
      }
    } catch (error) {
      console.error('Error leaving studio:', error);
      const errorMessage = error.response?.data?.error || 'Failed to leave studio';
      showError('Error Leaving Studio', errorMessage);
    } finally {
      setLeavingStudio(null);
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
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (studios.length === 0) {
    return (
      <div className="text-center py-6">
        <div className="text-gray-400 mb-2">
          <MapPin className="h-12 w-12 mx-auto" />
        </div>
        <p className="text-gray-500 text-sm mb-2">No studio memberships yet</p>
        <p className="text-gray-400 text-xs">Join a studio to showcase your work and connect with clients</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {studios.map((studioArtist) => {
        const studio = studioArtist.studio;
        return (
          <div key={studioArtist.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-medium text-gray-900">{studio.title}</h3>
                  {getRoleBadge(studioArtist.role)}
                </div>
                
                {studio.address && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {studio.address}
                    {studio.city && `, ${studio.city}`}
                    {studio.state && `, ${studio.state}`}
                  </div>
                )}
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {formatDate(studioArtist.joinedAt)}
                  </div>
                  
                  {studio.isVerified && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      Verified
                    </div>
                  )}
                  
                  {studio.isFeatured && (
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-blue-500" />
                      Featured
                    </div>
                  )}
                </div>
                
                {studio.website && (
                  <div className="mb-3">
                    <a
                      href={studio.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Visit Website
                    </a>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Link
                    to={`/studios/${studio.id}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Studio Details →
                  </Link>
                  
                  {/* Only show Leave Studio button for non-owners */}
                  {studioArtist.role !== 'OWNER' && (
                    <button
                      onClick={() => handleLeaveStudio(studio.id, studio.title)}
                      disabled={leavingStudio === studio.id}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-sm font-medium hover:underline transition-colors disabled:opacity-50"
                      title={`Leave ${studio.title}`}
                    >
                      <LogOut className="w-3 h-3" />
                      {leavingStudio === studio.id ? 'Leaving...' : 'Leave Studio'}
                    </button>
                  )}
                  
                  {/* Show message for owners */}
                  {studioArtist.role === 'OWNER' && (
                    <span className="text-xs text-gray-500 italic">
                      Studio owners cannot leave - transfer ownership first
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StudioMemberships;
