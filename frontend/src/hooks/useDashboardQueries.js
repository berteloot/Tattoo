import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

// Custom hook for admin dashboard stats
export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard')
      return response.data?.data?.statistics || response.data?.statistics || {}
    },
    // Only fetch if user is authenticated
    enabled: true,
    // Prevent refetching for 30 seconds
    staleTime: 30 * 1000,
    // Cache for 5 minutes
    gcTime: 5 * 60 * 1000,
  })
}

// Custom hook for admin actions
export const useAdminActions = (limit = 5) => {
  return useQuery({
    queryKey: ['admin', 'actions', limit],
    queryFn: async () => {
      const response = await api.get(`/admin/actions?limit=${limit}`)
      return response.data?.data?.actions || response.data?.actions || []
    },
    enabled: true,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
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

// Custom hook for artist reviews
export const useArtistReviews = (artistId) => {
  return useQuery({
    queryKey: ['artist', 'reviews', artistId],
    queryFn: async () => {
      const response = await api.get(`/reviews?recipientId=${artistId}`)
      return response.data?.data?.reviews || response.data?.reviews || []
    },
    enabled: !!artistId,
    staleTime: 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
