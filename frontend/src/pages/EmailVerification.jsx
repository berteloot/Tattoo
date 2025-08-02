import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../services/api';
import { CheckCircle, XCircle, Mail, RefreshCw, ArrowLeft } from 'lucide-react';

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { success: showSuccessToast, error: showErrorToast } = useToast();
  
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error', 'expired'
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      setVerificationStatus('verifying');
      
      // Debug: Check if authAPI and verifyEmail exist
      console.log('authAPI:', authAPI);
      console.log('authAPI.verifyEmail:', authAPI.verifyEmail);
      
      if (!authAPI || !authAPI.verifyEmail) {
        console.error('authAPI.verifyEmail is not available');
        setVerificationStatus('error');
        return;
      }
      
      const response = await authAPI.verifyEmail(verificationToken);

      if (response.data.success) {
        setVerificationStatus('success');
        
        // Automatically log the user in
        if (response.data.data.token) {
          login(response.data.data.token, response.data.data.user);
        }
        
        showSuccessToast('Email Verified!', 'Welcome to Tattooed World!');
        
        // Redirect to home page after 3 seconds
        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      
      if (error.response?.status === 400) {
        if (error.response.data.error.includes('expired')) {
          setVerificationStatus('expired');
        } else {
          setVerificationStatus('error');
        }
      } else {
        setVerificationStatus('error');
      }
    }
  };

  const resendVerification = async (e) => {
    e.preventDefault();
    
    if (!email) {
              showErrorToast('Email Required', 'Please enter your email address');
      return;
    }

    try {
      setIsResending(true);
      
      // Debug: Check if authAPI and resendVerification exist
      console.log('authAPI:', authAPI);
      console.log('authAPI.resendVerification:', authAPI.resendVerification);
      
      if (!authAPI || !authAPI.resendVerification) {
        console.error('authAPI.resendVerification is not available');
        showErrorToast('API Error', 'API method not available. Please refresh the page.');
        return;
      }
      
      const response = await authAPI.resendVerification(email);

      if (response.data.success) {
        showSuccessToast('Email Sent!', 'Verification email sent! Please check your inbox.');
        setShowResendForm(false);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        showErrorToast('Invalid Email', error.response.data.error || 'Invalid email address');
      } else if (error.response?.status === 500) {
                  showErrorToast('Service Unavailable', 'Email service temporarily unavailable. Please try again later.');
        } else {
          showErrorToast('Resend Failed', 'Failed to resend verification email. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Email Verified Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Welcome to Tattooed World! Your account has been activated and you're now logged in.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">What's next?</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Browse tattoo artists by specialty and location</li>
                <li>• Read reviews and view portfolios</li>
                <li>• Book consultations with your favorite artists</li>
                <li>• Leave reviews after your sessions</li>
              </ul>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting you to the home page...
            </p>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Link Expired</h2>
            <p className="text-gray-600 mb-6">
              Your email verification link has expired. Please request a new verification email.
            </p>
            <button
              onClick={() => setShowResendForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Resend Verification Email
            </button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Verification Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't verify your email address. The link may be invalid or expired.
            </p>
            <button
              onClick={() => setShowResendForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Resend Verification Email
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  const renderResendForm = () => {
    if (!showResendForm) return null;

    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Resend Verification Email</h3>
        <form onSubmit={resendVerification} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isResending}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Verification Email
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowResendForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Email Verification</h1>
          <p className="mt-2 text-sm text-gray-600">
            Complete your Tattooed World registration
          </p>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderContent()}
          {renderResendForm()}
          
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 