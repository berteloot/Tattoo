import React, { useState, useEffect } from 'react';
import { Edit3, Save, X, DollarSign, Clock, Trash2 } from 'lucide-react';
import { artistServicesAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

export const ArtistServicesManager = ({ artistId, onServicesUpdated }) => {
  const { success, error: showError } = useToast();
  const [services, setServices] = useState([]);
  const [artistServices, setArtistServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [editForm, setEditForm] = useState({
    customPrice: '',
    customDuration: ''
  });

  // Fetch all available services and artist's custom pricing
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [servicesRes, artistServicesRes] = await Promise.all([
          fetch('/api/services'),
          fetch(`/api/artist-services/artist/${artistId}`)
        ]);

        const servicesData = await servicesRes.json();
        const artistServicesData = await artistServicesRes.json();

        if (servicesData.success) {
          setServices(servicesData.data.services);
        }

        if (artistServicesData.success) {
          setArtistServices(artistServicesData.data.artistServices);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        showError('Failed to load services');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [artistId, showError]);

  // Get artist's custom price for a service, or fall back to default
  const getServicePrice = (serviceId) => {
    const artistService = artistServices.find(as => as.serviceId === serviceId);
    return artistService?.customPrice || null;
  };

  // Get artist's custom duration for a service, or fall back to default
  const getServiceDuration = (serviceId) => {
    const artistService = artistServices.find(as => as.serviceId === serviceId);
    return artistService?.customDuration || null;
  };

  // Handle edit button click
  const handleEdit = (service) => {
    setEditingService(service);
    setEditForm({
      customPrice: getServicePrice(service.id)?.toString() || '',
      customDuration: getServiceDuration(service.id)?.toString() || ''
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingService(null);
    setEditForm({ customPrice: '', customDuration: '' });
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save changes
  const handleSave = async () => {
    if (!editingService) return;

    try {
      setLoading(true);
      
      const data = {
        serviceId: editingService.id,
        customPrice: editForm.customPrice ? parseFloat(editForm.customPrice) : null,
        customDuration: editForm.customDuration ? parseInt(editForm.customDuration) : null
      };

      const response = await artistServicesAPI.createOrUpdate(data);
      
      if (response.data.success) {
        success('Service pricing updated successfully');
        
        // Update local state
        const updatedArtistService = response.data.data.artistService;
        setArtistServices(prev => {
          const existing = prev.find(as => as.serviceId === editingService.id);
          if (existing) {
            return prev.map(as => 
              as.serviceId === editingService.id ? updatedArtistService : as
            );
          } else {
            return [...prev, updatedArtistService];
          }
        });

        // Notify parent component
        if (onServicesUpdated) {
          onServicesUpdated();
        }
      }
    } catch (err) {
      console.error('Error updating service pricing:', err);
      showError('Failed to update service pricing');
    } finally {
      setLoading(false);
      setEditingService(null);
      setEditForm({ customPrice: '', customDuration: '' });
    }
  };

  // Handle remove custom pricing (revert to default)
  const handleRemoveCustomPricing = async (serviceId) => {
    try {
      setLoading(true);
      
      const artistService = artistServices.find(as => as.serviceId === serviceId);
      if (!artistService) return;

      await artistServicesAPI.delete(artistService.id);
      
      // Remove from local state
      setArtistServices(prev => prev.filter(as => as.serviceId !== serviceId));
      
      success('Custom pricing removed successfully');
      
      // Notify parent component
      if (onServicesUpdated) {
        onServicesUpdated();
      }
    } catch (err) {
      console.error('Error removing custom pricing:', err);
      showError('Failed to remove custom pricing');
    } finally {
      setLoading(false);
    }
  };

  if (loading && services.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Service Pricing</h3>
        <p className="text-sm text-gray-500">
          Set custom prices for your services or use the default pricing
        </p>
      </div>

      <div className="grid gap-4">
        {services.map((service) => {
          const isEditing = editingService?.id === service.id;
          const customPrice = getServicePrice(service.id);
          const customDuration = getServiceDuration(service.id);
          const hasCustomPricing = customPrice !== null || customDuration !== null;

          return (
            <div
              key={service.id}
              className={`bg-white border rounded-lg p-4 ${
                hasCustomPricing ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                  {service.description && (
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  )}
                  
                  <div className="flex items-center gap-6 mt-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Price: 
                        <span className={`ml-1 font-medium ${
                          customPrice !== null ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          ${customPrice !== null ? customPrice : service.price || 'N/A'}
                        </span>
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Duration: 
                        <span className={`ml-1 font-medium ${
                          customDuration !== null ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {customDuration !== null ? customDuration : service.duration || 'N/A'} min
                        </span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
                        title="Save changes"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(service)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit pricing"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {hasCustomPricing && (
                        <button
                          onClick={() => handleRemoveCustomPricing(service.id)}
                          disabled={loading}
                          className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove custom pricing"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Price ($)
                      </label>
                      <input
                        type="number"
                        name="customPrice"
                        value={editForm.customPrice}
                        onChange={handleInputChange}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={service.price?.toString() || "Default price"}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to use default price (${service.price || 'N/A'})
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Custom Duration (minutes)
                      </label>
                      <input
                        type="number"
                        name="customDuration"
                        value={editForm.customDuration}
                        onChange={handleInputChange}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={service.duration?.toString() || "Default duration"}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to use default duration ({service.duration || 'N/A'} min)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {services.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No services available
        </div>
      )}
    </div>
  );
};
