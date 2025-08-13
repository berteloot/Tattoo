import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { api } from '../services/api'

export const FavoriteClients = () => {
  const { user } = useAuth()
  const { success, error: showError } = useToast()
  
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [selectedClients, setSelectedClients] = useState([])
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    sendToAll: false
  })

  useEffect(() => {
    loadFavoriteClients()
  }, [])

  const loadFavoriteClients = async () => {
    try {
      setLoading(true)
      const response = await api.get('/artists/my-favorites')
      setClients(response.data.data.clients || [])
    } catch (error) {
      console.error('Error loading favorite clients:', error)
      showError('Failed to load favorite clients')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setEmailForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleClientSelection = (clientId) => {
    setSelectedClients(prev => {
      if (prev.includes(clientId)) {
        return prev.filter(id => id !== clientId)
      } else {
        return [...prev, clientId]
      }
    })
  }

  const handleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([])
    } else {
      setSelectedClients(clients.map(client => client.client.id))
    }
  }

  const handleSendEmail = async (e) => {
    e.preventDefault()
    
    if (!emailForm.subject.trim() || !emailForm.message.trim()) {
      showError('Please fill in both subject and message')
      return
    }

    if (!emailForm.sendToAll && selectedClients.length === 0) {
      showError('Please select at least one client or choose "Send to all"')
      return
    }

    try {
      setSendingEmail(true)
      
      const payload = {
        subject: emailForm.subject,
        message: emailForm.message,
        sendToAll: emailForm.sendToAll
      }

      if (!emailForm.sendToAll) {
        payload.clientIds = selectedClients
      }

      const response = await api.post('/artists/email-favorites', payload)
      
      success(response.data.data.message)
      setShowEmailForm(false)
      setEmailForm({ subject: '', message: '', sendToAll: false })
      setSelectedClients([])
      
      // Show detailed results if there were any failures
      const failedEmails = response.data.data.results.filter(result => !result.success)
      if (failedEmails.length > 0) {
        console.warn('Some emails failed to send:', failedEmails)
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      showError(error.response?.data?.error || 'Failed to send emails')
    } finally {
      setSendingEmail(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading favorite clients...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Favorite Clients</h2>
            <p className="text-sm text-gray-600 mt-1">
              {clients.length} client{clients.length !== 1 ? 's' : ''} have added you to their favorites
            </p>
          </div>
          {clients.length > 0 && (
            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              {showEmailForm ? 'Cancel' : 'Email Clients'}
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {clients.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite clients yet</h3>
            <p className="text-gray-600">
              When clients add you to their favorites, they'll appear here and you can reach out to them.
            </p>
          </div>
        ) : (
          <>
            {/* Email Form */}
            {showEmailForm && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Send Email to Favorite Clients</h3>
                <form onSubmit={handleSendEmail} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={emailForm.subject}
                      onChange={handleEmailFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your email subject..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={emailForm.message}
                      onChange={handleEmailFormChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Write your message to your favorite clients..."
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="sendToAll"
                        checked={emailForm.sendToAll}
                        onChange={handleEmailFormChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Send to all favorite clients</span>
                    </label>
                  </div>

                  {!emailForm.sendToAll && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700">Select Clients</h4>
                        <button
                          type="button"
                          onClick={handleSelectAll}
                          className="text-sm text-blue-600 hover:text-blue-500"
                        >
                          {selectedClients.length === clients.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {clients.map(client => (
                          <label key={client.client.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedClients.includes(client.client.id)}
                              onChange={() => handleClientSelection(client.client.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              {client.client.firstName} {client.client.lastName}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={sendingEmail}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
                    >
                      {sendingEmail ? 'Sending...' : 'Send Email'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Clients List */}
            <div className="space-y-4">
              {clients.map(client => (
                <div key={client.client.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {client.client.avatar ? (
                        <img 
                          src={client.client.avatar} 
                          alt={`${client.client.firstName} ${client.client.lastName}`}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-600 font-medium">
                          {client.client.firstName.charAt(0)}{client.client.lastName.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {client.client.firstName} {client.client.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{client.client.email}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-xs text-gray-500">
                          Favorited {new Date(client.client.favoritedAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {client.client.reviewCount} review{client.client.reviewCount !== 1 ? 's' : ''}
                        </span>
                        {client.client.averageRating > 0 && (
                          <span className="text-xs text-gray-500">
                            ⭐ {client.client.averageRating}/5
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={`mailto:${client.client.email}`}
                      className="text-blue-600 hover:text-blue-500 text-sm"
                    >
                      Email
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
} 