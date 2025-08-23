import { X } from 'lucide-react'

export const ImageModal = ({ isOpen, imageUrl, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative max-w-4xl max-h-full mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <X className="w-8 h-8" />
        </button>
        
        {/* Image */}
        <img
          src={imageUrl}
          alt="Full size review image"
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
        />
        
        {/* Click outside to close */}
        <div 
          className="absolute inset-0 -z-10" 
          onClick={onClose}
        />
      </div>
    </div>
  )
}
