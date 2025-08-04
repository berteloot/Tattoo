const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Protect routes - verify JWT token
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          artistProfile: {
            select: {
              id: true,
              studioName: true,
              isVerified: true,
              verificationStatus: true,
              isFeatured: true
            }
          }
        }
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'User account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error('Token verification error:', error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token failed'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

/**
 * Authorize roles - restrict access to specific user roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no user found'
      });
    }

    // Handle both direct user object and nested user object
    const user = req.user.user || req.user;
    const userRole = user.role;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        error: 'User role not found'
      });
    }

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: `User role '${userRole}' is not authorized to access this route`
      });
    }

    next();
  };
};

/**
 * Role-specific middleware functions
 */

// CLIENT permissions
const clientOnly = authorize('CLIENT');
const clientOrArtist = authorize('CLIENT', 'ARTIST', 'ARTIST_ADMIN');
const clientOrAdmin = authorize('CLIENT', 'ADMIN', 'ARTIST_ADMIN');

// ARTIST permissions
const artistOnly = authorize('ARTIST', 'ARTIST_ADMIN');
const artistOrAdmin = authorize('ARTIST', 'ADMIN', 'ARTIST_ADMIN');

// ADMIN permissions
const adminOnly = authorize('ADMIN', 'ARTIST_ADMIN');

/**
 * Artist verification middleware
 */
const requireArtistVerification = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no user found'
    });
  }

  if (req.user.role !== 'ARTIST' && req.user.role !== 'ARTIST_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Only artists can access this resource'
    });
  }

  if (!req.user.artistProfile) {
    return res.status(403).json({
      success: false,
      error: 'Artist profile not found'
    });
  }

  if (req.user.artistProfile.verificationStatus !== 'APPROVED') {
    return res.status(403).json({
      success: false,
      error: 'Artist account not verified. Please wait for admin approval.'
    });
  }

  next();
};

/**
 * Resource ownership middleware
 */
const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no user found'
      });
    }

    const resourceId = req.params.id || req.params.artistId || req.params.flashId || req.params.reviewId;
    
    if (!resourceId) {
      return res.status(400).json({
        success: false,
        error: 'Resource ID is required'
      });
    }

    try {
      let resource;
      let isOwner = false;

      switch (resourceType) {
        case 'artistProfile':
          resource = await prisma.artistProfile.findUnique({
            where: { id: resourceId },
            include: { user: true }
          });
          isOwner = resource && resource.userId === req.user.id;
          break;

        case 'flash':
          resource = await prisma.flash.findUnique({
            where: { id: resourceId },
            include: { artist: { include: { user: true } } }
          });
          isOwner = resource && resource.artist.userId === req.user.id;
          break;

        case 'review':
          resource = await prisma.review.findUnique({
            where: { id: resourceId }
          });
          isOwner = resource && resource.authorId === req.user.id;
          break;

        case 'user':
          resource = await prisma.user.findUnique({
            where: { id: resourceId }
          });
          isOwner = resource && resource.id === req.user.id;
          break;

        default:
          return res.status(400).json({
            success: false,
            error: 'Invalid resource type'
          });
      }

      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
      }

      if (!isOwner && req.user.role !== 'ADMIN' && req.user.role !== 'ARTIST_ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'You can only modify your own resources'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Ownership check error:', error);
      return res.status(500).json({
        success: false,
        error: 'Error checking resource ownership'
      });
    }
  };
};

/**
 * Optional auth - verify token if present, but don't require it
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true
        }
      });

      if (user && user.isActive) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      console.log('Optional auth token invalid:', error.message);
    }
  }

  next();
};

/**
 * Rate limiting for sensitive operations
 */
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
};

/**
 * Permission-based middleware
 */
const permissions = {
  // CLIENT permissions
  canViewArtists: clientOrArtist,
  canViewFlash: clientOrArtist,
  canCreateReview: clientOrArtist,
  canEditOwnReview: requireOwnership('review'),
  canViewOwnProfile: requireOwnership('user'),

  // ARTIST permissions
  canCreateArtistProfile: artistOnly,
  canEditOwnArtistProfile: requireOwnership('artistProfile'),
  canCreateFlash: requireArtistVerification,
  canEditOwnFlash: requireOwnership('flash'),
  canViewOwnReviews: artistOrAdmin,

  // ADMIN permissions
  canManageUsers: adminOnly,
  canVerifyArtists: adminOnly,
  canModerateContent: adminOnly,
  canFeatureArtists: adminOnly,
  canViewAdminActions: adminOnly,
  canManageSpecialties: adminOnly,
  canManageServices: adminOnly
};

module.exports = {
  protect,
  authorize,
  clientOnly,
  clientOrArtist,
  clientOrAdmin,
  artistOnly,
  artistOrAdmin,
  adminOnly,
  requireArtistVerification,
  requireOwnership,
  optionalAuth,
  rateLimit,
  permissions
}; 