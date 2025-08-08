import React, { useState } from 'react';
import { X, Send, User, Building, Mail, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

const ContactEmailModal = ({ 
  isOpen, 
  onClose, 
  recipient, 
  recipientType = 'artist', // 'artist' or 'studio'
  onSuccess 
}) => {
  const { user } = useAuth();
  const { success, error: showError } = useToast();
  
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    name: user ? `${user.firstName} ${user.lastName}` : '',
    email: user ? user.email : '',
    phone: user ? user.phone || '' : ''
  });
  
  const [sending, setSending] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      showError('Please fill in both subject and message');
      return;
    }

    if (!user && (!formData.name.trim() || !formData.email.trim())) {
      showError('Please provide your name and email');
      return;
    }

    try {
      setSending(true);
      
      const payload = {
        subject: formData.subject,
        message: formData.message,
        senderName: formData.name,
        senderEmail: formData.email,
        senderPhone: formData.phone,
        recipientId: recipient.id,
        recipientType: recipientType
      };

      const endpoint = recipientType === 'artist' 
        ? `/artists/${recipient.id}/contact` 
        : `/studios/${recipient.id}/contact`;

      const response = await api.post(endpoint, payload);
      
      if (response.data.success) {
        success('Message sent successfully!', 'Your message has been sent and the recipient will get back to you soon.');
        onClose();
        setFormData({
          subject: '',
          message: '',
          name: user ? `${user.firstName} ${user.lastName}` : '',
          email: user ? user.email : '',
          phone: user ? user.phone || '' : ''
        });
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Error sending contact email:', error);
      showError('Failed to send message', error.response?.data?.error || 'Please try again later');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  const getRecipientInfo = () => {
    if (recipientType === 'artist') {
      return {
        name: `${recipient.user?.firstName} ${recipient.user?.lastName}`,
        studio: recipient.studioName,
        icon: <User className="w-5 h-5" />
      };
    } else {
      return {
        name: recipient.title,
        studio: recipient.address ? `${recipient.address}, ${recipient.city}, ${recipient.state}` : '',
        icon: <Building className="w-5 h-5" />
      };
    }
  };

  const recipientInfo = getRecipientInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Send Message</h2>
              <p className="text-sm text-gray-600">Contact {recipientType === 'artist' ? 'Artist' : 'Studio'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Recipient Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {recipientInfo.icon}
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{recipientInfo.name}</h3>
              {recipientInfo.studio && (
                <p className="text-sm text-gray-600">{recipientInfo.studio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sender Info (if not logged in) */}
          {!user && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number (optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your phone number"
                />
              </div>
            </div>
          )}

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="What is this regarding?"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell them about your tattoo idea, ask about availability, pricing, or any other questions..."
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              This message will be sent through Tattooed World and include your contact information.
            </p>
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactEmailModal;
