import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MapPin, Menu, X, LogOut, User, Heart } from 'lucide-react'
import { SkipToMainContent } from './UXComponents'

export const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout, isArtist, isAdmin } = useAuth()
  const location = useLocation()
  const currentYear = new Date().getFullYear()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Artists', href: '/artists' },
    { name: 'Studios', href: '/studios' },
    { name: 'Flash Gallery', href: '/flash' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-gray-50">
      <SkipToMainContent />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Tattooed World</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => console.log(`Navigating to: ${item.href}`)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  >
                    <User className="h-4 w-4" />
                    <span>{user?.firstName || user?.name || 'Profile'}</span>
                  </Link>
                  {user?.role === 'CLIENT' && (
                    <Link
                      to="/favorites"
                      className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                    >
                      <Heart className="h-4 w-4" />
                      <span>Favorites</span>
                    </Link>
                  )}
                  {isArtist && (
                    <Link
                      to="/dashboard"
                      className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                    >
                      Dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        await logout()
                      } catch (error) {
                        console.warn('Logout error:', error)
                      }
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-50"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    console.log(`Mobile navigating to: ${item.href}`)
                    setMobileMenuOpen(false)
                  }}
                >
                  {item.name}
                </Link>
              ))}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user?.role === 'CLIENT' && (
                    <Link
                      to="/favorites"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <Heart className="h-4 w-4" />
                        <span>Favorites</span>
                      </div>
                    </Link>
                  )}
                  {isArtist && (
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 rounded-md text-base font-medium text-white bg-red-600 hover:bg-red-700"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        await logout()
                      } catch (error) {
                        console.warn('Logout error:', error)
                      }
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="h-6 w-6 text-primary-600" />
                <span className="text-lg font-bold text-gray-900">Tattooed World</span>
              </div>
              <p className="text-gray-600 mb-4 max-w-md">
                Connect with talented tattoo artists in your area. Find your perfect match for custom designs, traditional styles, and everything in between.
              </p>
              <p className="text-sm text-gray-500">
                © {currentYear} Tattooed World. All rights reserved.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-sm text-gray-600 hover:text-primary-600">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/artists" className="text-sm text-gray-600 hover:text-primary-600">
                    Find Artists
                  </Link>
                </li>
                <li>
                  <Link to="/flash" className="text-sm text-gray-600 hover:text-primary-600">
                    Flash Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-sm text-gray-600 hover:text-primary-600">
                    Join as Artist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-sm text-gray-600 hover:text-primary-600">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-gray-600 hover:text-primary-600">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookies" className="text-sm text-gray-600 hover:text-primary-600">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-gray-600 hover:text-primary-600">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-2">
              <p>
                <strong>Disclaimer:</strong> Tattooed World is a platform that connects clients with tattoo artists. 
                We do not provide tattoo services directly. All artists are independent professionals responsible for 
                their own work, licensing, and compliance with local regulations.
              </p>
              <p>
                <strong>Health & Safety:</strong> Tattooing involves health risks. Always ensure your chosen artist 
                follows proper sterilization and safety protocols. Consult with healthcare professionals if you have 
                concerns about medical conditions or allergies.
              </p>
              <p>
                <strong>Age Verification:</strong> You must be 18 years or older to use this platform. Some jurisdictions 
                may require parental consent for individuals under 18.
              </p>
              <p>
                <strong>Content:</strong> User-generated content reflects individual opinions and experiences. 
                Tattooed World does not endorse or verify the accuracy of reviews or artist claims.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 