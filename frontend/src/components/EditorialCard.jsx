import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin } from 'lucide-react';
import { getArtistImageSource } from '../utils/placeholderImage';

export const EditorialCard = ({ 
  artist,
  onClick 
}) => {
  if (!artist) return null;

  return (
    <div className="editorial-card cursor-pointer group" onClick={onClick}>
      <div className="editorial-card-image bg-gradient-to-br from-editorial-500 to-editorial-700 flex items-center justify-center overflow-hidden">
        <img 
          src={getArtistImageSource(artist.profilePictureUrl, artist.user)}
          alt={`${artist.user?.firstName} ${artist.user?.lastName}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            console.log('Editorial card image failed to load for artist:', artist.user?.firstName, artist.user?.lastName);
            e.target.src = 'https://via.placeholder.com/400x400/3B82F6/FFFFFF?text=Artist';
          }}
        />
      </div>
      <div className="editorial-card-content">
        <div className="flex items-center gap-2 mb-3">
          {artist.specialties?.slice(0, 2).map((specialty) => (
            <span key={specialty.id} className="editorial-badge">
              {specialty.name}
            </span>
          ))}
        </div>
        <h3 className="editorial-card-title">
          {artist.user?.firstName} {artist.user?.lastName}
        </h3>
        <p className="text-cream-600 mb-3 font-medium">{artist.studioName}</p>
        <div className="flex items-center space-x-2 mb-3">
          <Star className="w-4 h-4 text-red-500 fill-current" />
          <span className="text-sm text-cream-600">
            {artist.averageRating ? `${artist.averageRating.toFixed(1)}` : 'New'} 
            ({artist.reviewCount || 0} avis)
          </span>
        </div>
        <p className="editorial-card-description">
          {artist.bio?.substring(0, 120)}...
        </p>
        <div className="editorial-card-meta">
          <div className="flex items-center text-cream-500">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="text-xs">{artist.city}, {artist.state}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-red-500 font-semibold">
              ${artist.hourlyRate || 'Contact'}/hr
            </span>
            <span className="text-editorial-600 group-hover:text-editorial-700 transition-colors">
              →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}; 