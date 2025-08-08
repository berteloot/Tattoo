import React, { useState } from 'react';
import { Mail, Eye, EyeOff } from 'lucide-react';

const ProtectedEmail = ({ email, className = "", showIcon = true, children }) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Split email into parts for obfuscation
  const [localPart, domain] = email.split('@');
  const domainParts = domain.split('.');
  
  // Obfuscate the email parts
  const obfuscatePart = (part) => {
    if (part.length <= 2) return part;
    return part.charAt(0) + '*'.repeat(part.length - 2) + part.charAt(part.length - 1);
  };

  const obfuscatedLocal = obfuscatePart(localPart);
  const obfuscatedDomain = domainParts.map(part => obfuscatePart(part)).join('.');

  const handleReveal = () => {
    setIsRevealed(true);
    // Auto-hide after 30 seconds
    setTimeout(() => setIsRevealed(false), 30000);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  const handleMailto = () => {
    if (isRevealed) {
      window.location.href = `mailto:${email}`;
    } else {
      handleReveal();
    }
  };

  return (
    <div 
      className={`flex items-center space-x-2 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {showIcon && <Mail className="w-4 h-4 text-gray-400" />}
      
      <div className="flex items-center space-x-2">
        {isRevealed ? (
          <>
            <span className="text-blue-600 font-medium">{email}</span>
            <button
              onClick={() => setIsRevealed(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Hide email"
            >
              <EyeOff className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <span className="text-gray-600 font-medium">
              {obfuscatedLocal}@{obfuscatedDomain}
            </span>
            <button
              onClick={handleReveal}
              className="text-gray-400 hover:text-blue-600 transition-colors"
              title="Reveal email"
            >
              <Eye className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {isRevealed && (
        <div className="flex space-x-1">
          <button
            onClick={handleMailto}
            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            title="Send email"
          >
            Email
          </button>
          <button
            onClick={handleCopy}
            className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700 transition-colors"
            title="Copy email"
          >
            Copy
          </button>
        </div>
      )}

      {children}
    </div>
  );
};

export default ProtectedEmail;
