import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    } catch (error) {
      console.error('Error fetching gallery item:', error);
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
    } catch (error) {
      console.error('Error toggling like:', error);
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
    } catch (error) {
      console.error('Error adding comment:', error);
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
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        success('Success', 'Link copied to clipboard');
      } catch (error) {
        console.error('Error copying to clipboard:', error);
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative">
              <img
                src={galleryItem.imageUrl}
                alt={galleryItem.title}
                className="w-full h-96 lg:h-[500px] object-cover rounded-lg cursor-pointer"
                onClick={() => openImageViewer(1)}
              />
              <div className="absolute top-4 right-4 flex space-x-2">
                {galleryItem.isFeatured && (
                  <div className="bg-yellow-400 text-white p-2 rounded-full">
                    <Star className="w-5 h-5" />
                  </div>
                )}
                {galleryItem.isBeforeAfter && (
                  <div className="bg-blue-500 text-white px-3 py-2 rounded-full text-sm font-semibold">
                    Before/After
                  </div>
                )}
              </div>
            </div>

            {/* Before/After Images */}
            {galleryItem.isBeforeAfter && (galleryItem.beforeImageUrl || galleryItem.afterImageUrl) && (
              <div className="grid grid-cols-2 gap-4">
                {galleryItem.beforeImageUrl && (
                  <div className="relative">
                    <img
                      src={galleryItem.beforeImageUrl}
                      alt="Before"
                      className="w-full h-32 object-cover rounded-lg cursor-pointer"
                      onClick={() => openImageViewer(0)}
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      Before
                    </div>
                  </div>
                )}
                {galleryItem.afterImageUrl && (
                  <div className="relative">
                    <img
                      src={galleryItem.afterImageUrl}
                      alt="After"
                      className="w-full h-32 object-cover rounded-lg cursor-pointer"
                      onClick={() => openImageViewer(2)}
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                      After
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Title and Actions */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{galleryItem.title}</h1>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${
                      galleryItem.userLiked ? 'text-red-500' : ''
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${galleryItem.userLiked ? 'fill-current' : ''}`} />
                    <span>{galleryItem._count.likes}</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-5 h-5" />
                    <span>{galleryItem._count.comments}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-5 h-5" />
                    <span>{galleryItem._count.views}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Artist Info */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">Artist</h3>
              <div className="flex items-center space-x-3">
                {galleryItem.artist?.user?.avatar && (
                  <img
                    src={galleryItem.artist.user.avatar}
                    alt="Artist"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <div className="font-medium text-gray-900">
                    {galleryItem.artist?.user?.firstName} {galleryItem.artist?.user?.lastName}
                  </div>
                  {galleryItem.artist?.studioName && (
                    <div className="text-sm text-gray-600">{galleryItem.artist.studioName}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Tattoo Details */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Tattoo Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {galleryItem.tattooStyle && (
                  <div className="flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-gray-500">Style</div>
                      <div className="font-medium">{galleryItem.tattooStyle}</div>
                    </div>
                  </div>
                )}
                {galleryItem.bodyLocation && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-gray-500">Location</div>
                      <div className="font-medium">{galleryItem.bodyLocation}</div>
                    </div>
                  </div>
                )}
                {galleryItem.hoursSpent && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="text-gray-500">Hours</div>
                      <div className="font-medium">{galleryItem.hoursSpent}h</div>
                    </div>
                  </div>
                )}
                {galleryItem.sessionCount && (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 text-gray-400">#</div>
                    <div>
                      <div className="text-gray-500">Sessions</div>
                      <div className="font-medium">{galleryItem.sessionCount}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {galleryItem.description && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{galleryItem.description}</p>
              </div>
            )}

            {/* Tags */}
            {(galleryItem.tags?.length > 0 || galleryItem.categories?.length > 0) && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {galleryItem.tags?.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                  {galleryItem.categories?.map((category, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Comments ({galleryItem._count.comments})</h3>
              
              {/* Add Comment */}
              {user && (
                <form onSubmit={handleCommentSubmit} className="mb-6">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows="3"
                    maxLength="1000"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {comment.length}/1000 characters
                    </span>
                    <button
                      type="submit"
                      disabled={submittingComment || !comment.trim()}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {galleryItem.comments?.map((comment) => (
                  <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      {comment.user?.avatar && (
                        <img
                          src={comment.user.avatar}
                          alt="User"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {comment.user?.firstName} {comment.user?.lastName}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {galleryItem.comments?.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </div>
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