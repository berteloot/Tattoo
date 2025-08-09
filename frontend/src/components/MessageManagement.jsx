import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  AlertCircle,
  Info,
  Star,
  Save,
  X
} from 'lucide-react';
import { messagesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export const MessageManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const { success, error: showError } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 1,
    expiresAt: '',
    showOnCard: true,
    showOnProfile: true
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getMyMessages();
      setMessages(response.data.data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      showError('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Helper to convert datetime-local to ISO string or null
      const toISOorNull = (val) => {
        if (!val) return null;
        const d = new Date(val);
        return isNaN(d.getTime()) ? null : d.toISOString();
      };

      // Validate required content
      const trimmedContent = formData.content?.trim();
      if (!trimmedContent) {
        showError('Error', 'Message content is required');
        return;
      }

      const submitData = {
        title: formData.title?.trim() || null,
        content: trimmedContent,
        priority: parseInt(formData.priority) || 1,
        showOnCard: !!formData.showOnCard,
        showOnProfile: !!formData.showOnProfile,
        expiresAt: toISOorNull(formData.expiresAt)
      };

      // Remove null/undefined values but keep empty strings for content validation
      Object.keys(submitData).forEach(
        key => (submitData[key] === null || submitData[key] === undefined) && delete submitData[key]
      );

      console.log('Submitting message data:', submitData);

      if (editingMessage) {
        await messagesAPI.update(editingMessage.id, submitData);
        success('Message updated successfully');
      } else {
        await messagesAPI.create(submitData);
        success('Message created successfully');
      }

      resetForm();
      loadMessages();
    } catch (error) {
      // Improved error logging to see server validation messages
      const serverMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        String(error);
      
      console.error('Error saving message:', serverMsg, error?.response?.data);
      showError('Error', serverMsg);
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setFormData({
      title: message.title || '',
      content: message.content || '',
      priority: message.priority || 1,
      expiresAt: message.expiresAt ? new Date(message.expiresAt).toISOString().slice(0, 16) : '',
      showOnCard: message.showOnCard,
      showOnProfile: message.showOnProfile
    });
    setShowForm(true);
  };

  const handleDelete = async (messageId) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await messagesAPI.delete(messageId);
      success('Message deleted successfully');
      loadMessages();
    } catch (error) {
      console.error('Error deleting message:', error);
      showError('Error', 'Failed to delete message');
    }
  };

  const toggleActive = async (message) => {
    try {
      await messagesAPI.update(message.id, { isActive: !message.isActive });
      success(`Message ${message.isActive ? 'deactivated' : 'activated'}`);
      loadMessages();
    } catch (error) {
      console.error('Error toggling message status:', error);
      showError('Error', 'Failed to update message status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 1,
      expiresAt: '',
      showOnCard: true,
      showOnProfile: true
    });
    setEditingMessage(null);
    setShowForm(false);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 3: return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 2: return <Star className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      default: return 'Low';
    }
  };

  const isExpired = (expiresAt) => {
    return expiresAt && new Date(expiresAt) <= new Date();
  };

  const activeMessages = messages.filter(m => m.isActive && !isExpired(m.expiresAt));

  if (loading) {
    return <div className="text-center py-8">Loading messages...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Message Panel</h3>
          <p className="text-sm text-gray-600">
            Manage messages that appear on your profile and artist cards. 
            Active: {activeMessages.length}/5
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          disabled={activeMessages.length >= 5}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          <span>Add Message</span>
        </button>
      </div>

      {/* Message Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">
                  {editingMessage ? 'Edit Message' : 'Create New Message'}
                </h4>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Flash Sale, Vacation Notice"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength="200"
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Your message content. You can use HTML tags like <a>, <strong>, <em>, etc."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="4"
                    maxLength="2000"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    HTML supported. Character count: {formData.content.length}/2000
                  </p>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1}>Low (Blue)</option>
                    <option value={2}>Medium (Yellow)</option>
                    <option value={3}>High (Red)</option>
                  </select>
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                {/* Display Options */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Display Options</label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.showOnProfile}
                        onChange={(e) => setFormData({ ...formData, showOnProfile: e.target.checked })}
                        className="mr-2"
                      />
                      Show on Profile
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.showOnCard}
                        onChange={(e) => setFormData({ ...formData, showOnCard: e.target.checked })}
                        className="mr-2"
                      />
                      Show on Cards
                    </label>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingMessage ? 'Update' : 'Create'} Message</span>
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Messages List */}
      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No messages yet. Create your first message to communicate with potential clients!
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`border rounded-lg p-4 ${
                message.isActive && !isExpired(message.expiresAt)
                  ? 'border-green-200 bg-green-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getPriorityIcon(message.priority)}
                    <span className="text-sm font-medium text-gray-500">
                      {getPriorityText(message.priority)} Priority
                    </span>
                    {message.expiresAt && (
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Expires: {new Date(message.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {isExpired(message.expiresAt) && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Expired
                      </span>
                    )}
                  </div>

                  {message.title && (
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {message.title}
                    </h4>
                  )}

                  <div
                    className="text-gray-700 text-sm mb-3"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>Profile: {message.showOnProfile ? 'Yes' : 'No'}</span>
                    <span>Cards: {message.showOnCard ? 'Yes' : 'No'}</span>
                    <span>Created: {new Date(message.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleActive(message)}
                    className={`p-2 rounded-lg ${
                      message.isActive
                        ? 'text-green-600 hover:bg-green-100'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={message.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {message.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(message)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(message.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
