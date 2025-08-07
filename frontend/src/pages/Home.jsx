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
      user: { firstName: 'Sarah', lastName: 'Chen' },
      studioName: 'Ink & Soul Studio',
      bio: 'Award-winning traditional tattoo artist with 8 years of experience.',
      city: 'Montreal',
      state: 'Quebec',
      averageRating: 4.9,
      reviewCount: 127,
      specialties: [{ name: 'Traditional' }, { name: 'Japanese' }],
      isVerified: true,
      featured: true
    },
    {
      id: '2',
      user: { firstName: 'Marcus', lastName: 'Rodriguez' },
      studioName: 'Black Canvas Tattoo',
      bio: 'Master of black and grey realism. Creating stunning portraits.',
      city: 'Montreal',
      state: 'Quebec',
      averageRating: 4.8,
      reviewCount: 89,
      specialties: [{ name: 'Black & Grey' }],
      isVerified: true,
      featured: true
    },
    {
      id: '3',
      user: { firstName: 'Emma', lastName: 'Thompson' },
      studioName: 'Simple Lines Studio',
      bio: 'Minimalist tattoo specialist creating elegant, simple designs.',
      city: 'Montreal',
      state: 'Quebec',
      averageRating: 4.7,
      reviewCount: 156,
      specialties: [{ name: 'Minimalist' }, { name: 'Neo-Traditional' }],
      isVerified: true,
      featured: true
    }
  ]

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-br from-cream-50 to-editorial-50">
        <div className="max-w-4xl mx-auto px-4">
          <span className="category-tag mb-4 inline-block">FEATURED DESTINATION</span>
          <h1 className="highlighted-title mb-6">
            Find Your Perfect
            <span className="text-[#fedd33]"> Tattoo Studio</span>
          </h1>
          <p className="editorial-text text-xl mb-8 max-w-2xl mx-auto">
            Discover talented tattoo artists and studios in Montreal. Browse portfolios, read reviews, 
            and book your next piece with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/map"
              className="btn bg-[#fedd33] text-black hover:bg-yellow-400 btn-lg font-bold"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Explore Studios
            </Link>
            <Link
              to="/register"
              className="btn border-[#fedd33] text-[#fedd33] hover:bg-[#fedd33] hover:text-black btn-lg font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Join as Artist
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="category-tag mb-4 inline-block">LOCATION SEARCH</span>
            <h2 className="highlighted-title mb-4">Find Studios Near You</h2>
            <p className="editorial-text max-w-2xl mx-auto">
              Explore our interactive map to discover talented tattoo studios in Montreal. 
              Click on any marker to view studio details and get directions.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <StudioMap />
          </div>
        </div>
      </section>

      {/* CTA Bar */}
      <section className="bg-white shadow-lg border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="featured-title mb-2">
                Can't find your studio?
              </h3>
              <p className="editorial-text">
                Register as an artist and add your studio to our platform
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="btn bg-[#fedd33] text-black hover:bg-yellow-400 font-bold"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Add Your Studio
              </Link>
              <Link
                to="/artists"
                className="btn border-[#fedd33] text-[#fedd33] hover:bg-[#fedd33] hover:text-black font-bold"
              >
                <Search className="w-4 h-4 mr-2" />
                Browse All Artists
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="category-tag mb-4 inline-block">WHY CHOOSE US</span>
            <h2 className="highlighted-title">Why Choose Tattooed World?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-[#fedd33] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-black" />
              </div>
              <h3 className="featured-title mb-2">
                Location-Based Search
              </h3>
              <p className="editorial-text">
                Find artists near you with our interactive map and location-based filtering.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#fedd33] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-black" />
              </div>
              <h3 className="featured-title mb-2">
                Verified Reviews
              </h3>
              <p className="editorial-text">
                Read authentic reviews from real clients to make informed decisions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-[#fedd33] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-black" />
              </div>
              <h3 className="featured-title mb-2">
                Portfolio Showcase
              </h3>
              <p className="editorial-text">
                Browse artist portfolios and flash designs to find your perfect style match.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Showcase */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="category-tag mb-4 inline-block">ARTIST SHOWCASE</span>
            <h2 className="highlighted-title">Featured Artists</h2>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (featuredArtists || []).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(featuredArtists || []).map((artist) => (
                <div key={artist.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-[#fedd33] to-yellow-500 flex items-center justify-center">
                    <span className="text-black text-6xl">🎨</span>
                  </div>
                  <div className="p-6">
                    <h3 className="featured-title mb-2">
                      {artist.user.firstName} {artist.user.lastName}
                    </h3>
                    <p className="editorial-text mb-3">{artist.studioName}</p>
                    <div className="flex items-center space-x-2 mb-3">
                      <Star className="w-4 h-4 text-[#fedd33] fill-current" />
                      <span className="text-sm editorial-text">
                        {artist.averageRating ? `${artist.averageRating.toFixed(1)}` : 'New'} 
                        ({artist.reviewCount || 0} reviews)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {artist.specialties?.slice(0, 2).map((specialty) => (
                        <span key={specialty.id} className="px-2 py-1 bg-[#fedd33] text-black text-xs rounded-full font-bold">
                          {specialty.name}
                        </span>
                      ))}
                    </div>
                    <p className="editorial-text text-sm mb-4 line-clamp-2">
                      {artist.bio}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[#fedd33] font-bold">${artist.hourlyRate}/hr</span>
                      <Link
                        to={`/artists/${artist.id}`}
                        className="text-[#fedd33] hover:text-yellow-500 font-bold text-sm"
                      >
                        View Profile →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="editorial-text mb-4">No featured artists available at the moment.</p>
              <Link to="/artists" className="btn bg-[#fedd33] text-black hover:bg-yellow-400 font-bold">
                Browse All Artists
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-black text-white py-16 rounded-lg">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="highlighted-title text-white mb-4">
            Ready to Find Your Perfect Studio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of clients who have found their perfect tattoo artist through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/map"
              className="btn bg-[#fedd33] text-black hover:bg-yellow-400 btn-lg font-bold"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Explore Studios Map
            </Link>
            <Link
              to="/register"
              className="btn border-[#fedd33] text-[#fedd33] hover:bg-[#fedd33] hover:text-black btn-lg font-bold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Register as Artist
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 