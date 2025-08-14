import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { studiosAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { ArrowLeft, MapPin, Building2, CheckCircle } from 'lucide-react';

const CreateStudio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    city: '',
    state: '',
    country: 'USA',
    phoneNumber: '',
    email: '',
    website: ''
  });

  // Handle pre-filled studio name from navigation state
  useEffect(() => {
    if (location.state?.prefillStudioName) {
      setFormData(prev => ({
        ...prev,
        title: location.state.prefillStudioName
      }));
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressSelect = (placeData) => {
    // Auto-fill form fields when address is selected from Google Places
    setFormData(prev => ({
      ...prev,
      address: placeData.address || prev.address,
      city: placeData.city || prev.city,
      state: placeData.state || prev.state,
      country: placeData.country || prev.country
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🎯 Form submission started');
    
    // Validate required fields
    if (!formData.title || !formData.address || !formData.city || !formData.state || !formData.country) {
      console.log('❌ Validation failed:', { title: !!formData.title, address: !!formData.address, city: !!formData.city, state: !!formData.state, country: !!formData.country });
      error('Missing Information', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const newStudio = {
        title: formData.title,
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        phoneNumber: formData.phoneNumber || '',
        email: formData.email || '',
        website: formData.website || '',
        isActive: true,
        isVerified: true, // Auto-approve new studios
        verificationStatus: 'APPROVED'
      };

      console.log('🚀 Creating studio:', newStudio);
      const response = await studiosAPI.create(newStudio);
      
      if (response.data.success) {
        const createdStudio = response.data.data.studio;
        console.log('✅ Studio created successfully:', createdStudio);
        
        success(
          'Studio Created Successfully!', 
          `${createdStudio.title} has been created and approved. You can now create your artist profile.`
        );
        
        // Redirect to artist profile creation with studio info
        navigate('/dashboard', { 
          state: { 
            studioCreated: true, 
            studio: createdStudio,
            message: 'Studio created successfully! Now create your artist profile.' 
          } 
        });
      } else {
        error('Studio Creation Failed', response.data.error || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('❌ Error creating studio:', err);
      error('Error Creating Studio', err.response?.data?.error || err.message || 'Failed to create studio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          
          <div className="flex items-center mb-4">
            <Building2 className="w-8 h-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Create New Studio</h1>
          </div>
          
          <p className="text-gray-600">
            Create your studio first, then come back to create your artist profile. 
            This ensures your profile is properly linked to your studio.
          </p>
        </div>

        {/* Studio Creation Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pro Tip */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-blue-900">💡 Best Practice</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Create your studio first, then create your artist profile. This ensures proper linking 
                    and makes it easier for clients to find you. New studios are automatically approved.
                  </p>
                </div>
              </div>
            </div>

            {/* Studio Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Studio Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your studio name"
                required
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <AddressAutocomplete
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                onPlaceSelect={handleAddressSelect}
                placeholder="Start typing your address..."
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Start typing to see address suggestions from Google Places
              </p>
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Will be auto-filled from address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                required
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-filled from address selection
              </p>
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State/Province <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Will be auto-filled from address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                required
                readOnly
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-filled from address selection
              </p>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select country</option>
                <option value="USA">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Spain">Spain</option>
                <option value="Italy">Italy</option>
                <option value="Netherlands">Netherlands</option>
                <option value="Belgium">Belgium</option>
                <option value="Switzerland">Switzerland</option>
                <option value="Austria">Austria</option>
                <option value="Sweden">Sweden</option>
                <option value="Norway">Norway</option>
                <option value="Denmark">Denmark</option>
                <option value="Finland">Finland</option>
                <option value="Poland">Poland</option>
                <option value="Czech Republic">Czech Republic</option>
                <option value="Hungary">Hungary</option>
                <option value="Slovakia">Slovakia</option>
                <option value="Slovenia">Slovenia</option>
                <option value="Croatia">Croatia</option>
                <option value="Serbia">Serbia</option>
                <option value="Bulgaria">Bulgaria</option>
                <option value="Romania">Romania</option>
                <option value="Greece">Greece</option>
                <option value="Portugal">Portugal</option>
                <option value="Ireland">Ireland</option>
                <option value="Iceland">Iceland</option>
                <option value="Luxembourg">Luxembourg</option>
                <option value="Liechtenstein">Liechtenstein</option>
                <option value="Monaco">Monaco</option>
                <option value="Andorra">Andorra</option>
                <option value="San Marino">San Marino</option>
                <option value="Vatican City">Vatican City</option>
                <option value="Malta">Malta</option>
                <option value="Cyprus">Cyprus</option>
                <option value="Estonia">Estonia</option>
                <option value="Latvia">Latvia</option>
                <option value="Lithuania">Lithuania</option>
                <option value="Other">Other</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Auto-filled from address selection, but can be manually changed
              </p>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="studio@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourstudio.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Studio'}
              </button>
            </div>
          </form>
        </div>

        {/* Next Steps Info */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start">
            <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-medium text-green-900">What Happens Next?</h3>
              <ol className="mt-2 text-sm text-green-700 space-y-1">
                <li>1. Your studio will be created and automatically approved</li>
                <li>2. You'll be redirected to create your artist profile</li>
                <li>3. Your profile will be automatically linked to the studio</li>
                <li>4. You can start adding flash items and managing your portfolio</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStudio;
