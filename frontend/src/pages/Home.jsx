import { Link } from 'react-router-dom'
import { MapPin, Users, Star, Palette } from 'lucide-react'

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
            Discover talented tattoo artists in your area. Browse portfolios, read reviews, 
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