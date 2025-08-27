import { Link } from 'react-router-dom'
import { MapPin, Users, Star, Palette, Search, Filter, Plus, Building2 } from 'lucide-react'
import { StudioMap } from '../components/StudioMap'
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { apiCallWithFallback, checkApiHealth } from '../utils/apiHealth'

export const Home = () => {
  console.log('Home component rendering')
  const [featuredArtists, setFeaturedArtists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedArtists = async () => {
      try {
        console.log('Fetching featured artists for home page...')
        
        const result = await apiCallWithFallback(
          () => api.get('/artists?featured=true&limit=3'),
          { artists: getDummyFeaturedArtists() }
        )
        
        if (result.isFallback) {
          console.log('Using fallback featured artists data')
          setFeaturedArtists(result.data.artists)
        } else {
          console.log('Using API featured artists data')
          setFeaturedArtists(result.data.data.artists || [])
        }
      } catch (error) {
        console.error('Unexpected error in fetchFeaturedArtists:', error)
        setFeaturedArtists(getDummyFeaturedArtists())
      } finally {
        setLoading(false)
      }
    }

    // Check API health first
    checkApiHealth().then(() => {
      fetchFeaturedArtists()
    })
  }, [])

  const getDummyFeaturedArtists = () => [
    {
      id: '1',
      user: { firstName: 'Sarah', lastName: 'Chen', role: 'ARTIST' },
      studioName: 'Ink & Soul Studio',
      bio: 'Award-winning traditional tattoo artist with 8 years of experience.',
      city: 'Tokyo',
      state: 'Japan',
      averageRating: 4.9,
      reviewCount: 327,
      specialties: [{ name: 'Traditional' }, { name: 'Japanese' }],
      isVerified: true,
      featured: true,
      profilePictureUrl: 'https://via.placeholder.com/150'
    },
    {
      id: '2',
      user: { firstName: 'Marcus', lastName: 'Rodriguez', role: 'ARTIST' },
      studioName: 'Black Canvas Tattoo',
      bio: 'Master of black and grey realism. Creating stunning portraits.',
      city: 'Los Angeles',
      state: 'California',
      averageRating: 4.8,
      reviewCount: 289,
      specialties: [{ name: 'Black & Grey' }],
      isVerified: true,
      featured: true,
      profilePictureUrl: 'https://via.placeholder.com/150'
    },
    {
      id: '3',
      user: { firstName: 'Emma', lastName: 'Thompson', role: 'ARTIST' },
      studioName: 'Simple Lines Studio',
      bio: 'Minimalist tattoo specialist creating elegant, simple designs.',
      city: 'London',
      state: 'England',
      averageRating: 4.7,
      reviewCount: 456,
      specialties: [{ name: 'Minimalist' }, { name: 'Neo-Traditional' }],
      isVerified: true,
      featured: true,
      profilePictureUrl: 'https://via.placeholder.com/150'
    }
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <span className="tag tag--yellow">GLOBAL PLATFORM</span>
          <h1>THE WORLD'S LEADING TATTOO ARTIST NETWORK</h1>
          <p className="deck">
            Connect with exceptional tattoo artists worldwide. Discover portfolios, read authentic reviews, 
            and find your perfect artist anywhere in the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <Link to="/artists" className="cta">
              <Search style={{ width: '20px', height: '20px', marginRight: '12px' }} />
              FIND ARTISTS
            </Link>
            <Link to="/register" className="cta cta--outline">
              <Plus style={{ width: '20px', height: '20px', marginRight: '12px' }} />
              JOIN AS ARTIST
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-8 md:mb-12">
            <span className="tag tag--yellow">GLOBAL DISCOVERY</span>
            <h2>FIND STUDIOS ANYWHERE IN THE WORLD</h2>
            <p className="deck">
              Explore our interactive map to discover talented tattoo studios globally. 
              From New York to Tokyo, London to Sydney - find exceptional artists worldwide.
            </p>
          </div>
          
          <div className="border-2 border-black p-4">
            <StudioMap />
          </div>
        </div>
      </section>

      {/* CTA Bar */}
      <section className="border-t border-b border-gray-200 py-8 md:py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            <div className="flex-1">
              <h3>EXPAND YOUR REACH GLOBALLY</h3>
              <p className="small">
                Join thousands of artists worldwide and connect with clients across the globe
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full lg:w-auto">
              <Link to="/register" className="cta text-center">
                <Building2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                JOIN GLOBAL NETWORK
              </Link>
              <Link to="/artists" className="cta text-center">
                <Search style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                BROWSE WORLDWIDE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">WHY CHOOSE TATTOOED WORLD?</h2>
            <p className="section-subtitle">
              Connect with exceptional tattoo artists worldwide. Discover portfolios, read authentic reviews, 
              and find your perfect artist anywhere in the world.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 flex items-center justify-center mx-auto mb-4 md:mb-6 rounded-lg">
                <MapPin className="w-8 h-8 md:w-10 md:h-10 text-black" />
              </div>
              <h3>GLOBAL REACH</h3>
              <p className="small">
                Discover exceptional artists worldwide with our advanced location search and global network.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 flex items-center justify-center mx-auto mb-4 md:mb-6 rounded-lg">
                <Star className="w-8 h-8 md:w-10 md:h-10 text-black" />
              </div>
              <h3>VERIFIED EXCELLENCE</h3>
              <p className="small">
                Read authentic reviews from real clients worldwide.
              </p>
            </div>
            <div className="text-center md:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-400 flex items-center justify-center mx-auto mb-4 md:mb-6 rounded-lg">
                <Palette className="w-8 h-8 md:w-10 md:h-10 text-black" />
              </div>
              <h3>DIVERSE STYLES</h3>
              <p className="small">
                From traditional to modern, minimalist to complex - find artists specializing in every style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artists Section */}
      <section className="section" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">FEATURED ARTISTS</h2>
            <Link to="/artists" className="section-link">
              VIEW ALL ARTISTS →
            </Link>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="card__media bg-gray-200"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {featuredArtists.map((artist) => (
                <div key={artist.id} className="card group border-2 border-black p-6">
                  <div className="card__media bg-gray-100 flex items-center justify-center mb-4">
                    {artist.profilePictureUrl ? (
                      <img
                        src={artist.profilePictureUrl}
                        alt={`${artist.user.firstName} ${artist.user.lastName}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Users className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <div className="card__category mb-3">
                    <span className="tag tag--blue">FEATURED</span>
                  </div>
                  <div className="card__title mb-3">
                    {artist.user.firstName} {artist.user.lastName}
                  </div>
                  <div className="card__meta mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>{artist.averageRating} ({artist.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {artist.city}, {artist.state}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4">{artist.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {artist.specialties.slice(0, 3).map((specialty, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {specialty.name}
                      </span>
                    ))}
                  </div>
                  <Link 
                    to={`/artists/${artist.id}`} 
                    className="mt-auto inline-block text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    VIEW PROFILE →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA */}
      <section className="section" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h2>READY TO FIND YOUR PERFECT ARTIST?</h2>
            <p className="deck mb-8">
              Join thousands of satisfied clients who found their perfect tattoo artist through Tattooed World. 
              Start your journey today and discover exceptional talent worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/artists" className="cta text-lg px-8 py-4">
                <Search style={{ width: '20px', height: '20px', marginRight: '12px' }} />
                FIND ARTISTS
              </Link>
              <Link to="/register" className="cta text-lg px-8 py-4">
                <Plus style={{ width: '20px', height: '20px', marginRight: '12px' }} />
                JOIN AS ARTIST
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 