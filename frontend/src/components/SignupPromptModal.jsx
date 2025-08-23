import React from 'react';
import { Link } from 'react-router-dom';
import { X, UserPlus, Mail, Globe, Instagram, Facebook, Twitter, Youtube, Linkedin, Calendar, MessageCircle } from 'lucide-react';

const SignupPromptModal = ({ isOpen, onClose, featureType = 'contact' }) => {
  if (!isOpen) return null;

  const getFeatureInfo = () => {
    switch (featureType) {
      case 'social':
        return {
          title: 'Connect with the Artist',
          description: 'Sign up to access social media links and stay connected with your favorite tattoo artists.',
          icon: <Instagram className="w-8 h-8 text-pink-500" />,
          benefits: [
            'Follow artists on social media',
            'See their latest work and updates',
            'Get notified about new designs',
            'Build your tattoo inspiration collection'
          ]
        };
      case 'website':
        return {
          title: 'Visit Artist Website',
          description: 'Sign up to access artist websites and explore their full portfolio and services.',
          icon: <Globe className="w-8 h-8 text-blue-500" />,
          benefits: [
            'View full artist portfolios',
            'See detailed service information',
            'Access exclusive content',
            'Learn about studio policies'
          ]
        };
      case 'calendly':
        return {
          title: 'Book Your Consultation',
          description: 'Sign up to schedule consultations and book appointments with tattoo artists.',
          icon: <Calendar className="w-8 h-8 text-green-500" />,
          benefits: [
            'Schedule consultations instantly',
            'Book appointments online',
            'Get artist availability',
            'Manage your tattoo journey'
          ]
        };
      case 'contact':
      default:
        return {
          title: 'Contact the Artist',
          description: 'Sign up to get in touch with tattoo artists and start your tattoo journey.',
          icon: <MessageCircle className="w-8 h-8 text-red-500" />,
          benefits: [
            'Send direct messages to artists',
            'Ask questions about designs',
            'Get pricing information',
            'Start planning your tattoo'
          ]
        };
    }
  };

  const featureInfo = getFeatureInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {featureInfo.icon}
            <h2 className="text-xl font-bold text-gray-900">{featureInfo.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 leading-relaxed">
            {featureInfo.description}
          </p>

          {/* Benefits */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">What you'll get:</h3>
            <ul className="space-y-2">
              {featureInfo.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-600">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Link
              to="/register"
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Sign Up - It's Free!
            </Link>
            
            <Link
              to="/login"
              onClick={onClose}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              Already have an account? Log in
            </Link>
          </div>

          {/* Quick facts */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Free forever</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>2-minute setup</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>No spam</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPromptModal;
