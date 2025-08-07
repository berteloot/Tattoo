import { Link } from 'react-router-dom'
import { MapPin, Users, Star, Palette, Search, Filter, Plus, Building2 } from 'lucide-react'
import { StudioMap } from '../components/StudioMap'
import { EditorialCard } from '../components/EditorialCard'
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { apiCallWithFallback, checkApiHealth } from '../utils/apiHealth'

export const HomeEditorial = () => {
  console.log('HomeEditorial component rendering')
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
    <div className="min-h-screen bg-cream-50">
      {/* Test Section to verify styles */}
      <div className="bg-editorial-600 text-white p-4 text-center">
        <h1 className="font-display text-2xl">Editorial Style Test</h1>
        <p className="text-editorial-100">If you can see this, the editorial styles are working!</p>
        <div className="mt-4 space-x-4">
          <span className="bg-editorial-500 px-3 py-1 rounded">Editorial 500</span>
          <span className="bg-cream-500 px-3 py-1 rounded">Cream 500</span>
          <span className="bg-editorial-100 text-editorial-800 px-3 py-1 rounded">Editorial 100</span>
        </div>
      </div>

      {/* Header with Logo and Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <p className="editorial-tagline mb-2">The Art of Body Expression</p>
            <h1 className="editorial-logo mb-2">TATTOOED WORLD®</h1>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <a href="/artists" className="editorial-nav">ARTISTS</a>
            <a href="/studios" className="editorial-nav">STUDIOS</a>
            <a href="/flash" className="editorial-nav">PORTFOLIO</a>
            <a href="/map" className="editorial-nav">MAP</a>
            <a href="/reviews" className="editorial-nav">REVIEWS</a>
            <a href="/about" className="editorial-nav">ABOUT</a>
          </nav>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Left Column */}
          <div className="lg:col-span-2">
            {/* Featured Article */}
            <article className="bg-white mb-8">
              <div className="p-6">
                <span className="category-tag mb-4 inline-block">FEATURED ARTIST</span>
                <h2 className="highlighted-title mb-4">The Summer's Must-See Studio</h2>
                <div className="bg-gradient-to-br from-editorial-500 to-editorial-700 h-64 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-white text-6xl">🎨</span>
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Discover the hottest tattoo destination this season. Our featured artist combines traditional techniques 
                  with modern innovation, creating pieces that tell your unique story. From minimalist designs to bold 
                  statement pieces, this studio is redefining body art in Montreal.
                </p>
                <div className="flex items-center justify-between">
                  <span className="editorial-date">AUGUST 5, 2025</span>
                  <Link to="/artists" className="text-editorial-600 font-medium hover:text-editorial-700">
                    READ MORE →
                  </Link>
                </div>
              </div>
            </article>

            {/* Map Section */}
            <section className="bg-white mb-8">
              <div className="p-6">
                <h2 className="highlighted-title mb-4">Find Studios Near You</h2>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  Explore our interactive map to discover talented tattoo studios in Montreal. 
                  Click on any marker to view studio details and get directions.
                </p>
                <div className="bg-gray-100 rounded-lg overflow-hidden h-64">
                  <StudioMap />
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar - Right Column */}
          <div className="lg:col-span-1">
            {/* Featured Artists Section */}
            <section className="bg-white mb-8">
              <div className="relative">
                <div className="bg-gradient-to-br from-editorial-500 to-editorial-700 h-48 rounded-t-lg flex items-center justify-center">
                  <span className="text-white text-4xl">👤</span>
                </div>
                <div className="black-line-box absolute bottom-0 left-0 right-0">
                  FEATURED ARTISTS
                </div>
              </div>
              <div className="p-6">
                <h3 className="featured-title mb-4">Top Artists This Month</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Meet the most talented tattoo artists in Montreal. Each brings their unique style 
                  and expertise to create stunning body art that tells your story.
                </p>
                <div className="editorial-date mb-4">AUGUST 4, 2025</div>
                <Link to="/artists" className="text-editorial-600 font-medium hover:text-editorial-700">
                  VIEW ALL ARTISTS →
                </Link>
              </div>
            </section>

            {/* Quick Stats */}
            <section className="bg-white mb-8">
              <div className="p-6">
                <h3 className="featured-title mb-4">Platform Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Artists</span>
                    <span className="font-bold text-black">127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Studios Listed</span>
                    <span className="font-bold text-black">89</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Reviews</span>
                    <span className="font-bold text-black">2,456</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Artist Showcase - Editorial Style */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="category-tag mb-4 inline-block">ARTIST SHOWCASE</span>
            <h2 className="highlighted-title">Featured Artists</h2>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="editorial-card animate-pulse">
                  <div className="h-48 bg-cream-200"></div>
                  <div className="editorial-card-content">
                    <div className="h-6 bg-cream-200 rounded mb-2"></div>
                    <div className="h-4 bg-cream-200 rounded mb-3"></div>
                    <div className="h-4 bg-cream-200 rounded mb-4"></div>
                    <div className="h-4 bg-cream-200 rounded mb-4"></div>
                    <div className="h-4 bg-cream-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (featuredArtists || []).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(featuredArtists || []).map((artist) => (
                <EditorialCard
                  key={artist.id}
                  artist={artist}
                  onClick={() => window.location.href = `/artists/${artist.id}`}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="editorial-text mb-4">No featured artists available at the moment.</p>
              <Link to="/artists" className="btn bg-editorial-600 text-white hover:bg-editorial-700">
                Browse All Artists
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-editorial-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-display font-bold mb-4">
            Ready to Find Your Perfect Studio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of clients who have found their perfect tattoo artist through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/map"
              className="btn bg-white text-editorial-600 hover:bg-cream-50 btn-lg"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Explore Studios Map
            </Link>
            <Link
              to="/register"
              className="btn border-white text-white hover:bg-white hover:text-editorial-600 btn-lg"
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