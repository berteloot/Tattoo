import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Share2, ArrowLeft, Star, Clock, MapPin, Tag, DollarSign, Calendar, User, Mail, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

const FlashDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error, warning, success, info } = useToast();

  const [flashItem, setFlashItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  useEffect(() => {
    fetchFlashItem();
  }, [id]);

  const fetchFlashItem = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/flash/${id}`);
      
      if (response.data.success) {
        setFlashItem(response.data.data.flash);
      } else {
        error('Error', 'Failed to load flash item');
        navigate('/flash');
      }
    } catch (err) {
      console.error('Error fetching flash item:', err);
      error('Error', 'Failed to load flash item');
      navigate('/flash');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: flashItem.title,
          text: flashItem.description || `Check out this flash design by ${flashItem.artist.user.firstName} ${flashItem.artist.user.lastName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        success('Success', 'Link copied to clipboard!');
      } catch (error) {
        error('Error', 'Failed to copy link');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flash design...</p>
        </div>
      </div>
    );
  }

  if (!flashItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-4">🎨</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Flash Design Not Found</h1>
          <p className="text-gray-600 mb-6">The flash design you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/flash')}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Flash Gallery</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleShare}
                className="inline-flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="relative aspect-square cursor-pointer" onClick={() => setImageViewerOpen(true)}>
                <img
                  src={flashItem.imageUrl}
                  alt={flashItem.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 text-white font-medium">
                    Click to enlarge
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {flashItem.tags && flashItem.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {flashItem.tags.map((tag, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Title and Artist */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{flashItem.title}</h1>
              
              {flashItem.description && (
                <p className="text-gray-600 text-lg mb-6">{flashItem.description}</p>
              )}

              {/* Artist Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {flashItem.artist.user.firstName} {flashItem.artist.user.lastName}
                  </p>
                  <Link
                    to={`/artists/${flashItem.artist.id}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm hover:underline transition-colors"
                  >
                    View Artist Profile →
                  </Link>
                </div>
              </div>
            </div>

            {/* Pricing and Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
              
              <div className="space-y-4">
                {flashItem.basePrice && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span className="text-2xl font-bold text-indigo-600">${flashItem.basePrice}</span>
                  </div>
                )}

                {flashItem.complexity && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Complexity</span>
                    <span className="text-gray-900 font-medium capitalize">{flashItem.complexity.toLowerCase()}</span>
                  </div>
                )}

                {flashItem.timeEstimate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estimated Time</span>
                    <span className="text-gray-900 font-medium">{flashItem.timeEstimate} minutes</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Repeatable</span>
                  <span className="text-gray-900 font-medium">
                    {flashItem.isRepeatable ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Available</span>
                  <span className={`font-medium ${flashItem.isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                    {flashItem.isAvailable ? 'Yes' : 'No'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(flashItem.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Get This Design</h3>
              
              <div className="space-y-4">
                <p className="text-gray-600">
                  Interested in getting this flash design? Contact the artist to discuss details and book your session.
                </p>
                
                <div className="flex space-x-3">
                  <Link
                    to={`/artists/${flashItem.artist.id}`}
                    className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>View Artist Profile</span>
                  </Link>
                  
                  {flashItem.artist.user.email && (
                    <button
                      onClick={() => {
                        const subject = encodeURIComponent(`Flash Design: ${flashItem.title}`);
                        const body = encodeURIComponent(`Hi ${flashItem.artist.user.firstName},\n\nI'm interested in your flash design "${flashItem.title}". Could you tell me more about availability and pricing?\n\nThanks!`);
                        window.open(`mailto:${flashItem.artist.user.email}?subject=${subject}&body=${body}`);
                      }}
                      className="flex-1 inline-flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Mail className="w-5 h-5" />
                      <span>Email Artist</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setImageViewerOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={flashItem.imageUrl}
              alt={flashItem.title}
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setImageViewerOpen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashDetail;
