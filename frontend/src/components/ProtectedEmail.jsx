import React, { useState } from 'react';
import { Mail, MessageSquare } from 'lucide-react';
import ContactEmailModal from './ContactEmailModal';

const ProtectedEmail = ({ 
  email, 
  className = "", 
  showIcon = true, 
  children,
  recipient = null,
  recipientType = 'artist'
}) => {
  const [showContactModal, setShowContactModal] = useState(false);

  const handleContact = () => {
    if (recipient) {
      setShowContactModal(true);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showIcon && <Mail className="w-4 h-4 text-gray-400" />}
      
      <div className="flex items-center space-x-2">
        <span className="text-gray-600 font-medium">Contact via message</span>
        <button
          onClick={handleContact}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
          title="Send message"
        >
          Message
        </button>
      </div>

      {/* Contact Modal */}
      {recipient && (
        <ContactEmailModal
          isOpen={showContactModal}
          onClose={() => setShowContactModal(false)}
          recipient={recipient}
          recipientType={recipientType}
          onSuccess={() => {
            setShowContactModal(false);
          }}
        />
      )}

      {children}
    </div>
  );
};

export default ProtectedEmail;
