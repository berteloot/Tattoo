import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

// Custom hook for admin dashboard stats
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      console.log('🔍 Fetching admin stats...');
      try {
        const response = await api.get('/admin/dashboard')
        console.log('✅ Admin stats response:', response.data);
        
        // Handle different response formats
        const stats = response.data?.data?.statistics || response.data?.statistics || {};
        console.log('📊 Extracted stats:', stats);
        return stats;
      } catch (error) {
        console.error('❌ Error fetching admin stats:', error);
        throw error;
      }
    },
    // Only fetch if user is authenticated
    enabled: true,
    // Prevent refetching for 30 seconds
    staleTime: 30 * 1000,
    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Retry failed requests
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Custom hook for admin actions
export const useAdminActions = (limit = 5) => {
  return useQuery({
    queryKey: ['admin', 'actions', limit],
    queryFn: async () => {
      console.log('🔍 Fetching admin actions...', { limit });
      try {
        const response = await api.get(`/admin/actions?limit=${limit}`)
        console.log('✅ Admin actions response:', response.data);
        
        // Handle different response formats
        const actions = response.data?.data?.actions || response.data?.actions || [];
        console.log('📋 Extracted actions:', actions);
        return actions;
      } catch (error) {
        console.error('❌ Error fetching admin actions:', error);
        throw error;
      }
    },
    enabled: true,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Custom hook for artist profile
export const useArtistProfile = (artistId) => {
  return useQuery({
    queryKey: ['artist', 'profile', artistId],
    queryFn: async () => {
      const response = await api.get(`/artists/${artistId}`)
      return response.data?.data?.artist || response.data?.artist || {}
    },
    enabled: !!artistId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Custom hook for artist flash items
export const useArtistFlash = (artistId) => {
  return useQuery({
    queryKey: ['artist', 'flash', artistId],
    queryFn: async () => {
      const response = await api.get(`/flash?artistId=${artistId}`)
      return response.data?.data?.flash || response.data?.flash || []
    },
    enabled: !!artistId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Custom hook for artist tattoo gallery items
export const useArtistTattoos = (artistId) => {
  return useQuery({
    queryKey: ['artist', 'tattoos', artistId],
    queryFn: async () => {
      const response = await api.get(`/gallery?artistId=${artistId}`)
      return response.data?.data?.items || response.data?.items || []
    },
    enabled: !!artistId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

// Custom hook for artist reviews (approved only)
export const useArtistReviews = (userId) => {
  return useQuery({
    queryKey: ['artist', 'reviews', userId],
    queryFn: async () => {
      try {
        console.log('🔍 Fetching reviews for user ID:', userId);
        const response = await api.get(`/reviews?recipientId=${userId}`);
        const reviews = response.data?.data?.reviews || response.data?.reviews || [];
        console.log('📋 Fetched reviews:', reviews.length, 'reviews');
        return reviews;
      } catch (error) {
        console.error('❌ Error fetching artist reviews:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Custom hook for artist ALL reviews (including unapproved) for dashboard
export const useArtistAllReviews = (userId) => {
  return useQuery({
    queryKey: ['artist', 'allReviews', userId],
    queryFn: async () => {
      try {
        console.log('🔍 Fetching ALL reviews for user ID:', userId);
        const response = await api.get(`/reviews/all?recipientId=${userId}`);
        const reviews = response.data?.data?.reviews || response.data?.reviews || [];
        console.log('📋 Fetched ALL reviews:', reviews.length, 'reviews');
        return reviews;
      } catch (error) {
        console.error('❌ Error fetching artist all reviews:', error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })
}

// Custom hook for specialties
export const useSpecialties = () => {
  return useQuery({
    queryKey: ['specialties'],
    queryFn: async () => {
      const response = await api.get('/specialties')
      return response.data?.data?.specialties || response.data?.specialties || []
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Custom hook for services
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await api.get('/services')
      return response.data?.data?.services || response.data?.services || []
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  })
}
