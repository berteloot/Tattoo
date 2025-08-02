const { body, validationResult } = require('express-validator');

/**
 * Flexible artist profile validation middleware
 * Handles both creation and updates with better error handling
 */
const validateArtistProfile = (isUpdate = false) => {
  const validations = [
    // Bio validation - more flexible for updates
    body('bio')
      .if(isUpdate)
      .optional()
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Bio must be between 1 and 1000 characters')
      .if(!isUpdate)
      .trim()
      .notEmpty()
      .withMessage('Bio is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Bio must be between 10 and 1000 characters'),

    // Studio name
    body('studioName')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Studio name must be less than 100 characters'),

    // Website validation with better URL handling
    body('website')
      .optional()
      .custom((value) => {
        if (!value || value.trim() === '') return true;
        
        // Allow empty strings and null values
        if (value === null || value === undefined || value === '') return true;
        
        const trimmedValue = value.trim();
        if (trimmedValue === '') return true;
        
        // Basic URL validation - more permissive
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(trimmedValue)) {
          throw new Error('Website must be a valid URL starting with http:// or https://');
        }
        return true;
      }),

    // Instagram handle
    body('instagram')
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage('Instagram handle must be less than 50 characters'),

    // Calendly URL with better validation
    body('calendlyUrl')
      .optional()
      .custom((value) => {
        if (!value || value.trim() === '') return true;
        
        // Allow empty strings and null values
        if (value === null || value === undefined || value === '') return true;
        
        const trimmedValue = value.trim();
        if (trimmedValue === '') return true;
        
        // Basic URL validation
        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(trimmedValue)) {
          throw new Error('Calendly URL must be a valid URL starting with http:// or https://');
        }
        return true;
      }),

    // Address
    body('address')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Address must be less than 200 characters'),

    // City validation - more flexible for updates
    body('city')
      .if(isUpdate)
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('City must be between 1 and 100 characters')
      .if(!isUpdate)
      .trim()
      .notEmpty()
      .withMessage('City is required')
      .isLength({ max: 100 })
      .withMessage('City must be less than 100 characters'),

    // State
    body('state')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('State must be less than 100 characters'),

    // Zip code
    body('zipCode')
      .optional()
      .trim()
      .isLength({ max: 20 })
      .withMessage('Zip code must be less than 20 characters'),

    // Country
    body('country')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Country must be less than 100 characters'),

    // Latitude with better number handling
    body('latitude')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new Error('Latitude must be a valid number');
        }
        if (num < -90 || num > 90) {
          throw new Error('Latitude must be between -90 and 90');
        }
        return true;
      }),

    // Longitude with better number handling
    body('longitude')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new Error('Longitude must be a valid number');
        }
        if (num < -180 || num > 180) {
          throw new Error('Longitude must be between -180 and 180');
        }
        return true;
      }),

    // Hourly rate with better number handling
    body('hourlyRate')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new Error('Hourly rate must be a valid number');
        }
        if (num < 0) {
          throw new Error('Hourly rate must be a positive number');
        }
        return true;
      }),

    // Min price with better number handling
    body('minPrice')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new Error('Minimum price must be a valid number');
        }
        if (num < 0) {
          throw new Error('Minimum price must be a positive number');
        }
        return true;
      }),

    // Max price with better number handling
    body('maxPrice')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined || value === '') return true;
        
        const num = parseFloat(value);
        if (isNaN(num)) {
          throw new Error('Maximum price must be a valid number');
        }
        if (num < 0) {
          throw new Error('Maximum price must be a positive number');
        }
        return true;
      }),

    // Specialty IDs - allow empty arrays
    body('specialtyIds')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined) return true;
        if (!Array.isArray(value)) {
          throw new Error('Specialty IDs must be an array');
        }
        return true;
      }),

    // Service IDs - allow empty arrays
    body('serviceIds')
      .optional()
      .custom((value) => {
        if (value === null || value === undefined) return true;
        if (!Array.isArray(value)) {
          throw new Error('Service IDs must be an array');
        }
        return true;
      })
  ];

  return [
    ...validations,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array().map(error => ({
            field: error.path,
            message: error.msg,
            value: error.value
          }))
        });
      }
      next();
    }
  ];
};

module.exports = {
  validateArtistProfile
}; 