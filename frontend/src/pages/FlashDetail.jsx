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
      console.log('🔍 Fetching flash item with ID:', id);
      const response = await api.get(`/flash/${id}`);
      
      console.log('🔍 Flash API response:', response.data);
      
      if (response.data.success) {
        setFlashItem(response.data.data.flash);
        console.log('✅ Flash item set:', response.data.data.flash);
      } else {
        console.error('❌ Flash API returned success: false');
        error('Error', 'Failed to load flash item');
        navigate('/flash');
      }
    } catch (err) {
      console.error('❌ Error fetching flash item:', err);
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
    console.log('❌ Flash item is null/undefined');
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

  console.log('🎨 Rendering FlashDetail with item:', flashItem);

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
            {/* Flash Image */}
            <div className="bg-white border-2 border-black overflow-hidden">
              <img
                src={flashItem.imageUrl}
                alt={flashItem.title}
                className="w-full h-auto max-h-96 object-cover"
              />
            </div>

            {/* Tags and Style */}
            <div className="bg-white border-2 border-black p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{flashItem.title}</h1>
                <p className="text-gray-600 text-lg leading-relaxed">{flashItem.description}</p>
              </div>

              {/* Tags and Style */}
              <div className="flex flex-wrap gap-3 mb-6">
                {flashItem.tags && flashItem.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
                {flashItem.style && (
                  <span className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                    {flashItem.style}
                  </span>
                )}
              </div>

              {/* Price and Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing</h3>
                  <p className="text-2xl font-bold text-blue-600">{flashItem.price}</p>
                  {flashItem.size && (
                    <p className="text-sm text-gray-600 mt-1">Minimum size: {flashItem.size} inches</p>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Availability</h3>
                  <p className="text-green-600 font-medium">Ready to ink</p>
                  <p className="text-sm text-gray-600 mt-1">Contact artist for booking</p>
                </div>
              </div>
            </div>

            {/* Artist Information */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Artist Information</h2>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">
                    {flashItem.artist?.user?.firstName?.[0] || 'A'}{flashItem.artist?.user?.lastName?.[0] || 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    <Link
                      to={`/artists/${flashItem.artist?.id}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    >
                      {flashItem.artist?.user?.firstName || 'Artist'} {flashItem.artist?.user?.lastName || ''}
                    </Link>
                  </h3>
                  {flashItem.artist?.studioName && (
                    <p className="text-gray-700 font-medium mb-2">{flashItem.artist.studioName}</p>
                  )}
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{flashItem.artist?.city || 'Location'}, {flashItem.artist?.country || 'Country'}</span>
                  </div>
                  {flashItem.artist?.bio && (
                    <p className="text-gray-600 text-sm leading-relaxed">{flashItem.artist.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white border-2 border-black p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
              {flashItem.reviews && flashItem.reviews.length > 0 ? (
                <div className="space-y-4">
                  {flashItem.reviews.map((review) => (
                    <div key={review.id} className="border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">
                              {review.author?.firstName?.[0] || 'U'}{review.author?.lastName?.[0] || 'U'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {review.author?.firstName || 'User'} {review.author?.lastName || ''}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this flash design!</p>
              )}
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
