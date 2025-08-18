import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, User, Camera, RotateCcw } from 'lucide-react';
import { getAuthorizationHeader } from '../utils/tokenManager';

const ProfilePictureUpload = ({ 
  onImageUpload, 
  onImageRemove, 
  currentImageUrl, 
  currentImageData,
  disabled = false,
  className = '',
  maxSize = 5 * 1024 * 1024, // 5MB default
  uploadEndpoint = '/api/artists/profile-picture/upload'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl || '');
  const [imageDimensions, setImageDimensions] = useState(null);
  const fileInputRef = useRef(null);

  const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Update preview when current image changes
  useEffect(() => {
    setPreviewUrl(currentImageUrl || '');
  }, [currentImageUrl]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled]);

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height
        });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file) => {
    // Validate file type
    if (!acceptedTypes.includes(file.type)) {
      setUploadError(`Please select a valid image file (${acceptedTypes.join(', ')})`);
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setUploadError(`File size must be less than ${Math.round(maxSize / (1024 * 1024))}MB`);
      return;
    }

    setUploadError('');
    setIsUploading(true);

    try {
      // Get image dimensions
      const dimensions = await getImageDimensions(file);
      setImageDimensions(dimensions);

      // Upload to server first, then set preview to the uploaded URL
      const formData = new FormData();
      formData.append('image', file);

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

      const responseText = await response.text();
      if (!responseText) {
        throw new Error('Server returned empty response');
      }

      let uploadResult;
      try {
        uploadResult = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid server response');
      }

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      // Set preview to the uploaded image URL (not blob URL)
      setPreviewUrl(uploadResult.data.url);

      // Call the callback with the uploaded image data
      const imageData = {
        url: uploadResult.data.url,
        publicId: uploadResult.data.publicId,
        width: dimensions.width,
        height: dimensions.height,
        format: file.type.split('/')[1],
        bytes: file.size
      };

      onImageUpload(imageData);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
      setPreviewUrl(currentImageUrl || '');
      setImageDimensions(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    setImageDimensions(null);
    setUploadError('');
    onImageRemove();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`profile-picture-upload ${className}`}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Profile Picture
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Upload a professional profile picture. Recommended size: 400x400 pixels or larger.
        </p>
      </div>

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
          ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${previewUrl ? 'bg-gray-50' : 'bg-white'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {previewUrl ? (
          <div className="relative">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <img
                src={previewUrl}
                alt="Profile preview"
                className="w-full h-full object-cover rounded-full border-4 border-white shadow-lg"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            {imageDimensions && (
              <div className="text-xs text-gray-500 mb-2">
                {imageDimensions.width} × {imageDimensions.height} pixels
              </div>
            )}

            <div className="flex justify-center space-x-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openFileDialog();
                }}
                disabled={disabled || isUploading}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <Camera className="w-3 h-3 mr-1" />
                Change
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage();
                }}
                disabled={disabled || isUploading}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
              >
                <X className="w-3 h-3 mr-1" />
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
              {isUploading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <div>
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WEBP up to {Math.round(maxSize / (1024 * 1024))}MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>

      {uploadError && (
        <div className="mt-3 flex items-center text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mr-1" />
          {uploadError}
        </div>
      )}

      {currentImageData && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md">
          <div className="text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Current image:</span>
              <span>{currentImageData.width} × {currentImageData.height}</span>
            </div>
            <div className="flex justify-between">
              <span>Format:</span>
              <span className="uppercase">{currentImageData.format}</span>
            </div>
            <div className="flex justify-between">
              <span>Size:</span>
              <span>{Math.round(currentImageData.bytes / 1024)} KB</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload; 