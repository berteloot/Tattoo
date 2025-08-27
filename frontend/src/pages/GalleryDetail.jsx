import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, MessageCircle, Eye, Share2, ArrowLeft, Star, Clock, MapPin, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { galleryAPI } from '../services/api';

const GalleryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error, warning, success, info } = useToast();

  const [galleryItem, setGalleryItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchGalleryItem();
  }, [id]);

  const fetchGalleryItem = async () => {
    try {
      setLoading(true);
      const response = await galleryAPI.getById(id);
      if (response.data.success) {
        setGalleryItem(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching gallery item:', err);
      error('Error', 'Failed to load gallery item');
      navigate('/gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      warning('Login Required', 'Please login to like gallery items');
      return;
    }

    try {
      const response = await galleryAPI.like(id);
      if (response.data.success) {
        setGalleryItem(prev => ({
          ...prev,
          _count: {
            ...prev._count,
            likes: response.data.liked ? prev._count.likes + 1 : prev._count.likes - 1
          },
          userLiked: response.data.liked
        }));
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      error('Error', 'Failed to update like');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      warning('Login Required', 'Please login to comment');
      return;
    }

    if (!comment.trim()) {
      warning('Comment Required', 'Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      const response = await galleryAPI.addComment(id, comment);
      if (response.data.success) {
        setGalleryItem(prev => ({
          ...prev,
          comments: [response.data.data, ...prev.comments],
          _count: {
            ...prev._count,
            comments: prev._count.comments + 1
          }
        }));
        setComment('');
        success('Success', 'Comment added successfully');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      error('Error', 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: galleryItem.title,
          text: galleryItem.description,
          url: window.location.href
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        success('Success', 'Link copied to clipboard');
      } catch (err) {
        console.error('Error copying to clipboard:', err);
        error('Error', 'Failed to copy link');
      }
    }
  };

  const openImageViewer = (index = 0) => {
    setCurrentImageIndex(index);
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setImageViewerOpen(false);
  };

  const nextImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getImages();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const getImages = () => {
    const images = [];
    if (galleryItem?.beforeImageUrl) images.push(galleryItem.beforeImageUrl);
    images.push(galleryItem?.imageUrl);
    if (galleryItem?.afterImageUrl) images.push(galleryItem.afterImageUrl);
    return images.filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!galleryItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Gallery item not found</h2>
          <button
            onClick={() => navigate('/gallery')}
            className="text-purple-600 hover:text-purple-700"
          >
            Back to Gallery
          </button>
        </div>
      </div>
    );
  }

  const images = getImages();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/gallery')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Gallery</span>
        </button>

        {/* Gallery Image */}
        <div className="bg-white border-2 border-black overflow-hidden">
          <img
            src={galleryItem.imageUrl}
            alt={galleryItem.title}
            className="w-full h-auto max-h-96 object-cover"
          />
        </div>

        {/* Gallery Details */}
        <div className="bg-white border-2 border-black p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{galleryItem.title}</h1>
            {galleryItem.description && (
              <p className="text-gray-600 text-lg leading-relaxed">{galleryItem.description}</p>
            )}
          </div>

          {/* Tags and Categories */}
          <div className="flex flex-wrap gap-3 mb-6">
            {galleryItem.tattooStyle && (
              <span className="px-3 py-2 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                {galleryItem.tattooStyle}
              </span>
            )}
            {galleryItem.bodyLocation && (
              <span className="px-3 py-2 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                {galleryItem.bodyLocation}
              </span>
            )}
            {galleryItem.colorType && (
              <span className="px-3 py-2 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                {galleryItem.colorType}
              </span>
            )}
            {galleryItem.tags && galleryItem.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tattoo Details</h3>
              <div className="space-y-2">
                {galleryItem.tattooSize && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Size:</span> {galleryItem.tattooSize}
                  </p>
                )}
                {galleryItem.sessionCount && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Sessions:</span> {galleryItem.sessionCount}
                  </p>
                )}
                {galleryItem.hoursSpent && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Time:</span> {galleryItem.hoursSpent} hours
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Client Information</h3>
              <div className="space-y-2">
                {galleryItem.clientConsent && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Consent:</span> Client approved sharing
                  </p>
                )}
                {galleryItem.clientAnonymous && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Privacy:</span> Client anonymous
                  </p>
                )}
                {galleryItem.clientAgeVerified && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Age:</span> Client age verified
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Artist Information */}
        <div className="bg-white border-2 border-black p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Artist Information</h2>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">
                {galleryItem.artist?.user?.firstName?.[0] || 'A'}{galleryItem.artist?.user?.lastName?.[0] || 'A'}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                <Link
                  to={`/artists/${galleryItem.artist?.id}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  {galleryItem.artist?.user?.firstName || 'Artist'} {galleryItem.artist?.user?.lastName || ''}
                </Link>
              </h3>
              {galleryItem.artist?.studioName && (
                <p className="text-gray-700 font-medium mb-2">{galleryItem.artist.studioName}</p>
              )}
              <div className="flex items-center space-x-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{galleryItem.artist?.city || 'Location'}, {galleryItem.artist?.country || 'Country'}</span>
              </div>
              {galleryItem.artist?.bio && (
                <p className="text-gray-600 text-sm leading-relaxed">{galleryItem.artist.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white border-2 border-black p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Reviews</h2>
          {galleryItem.reviews && galleryItem.reviews.length > 0 ? (
            <div className="space-y-4">
              {galleryItem.reviews.map((review) => (
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
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this gallery item!</p>
          )}
        </div>
      </div>

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={closeImageViewer}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              ✕
            </button>
            
            <div className="relative">
              <img
                src={images[currentImageIndex]}
                alt="Gallery"
                className="max-w-full max-h-[80vh] object-contain"
              />
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  >
                    ‹
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
            
            <div className="text-center text-white mt-4">
              {currentImageIndex + 1} of {images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryDetail; 