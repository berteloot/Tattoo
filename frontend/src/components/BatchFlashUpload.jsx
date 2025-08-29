import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Edit3, Save, Trash2, CheckCircle } from 'lucide-react';
import { getAuthorizationHeader } from '../utils/tokenManager';

const BatchFlashUpload = ({ 
  onFlashCreated,
  onCancel,
  className = '',
  maxFiles = 10,
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxSize = 5 * 1024 * 1024, // 5MB default
  uploadEndpoint = '/api/flash/upload',
  specialties = [],
  services = []
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [editingMode, setEditingMode] = useState(false);
  const [editingImages, setEditingImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Default flash data template
  const getDefaultFlashData = (imageData) => ({
    title: '',
    description: '',
    imageUrl: imageData.imageUrl,
    imagePublicId: imageData.imagePublicId,
    imageWidth: imageData.imageWidth,
    imageHeight: imageData.imageHeight,
    imageFormat: imageData.imageFormat,
    imageBytes: imageData.imageBytes,
    basePrice: '',
    complexity: 'MEDIUM',
    timeEstimate: 120,
    isRepeatable: true,
    sizePricing: {
      small: { price: 100, time: 60, size: '1-2 inches' },
      medium: { price: 150, time: 90, size: '3-4 inches' },
      large: { price: 200, time: 120, size: '5-6 inches' },
      xlarge: { price: 250, time: 150, size: '7+ inches' }
    },
    tags: [],
    isAvailable: true
  });

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFilesSelected(files);
    }
  }, []);

  const handleFilesSelected = (files) => {
    // Limit number of files
    if (files.length > maxFiles) {
      setErrors([`You can only upload up to ${maxFiles} images at once. Please select fewer files.`]);
      return;
    }

    // Validate files
    const validFiles = [];
    const newErrors = [];

    files.forEach((file, index) => {
      if (!acceptedTypes.includes(file.type)) {
        newErrors.push(`File "${file.name}" is not a valid image type. Accepted: ${acceptedTypes.join(', ')}`);
        return;
      }

      if (file.size > maxSize) {
        newErrors.push(`File "${file.name}" is too large. Max size: ${Math.round(maxSize / (1024 * 1024))}MB`);
        return;
      }

      validFiles.push(file);
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    // Add files to upload queue
    const newQueue = validFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      file,
      status: 'pending', // pending, uploading, success, error
      progress: 0,
      error: null
    }));

    setUploadQueue(prev => [...prev, ...newQueue]);
    setErrors([]);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFilesSelected(files);
    }
  };

  const uploadFile = async (queueItem) => {
    const { file, id } = queueItem;
    
    // Update status to uploading
    setUploadQueue(prev => prev.map(item => 
      item.id === id ? { ...item, status: 'uploading', progress: 0 } : item
    ));

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);

      // Upload to server
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        headers: {
          'Authorization': getAuthorizationHeader() || ''
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Upload failed';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || 'Upload failed';
        } catch (e) {
          errorMessage = errorText || `Upload failed (${response.status})`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update status to success
      setUploadQueue(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'success', progress: 100 } : item
      ));

      // Add to uploaded images
      setUploadedImages(prev => [...prev, result.data]);

    } catch (error) {
      console.error('Upload error:', error);
      
      // Update status to error
      setUploadQueue(prev => prev.map(item => 
        item.id === id ? { ...item, status: 'error', error: error.message } : item
      ));
    }
  };

  const processUploadQueue = async () => {
    setIsProcessing(true);
    
    // Upload files sequentially to avoid overwhelming the server
    for (const queueItem of uploadQueue) {
      if (queueItem.status === 'pending') {
        await uploadFile(queueItem);
        // Small delay between uploads
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setIsProcessing(false);
  };

  const removeFromQueue = (id) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const removeUploadedImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const startEditing = () => {
    // Initialize editing data for all uploaded images
    const editingData = uploadedImages.map(imageData => getDefaultFlashData(imageData));
    setEditingImages(editingData);
    setEditingMode(true);
  };

  const handleEditChange = (index, field, value) => {
    setEditingImages(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSpecialtyChange = (index, specialtyId) => {
    setEditingImages(prev => prev.map((item, i) => 
      i === index ? {
        ...item,
        tags: item.tags.includes(specialtyId)
          ? item.tags.filter(id => id !== specialtyId)
          : [...item.tags, specialtyId]
      } : item
    ));
  };

  const saveAllFlash = async () => {
    setIsProcessing(true);
    const results = [];
    const newErrors = [];

    try {
      for (let i = 0; i < editingImages.length; i++) {
        const flashData = editingImages[i];
        
        // Basic validation
        if (!flashData.title.trim()) {
          newErrors.push(`Image ${i + 1}: Title is required`);
          continue;
        }

        try {
          const response = await fetch('/api/flash', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': getAuthorizationHeader() || ''
            },
            body: JSON.stringify(flashData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create flash item');
          }

          const result = await response.json();
          results.push(result.data);
          
        } catch (error) {
          newErrors.push(`Image ${i + 1}: ${error.message}`);
        }
      }

      if (newErrors.length > 0) {
        setErrors(newErrors);
      } else {
        // Success - notify parent and reset
        if (onFlashCreated) {
          onFlashCreated(results);
        }
        
        // Reset everything
        setUploadQueue([]);
        setUploadedImages([]);
        setEditingMode(false);
        setEditingImages([]);
        setErrors([]);
        
        if (onCancel) {
          onCancel();
        }
      }

    } catch (error) {
      setErrors([`Unexpected error: ${error.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const hasPendingUploads = uploadQueue.some(item => item.status === 'pending');
  const hasSuccessfulUploads = uploadedImages.length > 0;
  const canStartEditing = hasSuccessfulUploads && !editingMode && !isProcessing;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* File Input (hidden) */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={isProcessing}
      />

      {/* Upload Area */}
      {!editingMode && (
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!isProcessing ? openFileDialog : undefined}
        >
          <div className="space-y-4">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <p className="text-lg font-medium text-gray-700">
                Drop multiple images here, or{' '}
                <span className="text-blue-500 hover:text-blue-600">
                  browse
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                PNG, JPG, WebP up to 5MB • Max {maxFiles} images
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Upload all your flash designs first, then edit details for each one
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Queue */}
      {uploadQueue.length > 0 && !editingMode && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Queue</h3>
          <div className="space-y-3">
            {uploadQueue.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">
                    {item.file.name}
                  </span>
                </div>
                
                <div className="flex items-center space-x-3">
                  {item.status === 'pending' && (
                    <span className="text-sm text-gray-500">Pending</span>
                  )}
                  {item.status === 'uploading' && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span className="text-sm text-blue-600">Uploading...</span>
                    </div>
                  )}
                  {item.status === 'success' && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm">Success</span>
                    </div>
                  )}
                  {item.status === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm">{item.error}</span>
                    </div>
                  )}
                  
                  <button
                    onClick={() => removeFromQueue(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    disabled={item.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {hasPendingUploads && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={processUploadQueue}
                disabled={isProcessing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Start Upload'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Images */}
      {hasSuccessfulUploads && !editingMode && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Uploaded Images ({uploadedImages.length})
            </h3>
            <button
              onClick={startEditing}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Edit3 className="h-4 w-4 mr-2 inline" />
              Edit Flash Details
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.imageUrl}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeUploadedImage(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
                <div className="mt-2 text-xs text-gray-500 text-center">
                  {image.imageWidth} × {image.imageHeight}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editing Mode */}
      {editingMode && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-gray-900">
              Edit Flash Details ({editingImages.length} images)
            </h3>
            <div className="flex space-x-3">
              <button
                onClick={() => setEditingMode(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveAllFlash}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2 inline" />
                    Save All Flash Items
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-8">
            {editingImages.map((flashData, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Image Preview */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Image {index + 1}</h4>
                    <img
                      src={flashData.imageUrl}
                      alt={`Flash ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={flashData.title}
                        onChange={(e) => handleEditChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter flash title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={flashData.description}
                        onChange={(e) => handleEditChange(index, 'description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe your flash design"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Base Price ($)
                      </label>
                      <input
                        type="number"
                        value={flashData.basePrice}
                        onChange={(e) => handleEditChange(index, 'basePrice', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complexity
                      </label>
                      <select
                        value={flashData.complexity}
                        onChange={(e) => handleEditChange(index, 'complexity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="SIMPLE">Simple</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="COMPLEX">Complex</option>
                        <option value="MASTERPIECE">Masterpiece</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Estimate (minutes)
                      </label>
                      <input
                        type="number"
                        value={flashData.timeEstimate}
                        onChange={(e) => handleEditChange(index, 'timeEstimate', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="120"
                        min="1"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`repeatable-${index}`}
                        checked={flashData.isRepeatable}
                        onChange={(e) => handleEditChange(index, 'isRepeatable', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`repeatable-${index}`} className="ml-2 text-sm text-gray-700">
                        This design can be repeated for multiple clients
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`available-${index}`}
                        checked={flashData.isAvailable}
                        onChange={(e) => handleEditChange(index, 'isAvailable', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`available-${index}`} className="ml-2 text-sm text-gray-700">
                        Available for booking
                      </label>
                    </div>

                    {/* Specialty Tags */}
                    {specialties.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Specialty Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {specialties.map((specialty) => (
                            <button
                              key={specialty.id}
                              type="button"
                              onClick={() => handleSpecialtyChange(index, specialty.name)}
                              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                                flashData.tags.includes(specialty.name)
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {specialty.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-600 mb-2">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-sm text-red-600">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      {!editingMode && (
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchFlashUpload;
