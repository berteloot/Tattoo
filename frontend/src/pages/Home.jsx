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
      city: 'Tokyo',
      state: 'Japan',
      averageRating: 4.9,
      reviewCount: 327,
      specialties: [{ name: 'Traditional' }, { name: 'Japanese' }],
      isVerified: true,
      featured: true
    },
    {
      id: '2',
      user: { firstName: 'Marcus', lastName: 'Rodriguez' },
      studioName: 'Black Canvas Tattoo',
      bio: 'Master of black and grey realism. Creating stunning portraits.',
      city: 'Los Angeles',
      state: 'California',
      averageRating: 4.8,
      reviewCount: 289,
      specialties: [{ name: 'Black & Grey' }],
      isVerified: true,
      featured: true
    },
    {
      id: '3',
      user: { firstName: 'Emma', lastName: 'Thompson' },
      studioName: 'Simple Lines Studio',
      bio: 'Minimalist tattoo specialist creating elegant, simple designs.',
      city: 'London',
      state: 'England',
      averageRating: 4.7,
      reviewCount: 456,
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
          <span className="tag tag--yellow">GLOBAL PLATFORM</span>
          <h1>THE WORLD'S LEADING TATTOO ARTIST NETWORK</h1>
          <p className="deck">
            Connect with exceptional tattoo artists worldwide. Discover portfolios, read authentic reviews, 
            and find your perfect artist anywhere in the world.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/map" className="cta">
              <MapPin style={{ width: '16px', height: '16px', marginRight: '8px' }} />
              EXPLORE WORLDWIDE
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
            <span className="tag tag--yellow">GLOBAL DISCOVERY</span>
            <h2>FIND STUDIOS ANYWHERE IN THE WORLD</h2>
            <p className="deck">
              Explore our interactive map to discover talented tattoo studios globally. 
              From New York to Tokyo, London to Sydney - find exceptional artists worldwide.
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
              <h3>EXPAND YOUR REACH GLOBALLY</h3>
              <p className="small">
                Join thousands of artists worldwide and connect with clients across the globe
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/register" className="cta">
                <Building2 style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                JOIN GLOBAL NETWORK
              </Link>
              <Link to="/artists" className="cta">
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
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="tag tag--yellow">TRUSTED WORLDWIDE</span>
            <h2>THE GLOBAL STANDARD FOR TATTOO DISCOVERY</h2>
            <p className="deck">
              Over 10,000+ artists in 50+ countries trust Tattooed World to connect them with clients
            </p>
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
              <h3>GLOBAL REACH</h3>
              <p className="small">
                Discover exceptional artists worldwide with our advanced location search and global network.
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
              <h3>VERIFIED EXCELLENCE</h3>
              <p className="small">
                Every artist is verified. Read 50,000+ authentic reviews from real clients worldwide.
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
              <h3>CURATED PORTFOLIOS</h3>
              <p className="small">
                Browse professionally curated portfolios from award-winning artists across every style.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Showcase */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="tag tag--yellow">WORLD-CLASS TALENT</span>
            <h2>FEATURED GLOBAL ARTISTS</h2>
            <p className="deck">
              Meet award-winning artists from around the world who have chosen Tattooed World as their platform
            </p>
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
              JOIN THE WORLD'S LARGEST TATTOO COMMUNITY
            </h2>
            <p style={{ fontSize: '20px', marginBottom: '32px', opacity: 0.9 }}>
              Over 1 million clients worldwide trust Tattooed World to connect them with exceptional artists.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/map" className="cta" style={{ backgroundColor: 'var(--accent-yellow)', color: '#000', borderColor: 'var(--accent-yellow)' }}>
                <MapPin style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                EXPLORE GLOBAL MAP
              </Link>
              <Link to="/register" className="cta" style={{ borderColor: 'var(--accent-yellow)', color: 'var(--accent-yellow)' }}>
                <Plus style={{ width: '20px', height: '20px', marginRight: '8px' }} />
                JOIN THE NETWORK
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 