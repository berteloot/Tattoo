import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube,
  Users,
  Calendar,
  Star,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api, studiosAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

const StudioDetail = () => {
  const { id } = useParams();
  const [studio, setStudio] = useState(null);
  const [studioArtists, setStudioArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchStudio();
  }, [id]);

  const fetchStudio = async () => {
    try {
      setLoading(true);
      const [studioResponse, artistsResponse] = await Promise.all([
        api.get(`/studios/${id}`),
        studiosAPI.getArtists(id)
      ]);
      
      setStudio(studioResponse.data.data);
      setStudioArtists(artistsResponse.data.data);
    } catch (error) {
      console.error('Failed to fetch studio:', error);
      showToast('Failed to load studio details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimStudio = async () => {
    try {
      await api.post(`/studios/${id}/claim`);
      showToast('Studio claim request submitted successfully!', 'success');
      fetchStudio(); // Refresh studio data
    } catch (error) {
      console.error('Failed to claim studio:', error);
      showToast(error.response?.data?.error || 'Failed to claim studio', 'error');
    }
  };

  const getSocialIcon = (platform, url) => {
    if (!url) return null;
    
    const icons = {
      facebook: <Facebook className="w-5 h-5" />,
      instagram: <Instagram className="w-5 h-5" />,
      twitter: <Twitter className="w-5 h-5" />,
      linkedin: <Linkedin className="w-5 h-5" />,
      youtube: <Youtube className="w-5 h-5" />
    };
    
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full hover:bg-blue-100 transition-colors"
        title={`Visit ${platform}`}
      >
        {icons[platform.toLowerCase()]}
      </a>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!studio) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Studio Not Found</h1>
          <p className="text-gray-600 mb-6">The studio you're looking for doesn't exist.</p>
          <Link
            to="/studios"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Studios
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/studios"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Studios
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{studio.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600">
              {studio.city && studio.state && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {studio.city}, {studio.state}
                </div>
              )}
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {studioArtists.length} artists
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {studio.isVerified && (
              <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                Verified
              </span>
            )}
            {studio.isFeatured && (
              <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                Featured
              </span>
            )}
            {studio.claimedBy && (
              <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                Claimed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-3">
              {studio.phoneNumber && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <a href={`tel:${studio.phoneNumber}`} className="text-blue-600 hover:text-blue-800">
                    {studio.phoneNumber}
                  </a>
                </div>
              )}
              {studio.email && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <a href={`mailto:${studio.email}`} className="text-blue-600 hover:text-blue-800">
                    {studio.email}
                  </a>
                </div>
              )}
              {studio.website && (
                <div className="flex items-center">
                  <ExternalLink className="w-5 h-5 text-gray-400 mr-3" />
                  <a 
                    href={studio.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Visit Website
                  </a>
                </div>
              )}
              {studio.address && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-gray-900">{studio.address}</p>
                    {studio.city && studio.state && (
                      <p className="text-gray-600">{studio.city}, {studio.state} {studio.zipCode}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Artists */}
          {studioArtists && studioArtists.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Artists</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studioArtists.map((studioArtist) => (
                  <div key={studioArtist.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {studioArtist.artist.user.firstName} {studioArtist.artist.user.lastName}
                      </h3>
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {studioArtist.role}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {new Date(studioArtist.joinedAt).toLocaleDateString()}
                    </div>
                    {studioArtist.artist.specialties && studioArtist.artist.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {studioArtist.artist.specialties.slice(0, 3).map((specialty) => (
                          <span 
                            key={specialty.id} 
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                          >
                            {specialty.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link
                      to={`/artists/${studioArtist.artist.id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                    >
                      View Profile →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Claim Studio */}
          {user?.role === 'ARTIST' && !studio.claimedBy && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Claim This Studio</h3>
              <p className="text-blue-700 mb-4">
                Are you an artist at this studio? Claim ownership to manage the studio profile and add other artists.
              </p>
              <button
                onClick={handleClaimStudio}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Claim Studio
              </button>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Social Media */}
          {(studio.facebookUrl || studio.instagramUrl || studio.twitterUrl || studio.linkedinUrl || studio.youtubeUrl) && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
              <div className="flex space-x-3">
                {getSocialIcon('facebook', studio.facebookUrl)}
                {getSocialIcon('instagram', studio.instagramUrl)}
                {getSocialIcon('twitter', studio.twitterUrl)}
                {getSocialIcon('linkedin', studio.linkedinUrl)}
                {getSocialIcon('youtube', studio.youtubeUrl)}
              </div>
            </div>
          )}

          {/* Studio Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Studio Information</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="ml-2 font-medium">
                  {studio.verificationStatus === 'APPROVED' ? 'Approved' : 
                   studio.verificationStatus === 'PENDING' ? 'Pending Verification' : 
                   studio.verificationStatus === 'REJECTED' ? 'Rejected' : 'Unknown'}
                </span>
              </div>
              {studio.claimedBy && studio.claimedByUser && (
                <div>
                  <span className="text-gray-600">Claimed by:</span>
                  <span className="ml-2 font-medium">
                    {studio.claimedByUser.firstName} {studio.claimedByUser.lastName}
                  </span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2 font-medium">
                  {new Date(studio.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudioDetail; 