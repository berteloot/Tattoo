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
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <span className="tag tag--yellow">FEATURED DESTINATION</span>
          <h1>FIND YOUR PERFECT TATTOO STUDIO</h1>
          <p className="deck">
            Discover talented tattoo artists and studios in Montreal. Browse portfolios, read reviews, 
            and book your next piece with confidence.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/map" className="cta">
              <MapPin style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              EXPLORE STUDIOS
            </Link>
            <Link to="/register" className="cta">
              <Plus style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              JOIN AS ARTIST
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="tag tag--yellow">LOCATION SEARCH</span>
            <h2>FIND STUDIOS NEAR YOU</h2>
            <p className="deck">
              Explore our interactive map to discover talented tattoo studios in Montreal. 
              Click on any marker to view studio details and get directions.
            </p>
          </div>
          
          <div style={{ border: '1px solid var(--border)' }}>
            <StudioMap />
          </div>
        </div>
      </section>

      {/* CTA Bar */}
      <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '24px', flexWrap: 'wrap' }}>
            <div>
              <h3>CAN'T FIND YOUR STUDIO?</h3>
              <p className="small">
                Register as an artist and add your studio to our platform
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/register" className="cta">
                <Building2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                ADD YOUR STUDIO
              </Link>
              <Link to="/artists" className="cta">
                <Search style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                BROWSE ALL ARTISTS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="tag tag--yellow">WHY CHOOSE US</span>
            <h2>WHY CHOOSE TATTOOED WORLD?</h2>
          </div>
          <div className="grid grid-cols-3">
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: 'var(--accent-yellow)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}>
                <MapPin style={{ width: '32px', height: '32px', color: '#000' }} />
              </div>
              <h3>LOCATION-BASED SEARCH</h3>
              <p className="small">
                Find artists near you with our interactive map and location-based filtering.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: 'var(--accent-yellow)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}>
                <Star style={{ width: '32px', height: '32px', color: '#000' }} />
              </div>
              <h3>VERIFIED REVIEWS</h3>
              <p className="small">
                Read authentic reviews from real clients to make informed decisions.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '64px', 
                height: '64px', 
                backgroundColor: 'var(--accent-yellow)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px' 
              }}>
                <Palette style={{ width: '32px', height: '32px', color: '#000' }} />
              </div>
              <h3>PORTFOLIO SHOWCASE</h3>
              <p className="small">
                Browse artist portfolios and flash designs to find your perfect style match.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Showcase */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="tag tag--yellow">ARTIST SHOWCASE</span>
            <h2>FEATURED ARTISTS</h2>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card" style={{ animation: 'pulse 2s infinite' }}>
                  <div style={{ height: '192px', backgroundColor: 'var(--border)' }}></div>
                  <div style={{ padding: '24px' }}>
                    <div style={{ height: '24px', backgroundColor: 'var(--border)', marginBottom: '8px' }}></div>
                    <div style={{ height: '16px', backgroundColor: 'var(--border)', marginBottom: '12px' }}></div>
                    <div style={{ height: '16px', backgroundColor: 'var(--border)', marginBottom: '16px' }}></div>
                    <div style={{ height: '16px', backgroundColor: 'var(--border)', marginBottom: '16px' }}></div>
                    <div style={{ height: '16px', backgroundColor: 'var(--border)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (featuredArtists || []).length > 0 ? (
            <div className="grid grid-cols-3">
              {(featuredArtists || []).map((artist) => (
                <div key={artist.id} className="card">
                  <div className="card__media" style={{ backgroundColor: 'var(--accent-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '48px' }}>🎨</span>
                  </div>
                  <div style={{ padding: '24px' }}>
                    <div className="card__category">
                      <span className="tag tag--yellow">{artist.specialties?.[0]?.name || 'ARTIST'}</span>
                    </div>
                    <h3 className="card__title">
                      {artist.user.firstName} {artist.user.lastName}
                    </h3>
                    <p className="card__meta">{artist.studioName}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Star style={{ width: '16px', height: '16px', color: 'var(--accent-yellow)' }} />
                      <span className="small">
                        {artist.averageRating ? `${artist.averageRating.toFixed(1)}` : 'New'} 
                        ({artist.reviewCount || 0} reviews)
                      </span>
                    </div>
                    <p className="small" style={{ marginBottom: '16px' }}>
                      {artist.bio?.substring(0, 120)}...
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--accent-yellow)', fontWeight: 'bold' }}>${artist.hourlyRate}/hr</span>
                      <Link to={`/artists/${artist.id}`} className="small">
                        VIEW PROFILE →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <p className="small" style={{ marginBottom: '16px' }}>No featured artists available at the moment.</p>
              <Link to="/artists" className="cta">
                BROWSE ALL ARTISTS
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ backgroundColor: '#000', color: '#fff', padding: '64px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ color: '#fff', marginBottom: '16px' }}>
              READY TO FIND YOUR PERFECT STUDIO?
            </h2>
            <p style={{ fontSize: '20px', marginBottom: '32px', opacity: 0.9 }}>
              Join thousands of clients who have found their perfect tattoo artist through our platform.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/map" className="cta" style={{ backgroundColor: 'var(--accent-yellow)', color: '#000', borderColor: 'var(--accent-yellow)' }}>
                <MapPin style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                EXPLORE STUDIOS MAP
              </Link>
              <Link to="/register" className="cta" style={{ borderColor: 'var(--accent-yellow)', color: 'var(--accent-yellow)' }}>
                <Plus style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                REGISTER AS ARTIST
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 