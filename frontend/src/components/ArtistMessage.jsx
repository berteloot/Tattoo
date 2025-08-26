import React from 'react';
import { Clock, Gift, Info, Star, Megaphone } from 'lucide-react';

export const ArtistMessage = ({ message, variant = 'profile' }) => {
  if (!message) return null;

  // Check if message has expired
  const isExpired = message.expiresAt && new Date(message.expiresAt) <= new Date();
  if (isExpired) return null;

  // Improved priority styling - more community-friendly and less dramatic
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 3: // High priority (giveaways, announcements)
        return {
          border: 'border-purple-200',
          bg: 'bg-gradient-to-r from-purple-50 to-indigo-50',
          text: 'text-gray-800',
          title: 'text-purple-700',
          icon: Gift,
          iconColor: 'text-purple-500',
          shadow: 'shadow-sm'
        };
      case 2: // Medium priority (updates, news)
        return {
          border: 'border-amber-200',
          bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
          text: 'text-gray-800',
          title: 'text-amber-700',
          icon: Megaphone,
          iconColor: 'text-amber-500',
          shadow: 'shadow-sm'
        };
      default: // Low priority (general info)
        return {
          border: 'border-blue-200',
          bg: 'bg-gradient-to-r from-blue-50 to-sky-50',
          text: 'text-gray-700',
          title: 'text-blue-700',
          icon: Info,
          iconColor: 'text-blue-500',
          shadow: 'shadow-sm'
        };
    }
  };

  const style = getPriorityStyle(message.priority);
  const IconComponent = style.icon;

  // Format expiration date with more friendly language
  const formatExpirationDate = (expiresAt) => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Ends today';
    if (diffDays === 1) return 'Ends tomorrow';
    if (diffDays <= 7) return `Ends in ${diffDays} days`;
    return `Ends ${date.toLocaleDateString()}`;
  };

  const expirationText = formatExpirationDate(message.expiresAt);

  // Different styles for card vs profile display
  const isCard = variant === 'card';

  return (
    <div className={`
      ${isCard ? 'rounded-lg border-l-3 p-3 mb-3' : 'rounded-xl border-l-4 p-5 mb-4'}
      transition-all duration-300 ease-in-out hover:shadow-md hover:scale-[1.02]
      ${style.border} ${style.bg} ${style.shadow}
      ${isCard ? 'hover:bg-opacity-80' : 'hover:bg-opacity-90'}
      border-r border-t border-b border-gray-100
    `}>
      <div className={`flex items-start ${isCard ? 'space-x-3' : 'space-x-4'}`}>
        {/* Icon with subtle background */}
        <div className={`
          ${isCard ? 'p-1.5' : 'p-2'} rounded-full bg-white/70 border ${style.border}
          flex-shrink-0 backdrop-blur-sm
        `}>
          <IconComponent className={`${isCard ? 'w-4 h-4' : 'w-5 h-5'} ${style.iconColor}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Title with better typography */}
          {message.title && (
            <h4 className={`
              font-semibold ${style.title} ${isCard ? 'text-sm' : 'text-lg'}
              ${isCard ? 'mb-1' : 'mb-2'} leading-tight
            `}>
              {message.title}
            </h4>
          )}
          
          {/* Content with improved readability */}
          <div 
            className={`
              ${style.text} ${isCard ? 'text-xs' : 'text-base'} 
              ${isCard ? 'leading-tight' : 'leading-relaxed'}
              prose prose-sm max-w-none
              ${isCard ? 'line-clamp-2' : ''}
              break-words
            `}
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
          
          {/* Expiration with better styling */}
          {expirationText && !isCard && (
            <div className="flex items-center mt-3 text-sm text-gray-500 bg-white/50 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4 mr-2 text-gray-400" />
              <span className="font-medium">{expirationText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const ArtistMessages = ({ messages, variant = 'profile' }) => {
  if (!messages || messages.length === 0) return null;

  // For cards, only show the highest priority message
  const messagesToShow = variant === 'card' ? messages.slice(0, 1) : messages;

  return (
    <div className={variant === 'card' ? 'mb-3' : 'mb-6'}>
      {messagesToShow.map((message) => (
        <ArtistMessage 
          key={message.id} 
          message={message} 
          variant={variant} 
        />
      ))}
    </div>
  );
};
