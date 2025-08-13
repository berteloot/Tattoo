import React from 'react';
import { Clock, AlertCircle, Info, Star } from 'lucide-react';

export const ArtistMessage = ({ message, variant = 'profile' }) => {
  if (!message) return null;

  // Check if message has expired
  const isExpired = message.expiresAt && new Date(message.expiresAt) <= new Date();
  if (isExpired) return null;

  // Priority styling
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 3:
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          text: 'text-red-800',
          icon: AlertCircle,
          iconColor: 'text-red-500'
        };
      case 2:
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          text: 'text-yellow-800',
          icon: Star,
          iconColor: 'text-yellow-500'
        };
      default:
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          text: 'text-blue-800',
          icon: Info,
          iconColor: 'text-blue-500'
        };
    }
  };

  const style = getPriorityStyle(message.priority);
  const IconComponent = style.icon;

  // Format expiration date
  const formatExpirationDate = (expiresAt) => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    if (diffDays <= 7) return `Expires in ${diffDays} days`;
    return `Expires ${date.toLocaleDateString()}`;
  };

  const expirationText = formatExpirationDate(message.expiresAt);

  // Different styles for card vs profile display
  const isCard = variant === 'card';

  return (
    <div className={`
      rounded-lg border-l-4 p-4 mb-3
      ${style.border} ${style.bg}
      ${isCard ? 'text-sm' : ''}
    `}>
      <div className="flex items-start space-x-3">
        <IconComponent className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.iconColor}`} />
        <div className="flex-1 min-w-0">
          {message.title && (
            <h4 className={`font-semibold ${style.text} ${isCard ? 'text-sm' : 'text-base'}`}>
              {message.title}
            </h4>
          )}
          <div 
            className={`${style.text} ${isCard ? 'text-xs' : 'text-sm'} mt-1`}
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
          {expirationText && !isCard && (
            <div className="flex items-center mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3 mr-1" />
              {expirationText}
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
