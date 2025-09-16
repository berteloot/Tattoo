import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../services/api';

const EmailTemplates = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const { success, error } = useToast();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [previewData, setPreviewData] = useState({});
  const [testEmail, setTestEmail] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'EMAIL_VERIFICATION',
    subject: '',
    htmlContent: '',
    textContent: '',
    description: '',
    variables: [],
    isActive: true
  });

  const templateTypes = [
    { value: 'EMAIL_VERIFICATION', label: 'Email Verification' },
    { value: 'WELCOME', label: 'Welcome Email' },
    { value: 'PASSWORD_RESET', label: 'Password Reset' },
    { value: 'INCOMPLETE_PROFILE_REMINDER', label: 'Incomplete Profile Reminder' },
    { value: 'ARTIST_VERIFICATION', label: 'Artist Verification' },
    { value: 'REVIEW_NOTIFICATION', label: 'Review Notification' },
    { value: 'BOOKING_CONFIRMATION', label: 'Booking Confirmation' },
    { value: 'ARTIST_TO_CLIENT', label: 'Artist to Client' },
    { value: 'CLIENT_TO_ARTIST', label: 'Client to Artist' },
    { value: 'CLIENT_TO_STUDIO', label: 'Client to Studio' },
    { value: 'STUDIO_JOIN_REQUEST', label: 'Studio Join Request' },
    { value: 'STUDIO_JOIN_RESPONSE', label: 'Studio Join Response' }
  ];

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchTemplates();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching email templates...');
      const response = await api.get('/email-templates');
      console.log('✅ Email templates response:', response.data);
      
      if (response.data.success) {
        setTemplates(response.data.data);
        console.log('📧 Loaded templates:', response.data.data.length);
      }
    } catch (error) {
      console.error('❌ Error fetching templates:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        console.log('🔄 Templates fetch: Token expired, will be handled by AuthContext');
        error('Session Expired', 'Your session has expired. Please refresh the page if the issue persists.');
      } else {
        error('Error', 'Failed to fetch email templates');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setFormData({
      name: '',
      type: 'EMAIL_VERIFICATION',
      subject: '',
      htmlContent: '',
      textContent: '',
      description: '',
      variables: [],
      isActive: true
    });
    setIsCreating(true);
    setIsEditing(false);
    setSelectedTemplate(null);
  };

  const handleEditTemplate = (template) => {
    setFormData({
      name: template.name,
      type: template.type,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent || '',
      description: template.description || '',
      variables: template.variables || [],
      isActive: template.isActive
    });
    setIsEditing(true);
    setIsCreating(false);
    setSelectedTemplate(template);
  };

  const handleSaveTemplate = async () => {
    try {
      if (isCreating) {
        const response = await api.post('/email-templates', formData);
        if (response.data.success) {
          success('Success', 'Email template created successfully');
          fetchTemplates();
          setIsCreating(false);
        }
      } else {
        const response = await api.put(`/email-templates/${selectedTemplate.id}`, formData);
        if (response.data.success) {
          success('Success', 'Email template updated successfully');
          fetchTemplates();
          setIsEditing(false);
          setSelectedTemplate(null);
        }
      }
    } catch (error) {
      console.error('Error saving template:', error);
      error('Error', error.response?.data?.error || 'Failed to save template');
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      const response = await api.delete(`/email-templates/${templateId}`);
      if (response.data.success) {
        success('Success', 'Email template deleted successfully');
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      error('Error', 'Failed to delete template');
    }
  };

  const handlePreviewTemplate = async (template) => {
    try {
      const response = await api.post(`/email-templates/${template.id}/preview`, {
        variables: previewData
      });
      if (response.data.success) {
        // Open preview in new window
        const previewWindow = window.open('', '_blank');
        previewWindow.document.write(response.data.data.htmlContent);
        previewWindow.document.close();
      }
    } catch (error) {
      console.error('Error previewing template:', error);
      error('Error', 'Failed to preview template');
    }
  };

  const handleTestTemplate = async (template) => {
    if (!testEmail) {
      error('Error', 'Please enter a test email address');
      return;
    }

    try {
      const response = await api.post(`/email-templates/${template.id}/test`, {
        testEmail,
        variables: previewData
      });
      if (response.data.success) {
        success('Success', 'Test email sent successfully');
      } else {
        error('Error', 'Failed to send test email');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      error('Error', 'Failed to send test email');
    }
  };

  const addVariable = () => {
    const newVar = prompt('Enter variable name (e.g., firstName):');
    if (newVar && !formData.variables.includes(newVar)) {
      setFormData({
        ...formData,
        variables: [...formData.variables, newVar]
      });
    }
  };

  const removeVariable = (variable) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter(v => v !== variable)
    });
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading email templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Email Templates</h1>
              <p className="mt-2 text-gray-600">Manage automated email templates</p>
            </div>
            <button
              onClick={handleCreateTemplate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Template
            </button>
          </div>
        </div>

        {/* Templates List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Templates ({templates.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {templates.map((template) => (
              <div key={template.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900">{template.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        template.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {template.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{template.description}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Variables: {template.variables.join(', ') || 'None'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePreviewTemplate(template)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create/Edit Modal */}
        {(isCreating || isEditing) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {isCreating ? 'Create Email Template' : 'Edit Email Template'}
                </h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Welcome Email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {templateTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Welcome to Tattooed World!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Brief description of this template's purpose"
                  />
                </div>

                {/* Variables */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Variables
                    </label>
                    <button
                      onClick={addVariable}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      + Add Variable
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.variables.map((variable) => (
                      <span
                        key={variable}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {`{{${variable}}}`}
                        <button
                          onClick={() => removeVariable(variable)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* HTML Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    HTML Content
                  </label>
                  <textarea
                    value={formData.htmlContent}
                    onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    rows="15"
                    placeholder="Enter HTML content for the email..."
                  />
                </div>

                {/* Text Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Content (Optional)
                  </label>
                  <textarea
                    value={formData.textContent}
                    onChange={(e) => setFormData({ ...formData, textContent: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="5"
                    placeholder="Plain text version of the email..."
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active (template can be used)
                  </label>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(false);
                    setSelectedTemplate(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveTemplate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isCreating ? 'Create Template' : 'Update Template'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Email Modal */}
        {selectedTemplate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Test Email</h2>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Email Address
                  </label>
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="test@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preview Variables
                  </label>
                  <div className="space-y-2">
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable} className="flex space-x-2">
                        <label className="w-20 text-sm text-gray-600">{variable}:</label>
                        <input
                          type="text"
                          value={previewData[variable] || ''}
                          onChange={(e) => setPreviewData({
                            ...previewData,
                            [variable]: e.target.value
                          })}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder={`Enter ${variable}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleTestTemplate(selectedTemplate)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Send Test Email
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTemplates;
