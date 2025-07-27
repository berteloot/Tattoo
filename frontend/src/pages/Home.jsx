import { Link } from 'react-router-dom'
import { MapPin, Users, Star, Palette, Search, Filter } from 'lucide-react'
import { ArtistMap } from '../components/ArtistMap'

export const Home = () => {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Perfect
            <span className="text-primary-600"> Tattoo Artist</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover talented tattoo artists in Montreal. Browse portfolios, read reviews, 
            and book your next piece with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/artists"
              className="btn btn-primary btn-lg"
            >
              Find Artists
            </Link>
            <Link
              to="/register"
              className="btn btn-outline btn-lg"
            >
              Join as Artist
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Artists Near You</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our interactive map to discover talented tattoo artists in Montreal. 
              Click on any marker to view artist details, specialties, and pricing.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Montreal, Quebec</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium">5 Verified Artists</span>
                </div>
              </div>
            </div>
            <ArtistMap />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Tattoo Locator?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Location-Based Search
              </h3>
              <p className="text-gray-600">
                Find artists near you with our interactive map and location-based filtering.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Verified Reviews
              </h3>
              <p className="text-gray-600">
                Read authentic reviews from real clients to make informed decisions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Portfolio Showcase
              </h3>
              <p className="text-gray-600">
                Browse artist portfolios and flash designs to find your perfect style match.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Showcase */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Featured Artists</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Sarah Chen - Traditional */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <span className="text-white text-6xl">🎨</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Sarah Chen</h3>
                <p className="text-gray-600 mb-3">Ink & Soul Studio</p>
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">5.0 (24 reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Traditional</span>
                  <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">Japanese</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Award-winning traditional tattoo artist with 8 years of experience.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-semibold">$120/hr</span>
                  <Link
                    to="/artists/1"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            </div>

            {/* Marcus Rodriguez - Black & Grey */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-white text-6xl">⚫</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Marcus Rodriguez</h3>
                <p className="text-gray-600 mb-3">Black Canvas Tattoo</p>
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">5.0 (18 reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Black & Grey</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Master of black and grey realism. Creating stunning portraits and detailed artwork.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-semibold">$150/hr</span>
                  <Link
                    to="/artists/2"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            </div>

            {/* Emma Thompson - Minimalist */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <span className="text-white text-6xl">📐</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Emma Thompson</h3>
                <p className="text-gray-600 mb-3">Simple Lines Studio</p>
                <div className="flex items-center space-x-2 mb-3">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-sm text-gray-600">5.0 (31 reviews)</span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Minimalist</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Neo-Traditional</span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Minimalist tattoo specialist creating elegant, simple designs that speak volumes.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-semibold">$100/hr</span>
                  <Link
                    to="/artists/3"
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    View Profile →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16 rounded-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Find Your Artist?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of clients who have found their perfect tattoo artist through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/artists"
              className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg"
            >
              Browse Artists
            </Link>
            <Link
              to="/flash"
              className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 btn-lg"
            >
              View Flash Gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 