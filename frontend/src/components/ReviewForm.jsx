import React, { useState } from 'react'
import { Star, X, Upload, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { reviewsAPI } from '../services/api'
import ImageUpload from './ImageUpload'

export const ReviewForm = ({ artist, onClose, onReviewSubmitted }) => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    images: []
  })
  
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)

  // Check if user can leave a review
  const canLeaveReview = user && (user.role === 'CLIENT' || user.role === 'ARTIST')

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }))
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (uploadedImages) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedImages]
    }))
    setShowImageUpload(false)
  }

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.rating) {
      showError('Please select a rating')
      return
    }

    if (!formData.title.trim() && !formData.comment.trim()) {
      showError('Please provide either a title or comment')
      return
    }

    try {
      setIsSubmitting(true)
      
      const reviewData = {
        recipientId: artist.user.id,
        rating: formData.rating,
        title: formData.title.trim() || null,
        comment: formData.comment.trim() || null,
        images: formData.images
      }

      const response = await reviewsAPI.create(reviewData)
      
      if (response.data.success) {
        // Check if review was flagged for moderation
        if (response.data.data.moderationFlags) {
          success('Review submitted and pending moderation. It will be visible once approved.')
        } else {
          success('Review submitted successfully!')
        }
        onReviewSubmitted(response.data.data.review)
        onClose()
      } else {
        showError(response.data.error || 'Failed to submit review')
      }
    } catch (err) {
      console.error('Review submission error:', err)
      if (err.response?.status === 429) {
        showError('Rate limit exceeded. You can only submit 3 reviews per 24 hours.')
      } else {
        showError(err.response?.data?.error || 'Failed to submit review')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!canLeaveReview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cannot Leave Review
            </h3>
            <p className="text-gray-600 mb-4">
              {!user 
                ? 'You must be logged in to leave a review.'
                : 'Only registered users can leave reviews for artists.'
              }
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Leave a Review
            </h3>
            <p className="text-gray-600">
              Review for {artist.user.firstName} {artist.user.lastName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rating *
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= (hoveredRating || formData.rating)
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-3 text-sm text-gray-600">
                {formData.rating > 0 && `${formData.rating} star${formData.rating !== 1 ? 's' : ''}`}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Review Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              maxLength={100}
              placeholder="Brief summary of your experience"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/100 characters
            </p>
          </div>

          {/* Comment */}
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Review Comment
            </label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              maxLength={1000}
              rows={4}
              placeholder="Share your experience with this artist..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-vertical"
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.comment.length}/1000 characters
            </p>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photos (Optional)
            </label>
            
            {/* Uploaded Images */}
            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {!showImageUpload && (
              <button
                type="button"
                onClick={() => setShowImageUpload(true)}
                className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-md hover:border-primary-500 transition-colors"
              >
                <div className="text-center">
                  <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Add photos to your review</p>
                </div>
              </button>
            )}

            {/* Image Upload Component */}
            {showImageUpload && (
              <div className="border border-gray-300 rounded-md p-4">
                <ImageUpload
                  onUpload={handleImageUpload}
                  onCancel={() => setShowImageUpload(false)}
                  maxFiles={5}
                  acceptedTypes={['image/jpeg', 'image/png', 'image/webp']}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.rating}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 