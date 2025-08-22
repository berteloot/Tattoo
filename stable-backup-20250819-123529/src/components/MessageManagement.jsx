import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Type
} from 'lucide-react';
import { messagesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

// Rich Text Editor Toolbar Component
const TextEditorToolbar = ({ onInsert, textareaRef, currentContent }) => {
  const insertTag = (openTag, closeTag = null) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let replacement;
    if (closeTag) {
      replacement = selectedText ? `${openTag}${selectedText}${closeTag}` : `${openTag}${closeTag}`;
    } else {
      replacement = openTag;
    }
    
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    onInsert(newValue);
    
    // Set cursor position
    setTimeout(() => {
      const newCursorPos = closeTag && !selectedText ? start + openTag.length : start + replacement.length;
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const text = prompt('Enter link text (optional):') || url;
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      
      const linkText = selectedText || text;
      const linkTag = `<a href="${url}" target="_blank">${linkText}</a>`;
      
      const newValue = textarea.value.substring(0, start) + linkTag + textarea.value.substring(end);
      onInsert(newValue);
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + linkTag.length, start + linkTag.length);
      }, 0);
    }
  };

  const insertPreset = (preset) => {
    const presets = {
      'flash-sale': '🔥 <strong>Flash Sale!</strong> 50% off all flash tattoos this weekend only! <a href="https://your-booking-link.com" target="_blank">Book now</a>',
      'vacation': '🏖️ <strong>Vacation Notice:</strong> I\'ll be away from [start date] to [end date]. Booking will resume on [return date].',
      'new-flash': '✨ <strong>New Flash Available!</strong> Check out my latest designs. Limited spots available!',
      'booking-open': '📅 <strong>Booking Open!</strong> Now accepting appointments for [month]. <a href="https://your-booking-link.com" target="_blank">Book your session</a>'
    };
    
    const content = presets[preset];
    if (content) {
      onInsert(currentContent + (currentContent ? '\n\n' : '') + content);
    }
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertTag('<strong>', '</strong>'), title: 'Bold' },
    { icon: Italic, action: () => insertTag('<em>', '</em>'), title: 'Italic' },
    { icon: Underline, action: () => insertTag('<u>', '</u>'), title: 'Underline' },
    { icon: Link, action: insertLink, title: 'Insert Link' },
    { icon: List, action: () => insertTag('<ul>\n  <li>', '</li>\n</ul>'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertTag('<ol>\n  <li>', '</li>\n</ol>'), title: 'Numbered List' },
    { icon: Type, action: () => insertTag('<br/>'), title: 'Line Break' },
  ];

  const presetButtons = [
    { label: '🔥 Flash Sale', action: () => insertPreset('flash-sale') },
    { label: '🏖️ Vacation', action: () => insertPreset('vacation') },
    { label: '✨ New Flash', action: () => insertPreset('new-flash') },
    { label: '📅 Booking Open', action: () => insertPreset('booking-open') }
  ];

  
  return (
    <div className="border border-gray-300 rounded-t-lg bg-gray-50">
      {/* Main Toolbar */}
      <div className="flex items-center space-x-1 p-2 border-b border-gray-200">
        <div className="flex items-center space-x-1">
          {toolbarButtons.map((button, index) => (
            <button
              key={index}
              type="button"
              onClick={button.action}
              className="p-2 hover:bg-gray-200 rounded transition-colors"
              title={button.title}
            >
              <button.icon className="w-4 h-4 text-gray-600" />
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <div className="text-xs text-gray-500">
          HTML supported: &lt;strong&gt;, &lt;em&gt;, &lt;u&gt;, &lt;a&gt;, &lt;br&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;
        </div>
      </div>
      
      {/* Preset Templates */}
      <div className="flex items-center space-x-2 p-2">
        <span className="text-xs text-gray-500 font-medium">Quick Templates:</span>
        {presetButtons.map((preset, index) => (
          <button
            key={index}
            type="button"
            onClick={preset.action}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
            title={`Insert ${preset.label} template`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export const MessageManagement = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const { success, error: showError } = useToast();
  const contentTextareaRef = useRef(null);

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
                    Message Content * (Rich Text Editor)
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <TextEditorToolbar 
                      onInsert={(newContent) => setFormData({ ...formData, content: newContent })}
                      textareaRef={contentTextareaRef}
                      currentContent={formData.content}
                    />
                    <textarea
                      ref={contentTextareaRef}
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Your message content. Use the toolbar above to add formatting..."
                      className="w-full p-3 border-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-none rounded-b-lg resize-none"
                      rows="6"
                      maxLength="2000"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Character count: {formData.content.length}/2000
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
