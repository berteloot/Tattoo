import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MapPin, Menu, X, LogOut, User } from 'lucide-react'
import { SkipToMainContent } from './UXComponents'
import { FavoritesCount } from './FavoritesCount'

export const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isAuthenticated, logout, isArtist, isAdmin } = useAuth()
  const location = useLocation()
  const currentYear = new Date().getFullYear()

  const navigation = [
    { name: 'HOME', href: '/' },
    { name: 'ARTISTS', href: '/artists' },
    { name: 'STUDIOS', href: '/studios' },
    { name: 'MAP', href: '/map' },
    { name: 'FLASH GALLERY', href: '/flash' },
    { name: 'TATTOO GALLERY', href: '/gallery' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <SkipToMainContent />
      
      {/* Header */}
      <header className="nav">
        <div className="container">
          {/* Logo */}
          <Link to="/" className="brand">
            TATTOOED WORLD
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul>
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => console.log(`Navigating to: ${item.href}`)}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="small"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <User style={{ width: '16px', height: '16px' }} />
                  <span className="hidden lg:inline">{user?.firstName || user?.name || 'PROFILE'}</span>
                  <span className="lg:hidden">PROFILE</span>
                </Link>
                {user?.role === 'CLIENT' && (
                  <Link
                    to="/favorites"
                    className="small"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <FavoritesCount />
                  </Link>
                )}
                {isArtist && (
                  <Link to="/dashboard" className="cta">
                    <span className="hidden lg:inline">DASHBOARD</span>
                    <span className="lg:hidden">DASH</span>
                  </Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="cta" style={{ backgroundColor: 'var(--accent-red)', color: '#fff', borderColor: 'var(--accent-red)' }}>
                    <span className="hidden lg:inline">ADMIN PANEL</span>
                    <span className="lg:hidden">ADMIN</span>
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
                  className="small"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <LogOut style={{ width: '16px', height: '16px' }} />
                  <span className="hidden lg:inline">LOGOUT</span>
                  <span className="lg:hidden">OUT</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link to="/login" className="small">
                  LOGIN
                </Link>
                <Link to="/register" className="cta">
                  <span className="hidden lg:inline">SIGN UP</span>
                  <span className="lg:hidden">SIGN UP</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? (
                <X style={{ width: '24px', height: '24px' }} />
              ) : (
                <Menu style={{ width: '24px', height: '24px' }} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden" style={{ borderTop: '1px solid var(--border)', padding: '16px 0' }}>
            <div className="container">
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                {navigation.map((item) => (
                  <li key={item.name} style={{ marginBottom: '8px' }}>
                    <Link
                      to={item.href}
                      className="small"
                      style={{ display: 'block', padding: '12px 0', fontSize: '16px' }}
                      onClick={() => {
                        console.log(`Mobile navigating to: ${item.href}`)
                        setMobileMenuOpen(false)
                      }}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
                
                {isAuthenticated ? (
                  <>
                    <li style={{ marginBottom: '8px' }}>
                      <Link
                        to="/profile"
                        className="small"
                        style={{ display: 'block', padding: '12px 0', fontSize: '16px' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        PROFILE
                      </Link>
                    </li>
                    {user?.role === 'CLIENT' && (
                      <li style={{ marginBottom: '8px' }}>
                        <Link
                          to="/favorites"
                          className="small"
                          style={{ display: 'block', padding: '12px 0', fontSize: '16px' }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <FavoritesCount />
                        </Link>
                      </li>
                    )}
                    {isArtist && (
                      <li style={{ marginBottom: '8px' }}>
                        <Link
                          to="/dashboard"
                          className="cta"
                          style={{ display: 'block', textAlign: 'center', margin: '16px 0' }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          DASHBOARD
                        </Link>
                      </li>
                    )}
                    {isAdmin && (
                      <li style={{ marginBottom: '8px' }}>
                        <Link
                          to="/admin"
                          className="cta"
                          style={{ display: 'block', textAlign: 'center', margin: '16px 0', backgroundColor: 'var(--accent-red)', color: '#fff', borderColor: 'var(--accent-red)' }}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          ADMIN PANEL
                        </Link>
                      </li>
                    )}
                    <li style={{ marginBottom: '8px' }}>
                      <button
                        onClick={async () => {
                          try {
                            await logout()
                          } catch (error) {
                            console.warn('Logout error:', error)
                          }
                          setMobileMenuOpen(false)
                        }}
                        className="small"
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}
                      >
                        LOGOUT
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li style={{ marginBottom: '8px' }}>
                      <Link
                        to="/login"
                        className="small"
                        style={{ display: 'block', padding: '12px 0', fontSize: '16px' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        LOGIN
                      </Link>
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      <Link
                        to="/register"
                        className="cta"
                        style={{ display: 'block', textAlign: 'center', margin: '16px 0' }}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        SIGN UP
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main id="main-content" className="container" style={{ padding: '32px 0' }}>
        {children}
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="cols">
            {/* Company Info */}
            <div style={{ gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <MapPin style={{ width: '24px', height: '24px', color: 'var(--accent-blue)' }} />
                <span className="brand">TATTOOED WORLD</span>
              </div>
              <p className="small" style={{ marginBottom: '16px', maxWidth: '400px' }}>
                Connect with talented tattoo artists in your area. Find your perfect match for custom designs, traditional styles, and everything in between.
              </p>
              <p className="small" style={{ color: 'var(--muted)' }}>
                © {currentYear} TATTOOED WORLD. ALL RIGHTS RESERVED.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="small" style={{ fontWeight: 'bold', marginBottom: '16px' }}>QUICK LINKS</h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <Link to="/" className="small">
                    HOME
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link to="/artists" className="small">
                    FIND ARTISTS
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link to="/flash" className="small">
                    FLASH GALLERY
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link to="/register" className="small">
                    JOIN AS ARTIST
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="small" style={{ fontWeight: 'bold', marginBottom: '16px' }}>LEGAL</h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                <li style={{ marginBottom: '8px' }}>
                  <Link to="/privacy-policy" className="small">
                    PRIVACY POLICY
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link to="/terms-of-service" className="small">
                    TERMS OF SERVICE
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link to="/cookie-policy" className="small">
                    COOKIE POLICY
                  </Link>
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <Link to="/contact-us" className="small">
                    CONTACT US
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border)' }}>
            <div className="small" style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>DISCLAIMER:</strong> TATTOOED WORLD IS A PLATFORM THAT CONNECTS CLIENTS WITH TATTOO ARTISTS. 
                WE DO NOT PROVIDE TATTOO SERVICES DIRECTLY. ALL ARTISTS ARE INDEPENDENT PROFESSIONALS RESPONSIBLE FOR 
                THEIR OWN WORK, LICENSING, AND COMPLIANCE WITH LOCAL REGULATIONS.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>HEALTH & SAFETY:</strong> TATTOOING INVOLVES HEALTH RISKS. ALWAYS ENSURE YOUR CHOSEN ARTIST 
                FOLLOWS PROPER STERILIZATION AND SAFETY PROTOCOLS. CONSULT WITH HEALTHCARE PROFESSIONALS IF YOU HAVE 
                CONCERNS ABOUT MEDICAL CONDITIONS OR ALLERGIES.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>AGE VERIFICATION:</strong> YOU MUST BE 18 YEARS OR OLDER TO USE THIS PLATFORM. SOME JURISDICTIONS 
                MAY REQUIRE PARENTAL CONSENT FOR INDIVIDUALS UNDER 18.
              </p>
              <p>
                <strong>CONTENT:</strong> USER-GENERATED CONTENT REFLECTS INDIVIDUAL OPINIONS AND EXPERIENCES. 
                TATTOOED WORLD DOES NOT ENDORSE OR VERIFY THE ACCURACY OF REVIEWS OR ARTIST CLAIMS.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 