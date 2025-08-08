import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, Star, Upload, Image, Clock, MapPin, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api, galleryAPI } from '../services/api';

const ArtistGalleryManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [beforeFile, setBeforeFile] = useState(null);
  const [afterFile, setAfterFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tattooStyle: '',
    bodyLocation: '',
    tattooSize: '',
    colorType: '',
    sessionCount: 1,
    hoursSpent: '',
    clientConsent: false,
    clientAnonymous: true,
    clientAgeVerified: false,
    isBeforeAfter: false,
    tags: '',
    categories: ''
  });

  const tattooStyles = [
    'Traditional American',
    'Japanese (Irezumi)',
    'Black & Grey',
    'Realistic',
    'Neo-Traditional',
    'Watercolor',
    'Geometric',
    'Minimalist',
    'Tribal',
    'New School'
  ];

  const bodyLocations = [
    'Arm',
    'Leg',
    'Back',
    'Chest',
    'Shoulder',
    'Forearm',
    'Thigh',
    'Calf',
    'Ribcage',
    'Full Sleeve',
    'Half Sleeve',
    'Hand',
    'Foot',
    'Neck',
    'Face'
  ];

  const tattooSizes = [
    'Small',
    'Medium',
    'Large',
    'Full Sleeve',
    'Half Sleeve',
    'Full Back',
    'Full Leg',
    'Full Chest'
  ];

  const colorTypes = [
    'Color',
    'Black & Grey',
    'Blackwork',
    'Color with Black Outline',
    'Watercolor'
  ];

  useEffect(() => {
    const artistId = user?.artistProfile?.id;
    if (!artistId) return;
    fetchGalleryItems(artistId);
  }, [user?.artistProfile?.id]);

  const fetchGalleryItems = async (artistId) => {
    try {
      setLoading(true);
      const response = await galleryAPI.getAll({ artistId });
      if (response.data?.success) setGalleryItems(response.data.data.items || []);
    } catch (err) {
      console.error('Error fetching gallery items:', err);
      showToast('Failed to load gallery items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const MAX_MB = 12;
  const ALLOWED = ['image/jpeg','image/png','image/webp','image/avif'];

  const handleFileChange = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED.includes(file.type)) {
      showToast('Only JPG, PNG, WebP, or AVIF', 'warning');
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      showToast(`Max file size is ${MAX_MB} MB`, 'warning');
      return;
    }
    if (type === 'main') setSelectedFile(file);
    if (type === 'before') setBeforeFile(file);
    if (type === 'after') setAfterFile(file);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!user) {
      showToast('Please log in to upload gallery items', 'error');
      return;
    }

    // Check if user is an artist
    if (user.role !== 'ARTIST' && user.role !== 'ARTIST_ADMIN') {
      showToast('Only artists can upload gallery items', 'error');
      return;
    }

    if (!formData.title.trim()) return showToast('Title is required', 'warning');
    if (!selectedFile) return showToast('Please select a main image', 'warning');
    if (!formData.clientConsent) return showToast('Client consent is required', 'warning');
    if (formData.isBeforeAfter && (!beforeFile || !afterFile)) {
      return showToast('Provide both before and after images', 'warning');
    }

    try {
      setUploading(true);
      
      const append = (k, v) => data.append(k, String(v));

      const data = new FormData();
      data.append('image', selectedFile);
      append('title', formData.title);
      append('description', formData.description);
      append('tattooStyle', formData.tattooStyle);
      append('bodyLocation', formData.bodyLocation);
      append('tattooSize', formData.tattooSize);
      append('colorType', formData.colorType);
      append('sessionCount', Number(formData.sessionCount || 1));
      append('hoursSpent', Number(formData.hoursSpent || 0));
      append('clientConsent', !!formData.clientConsent);
      append('clientAnonymous', !!formData.clientAnonymous);
      append('clientAgeVerified', !!formData.clientAgeVerified);
      append('isBeforeAfter', !!formData.isBeforeAfter);

      if (formData.tags) {
        const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        data.append('tags', JSON.stringify(tags));
      }
      if (formData.categories) {
        const categories = formData.categories.split(',').map(c => c.trim()).filter(Boolean);
        data.append('categories', JSON.stringify(categories));
      }

      if (formData.isBeforeAfter) {
        if (beforeFile) data.append('beforeImage', beforeFile);
        if (afterFile) data.append('afterImage', afterFile);
      }

      const response = await galleryAPI.create(data);
      console.log('Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);

      // Check if response is successful (201 status) or has success flag
      if (response.status === 201 || response.data?.success) {
        showToast('Gallery item uploaded successfully', 'success');
        setShowUploadForm(false);
        resetForm();
        fetchGalleryItems();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading gallery item:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // Handle specific error cases
      if (error.response?.status === 401) {
        showToast('Please log in to upload gallery items', 'error');
      } else if (error.response?.status === 403) {
        showToast('You do not have permission to upload gallery items. Please ensure you have an artist profile.', 'error');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data.error || 'Invalid data provided';
        console.error('400 Error message:', errorMessage);
        showToast(errorMessage, 'error');
      } else if (error.response?.status === 500) {
        showToast('Server error. Please try again later.', 'error');
      } else {
        showToast('Failed to upload gallery item. Please try again.', 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tattooStyle: '',
      bodyLocation: '',
      tattooSize: '',
      colorType: '',
      sessionCount: 1,
      hoursSpent: '',
      clientConsent: false,
      clientAnonymous: true,
      clientAgeVerified: false,
      isBeforeAfter: false,
      tags: '',
      categories: ''
    });
    setSelectedFile(null);
    setBeforeFile(null);
    setAfterFile(null);
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) {
      return;
    }

    try {
      const response = await galleryAPI.delete(itemId);
      if (response.data.success) {
        showToast('Gallery item deleted successfully', 'success');
        fetchGalleryItems();
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      showToast('Failed to delete gallery item', 'error');
    }
  };

  const GalleryItemCard = ({ item }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img
          src={item.thumbnailUrl || item.imageUrl}
          alt={item.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex space-x-1">
          {item.isFeatured && (
            <div className="bg-yellow-400 text-white p-1 rounded">
              <Star className="w-4 h-4" />
            </div>
          )}
          {item.isBeforeAfter && (
            <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold">
              Before/After
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {item.title}
        </h3>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tattooStyle && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
              {item.tattooStyle}
            </span>
          )}
          {item.bodyLocation && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
              {item.bodyLocation}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{item._count.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>❤️</span>
              <span>{item._count.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>💬</span>
              <span>{item._count.comments}</span>
            </div>
          </div>
          
          {item.hoursSpent && (
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{item.hoursSpent}h</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/gallery/${item.id}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/gallery/edit/${item.id}`)}
              className="p-2 text-green-600 hover:bg-green-50 rounded transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(item.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Gallery</h1>
            <p className="text-gray-600">
              Manage your tattoo portfolio and showcase your work
            </p>
          </div>
          
          <button
            onClick={() => setShowUploadForm(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Add Gallery Item</span>
          </button>
        </div>

        {/* Gallery Items */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : galleryItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🎨</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gallery items yet</h3>
            <p className="text-gray-600 mb-6">Start building your portfolio by adding your first gallery item</p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors mx-auto"
            >
              <Upload className="w-5 h-5" />
              <span>Upload First Item</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryItems.map(item => (
              <GalleryItemCard key={item.id} item={item} />
            ))}
          </div>
        )}

        {/* Upload Form Modal */}
        {showUploadForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Add Gallery Item</h2>
                  <button
                    onClick={() => {
                      setShowUploadForm(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tattoo Style
                      </label>
                      <select
                        name="tattooStyle"
                        value={formData.tattooStyle}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Style</option>
                        {tattooStyles.map(style => (
                          <option key={style} value={style}>{style}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Tattoo Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Body Location
                      </label>
                      <select
                        name="bodyLocation"
                        value={formData.bodyLocation}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Location</option>
                        {bodyLocations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size
                      </label>
                      <select
                        name="tattooSize"
                        value={formData.tattooSize}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Size</option>
                        {tattooSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color Type
                      </label>
                      <select
                        name="colorType"
                        value={formData.colorType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Color Type</option>
                        {colorTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sessions
                      </label>
                      <input
                        type="number"
                        name="sessionCount"
                        value={formData.sessionCount}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hours Spent
                      </label>
                      <input
                        type="number"
                        name="hoursSpent"
                        value={formData.hoursSpent}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Images */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Main Image *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'main')}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="isBeforeAfter"
                        checked={formData.isBeforeAfter}
                        onChange={handleInputChange}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label className="text-sm text-gray-700">This is a before/after transformation</label>
                    </div>

                    {formData.isBeforeAfter && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Before Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'before')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            After Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, 'after')}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Client Consent */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Client Consent & Privacy</h3>
                    
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="clientConsent"
                          checked={formData.clientConsent}
                          onChange={handleInputChange}
                          required
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label className="text-sm text-gray-700">
                          Client has given explicit consent to display this tattoo *
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="clientAnonymous"
                          checked={formData.clientAnonymous}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label className="text-sm text-gray-700">
                          Display client information anonymously
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="clientAgeVerified"
                          checked={formData.clientAgeVerified}
                          onChange={handleInputChange}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <label className="text-sm text-gray-700">
                          Client's age was verified before tattooing
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleInputChange}
                        placeholder="e.g., traditional, color, sleeve"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categories (comma-separated)
                      </label>
                      <input
                        type="text"
                        name="categories"
                        value={formData.categories}
                        onChange={handleInputChange}
                        placeholder="e.g., portrait, nature, geometric"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadForm(false);
                        resetForm();
                      }}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {uploading ? 'Uploading...' : 'Upload Gallery Item'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistGalleryManagement; 