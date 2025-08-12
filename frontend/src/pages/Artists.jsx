import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Star, MapPin, Filter, Search, DollarSign, Eye, Calendar, Award, Instagram, Globe } from 'lucide-react'
import { FavoriteButton } from '../components/FavoriteButton'
import { artistsAPI, specialtiesAPI } from '../services/api'
import { apiCallWithFallback, checkApiHealth } from '../utils/apiHealth'
import { ArtistMessages } from '../components/ArtistMessage'

export const Artists = () => {
  console.log('Artists component rendering')
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('')
  const [specialties, setSpecialties] = useState([])
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [sortBy, setSortBy] = useState('rating') // 'rating', 'price', 'name'

  useEffect(() => {
    console.log('Artists component mounted, fetching data...')
    // Fetch data directly without health check
    fetchArtists()
    fetchSpecialties()
  }, [])

  const fetchArtists = async () => {
    try {
      console.log('Fetching artists from API...')
      console.log('API URL:', import.meta.env.VITE_API_URL || '/api')
      
      const response = await artistsAPI.getAll({ limit: 20 })
      console.log('API response:', response)
      
      if (response.data?.success) {
        console.log('Using API artists data')
        setArtists(response.data.data.artists || [])
      } else {
        console.error('API returned error:', response.data)
        setArtists([])
      }
    } catch (error) {
      console.error('Error fetching artists:', error)
      setArtists([])
    } finally {
      setLoading(false)
    }
  }

  const fetchSpecialties = async () => {
    try {
      console.log('Fetching specialties from API...')
      
      const result = await apiCallWithFallback(
        () => specialtiesAPI.getAll(),
        { specialties: getDummySpecialties() }
      )
      
      if (result.isFallback) {
        console.log('Using fallback specialties data')
        setSpecialties(result.data.specialties)
      } else {
        console.log('Using API specialties data')
        setSpecialties(result.data.data.specialties || [])
      }
    } catch (error) {
      console.error('Unexpected error in fetchSpecialties:', error)
      const dummySpecialties = getDummySpecialties()
      setSpecialties(dummySpecialties)
    }
  }

  const getDummyArtists = () => [
    {
      id: '1',
      user: { firstName: 'Sarah', lastName: 'Chen' },
      studioName: 'Ink & Soul Studio',
      bio: 'Award-winning traditional tattoo artist with 8 years of experience. Specializing in classic American traditional and Japanese styles.',
      city: 'Tokyo',
      state: 'Japan',
      hourlyRate: 120,
      averageRating: 4.9,
      reviewCount: 327,
      specialties: [{ id: '1', name: 'Traditional' }, { id: '2', name: 'Japanese' }],
      isVerified: true,
      featured: true,
      portfolioCount: 145
    },
    {
      id: '2',
      user: { firstName: 'Marcus', lastName: 'Rodriguez' },
      studioName: 'Black Canvas Tattoo',
      bio: 'Master of black and grey realism. Creating stunning portraits and detailed artwork that tells your story.',
      city: 'Los Angeles',
      state: 'California',
      hourlyRate: 150,
      averageRating: 4.8,
      reviewCount: 289,
      specialties: [{ id: '3', name: 'Black & Grey' }, { id: '4', name: 'Realistic' }],
      isVerified: true,
      featured: true,
      portfolioCount: 132
    },
    {
      id: '3',
      user: { firstName: 'Emma', lastName: 'Thompson' },
      studioName: 'Simple Lines Studio',
      bio: 'Minimalist tattoo specialist creating elegant, simple designs that speak volumes with clean lines and thoughtful composition.',
      city: 'London',
      state: 'England',
      hourlyRate: 100,
      averageRating: 4.7,
      reviewCount: 456,
      specialties: [{ id: '5', name: 'Minimalist' }, { id: '6', name: 'Neo-Traditional' }],
      isVerified: true,
      featured: false,
      portfolioCount: 228
    },
    {
      id: '4',
      user: { firstName: 'Diego', lastName: 'Silva' },
      studioName: 'Amazonia Ink',
      bio: 'Contemporary artist blending traditional indigenous motifs with modern techniques. Celebrating Brazilian culture through ink.',
      city: 'São Paulo',
      state: 'Brazil',
      hourlyRate: 90,
      averageRating: 4.9,
      reviewCount: 234,
      specialties: [{ id: '7', name: 'Watercolor' }, { id: '1', name: 'Traditional' }],
      isVerified: true,
      featured: true,
      portfolioCount: 87
    },
    {
      id: '5',
      user: { firstName: 'Amara', lastName: 'Singh' },
      studioName: 'Golden Temple Tattoo',
      bio: 'Intricate geometric and mandala specialist with influences from ancient Indian art. Creating spiritual journeys through body art.',
      city: 'Mumbai',
      state: 'India',
      hourlyRate: 75,
      averageRating: 4.8,
      reviewCount: 178,
      specialties: [{ id: '8', name: 'Geometric' }, { id: '5', name: 'Minimalist' }],
      isVerified: true,
      featured: false,
      portfolioCount: 156
    },
    {
      id: '6',
      user: { firstName: 'Klaus', lastName: 'Weber' },
      studioName: 'Berlin Blackwork',
      bio: 'Bold blackwork and dotwork specialist. Pioneer of the European underground tattoo scene with 15+ years experience.',
      city: 'Berlin',
      state: 'Germany',
      hourlyRate: 140,
      averageRating: 4.7,
      reviewCount: 312,
      specialties: [{ id: '3', name: 'Black & Grey' }, { id: '8', name: 'Geometric' }],
      isVerified: true,
      featured: true,
      portfolioCount: 203
    }
  ]

  const getDummySpecialties = () => [
    { id: '1', name: 'Traditional', icon: '🎨' },
    { id: '2', name: 'Japanese', icon: '🌸' },
    { id: '3', name: 'Black & Grey', icon: '⚫' },
    { id: '4', name: 'Realistic', icon: '📷' },
    { id: '5', name: 'Minimalist', icon: '⚪' },
    { id: '6', name: 'Neo-Traditional', icon: '🌿' },
    { id: '7', name: 'Watercolor', icon: '🎨' },
    { id: '8', name: 'Geometric', icon: '📐' }
  ]

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.studioName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecialty = !selectedSpecialty || 
                           artist.specialties.some(s => s.name === selectedSpecialty)
    
    return matchesSearch && matchesSpecialty
  })

  const sortedArtists = [...filteredArtists].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.averageRating || 0) - (a.averageRating || 0)
      case 'price':
        return (a.hourlyRate || 0) - (b.hourlyRate || 0)
      case 'name':
        return `${a.user.firstName} ${a.user.lastName}`.localeCompare(`${b.user.firstName} ${b.user.lastName}`)
      default:
        return 0
    }
  })

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            border: '2px solid var(--border)', 
            borderTop: '2px solid var(--accent-blue)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p className="small">DISCOVERING AMAZING ARTISTS...</p>
          <p className="small" style={{ color: 'var(--muted)', marginTop: '8px' }}>LOADING FROM API...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <span className="tag tag--yellow">GLOBAL TALENT NETWORK</span>
          <h1>DISCOVER WORLD-CLASS TATTOO ARTISTS</h1>
          <p className="deck">
            Connect with verified artists worldwide, explore diverse styles, and find your perfect artist anywhere on the planet
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', marginTop: '32px' }}>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              padding: '24px', 
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>10,000+</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>GLOBAL ARTISTS</div>
            </div>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              padding: '24px', 
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>4.9★</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>AVERAGE RATING</div>
            </div>
            <div style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)', 
              padding: '24px', 
              border: '1px solid rgba(255, 255, 255, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>1M+</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.8)' }}>SATISFIED CLIENTS</div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Filters and Controls */}
          <div style={{ border: '1px solid var(--border)', padding: '24px', marginBottom: '48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Search */}
              <div style={{ flex: 1 }}>
                <div style={{ position: 'relative' }}>
                  <Search style={{ 
                    position: 'absolute', 
                    left: '16px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: 'var(--muted)', 
                    width: '20px', 
                    height: '20px' 
                  }} />
                  <input
                    type="text"
                    placeholder="Search artists, studios, cities, or countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input"
                    style={{ width: '100%', paddingLeft: '48px', fontSize: '16px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                {/* Specialty Filter */}
                <div style={{ minWidth: '200px' }}>
                  <select
                    value={selectedSpecialty}
                    onChange={(e) => setSelectedSpecialty(e.target.value)}
                    className="input"
                    style={{ width: '100%', fontSize: '16px' }}
                  >
                    <option value="">ALL SPECIALTIES</option>
                    {(specialties || []).map((specialty) => (
                      <option key={specialty.id} value={specialty.name}>
                        {specialty.icon} {specialty.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div style={{ minWidth: '150px' }}>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input"
                    style={{ width: '100%', fontSize: '16px' }}
                  >
                    <option value="rating">TOP RATED</option>
                    <option value="price">PRICE: LOW TO HIGH</option>
                    <option value="name">NAME A-Z</option>
                  </select>
                </div>

                {/* View Toggle */}
                <div style={{ display: 'flex', border: '1px solid var(--border)' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: viewMode === 'grid' ? 'var(--text)' : 'transparent',
                      color: viewMode === 'grid' ? '#fff' : 'var(--text)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      fontWeight: '600'
                    }}
                  >
                    GRID
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    style={{
                      padding: '12px 16px',
                      backgroundColor: viewMode === 'list' ? 'var(--text)' : 'transparent',
                      color: viewMode === 'list' ? '#fff' : 'var(--text)',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      textTransform: 'uppercase',
                      fontWeight: '600'
                    }}
                  >
                    LIST
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ marginBottom: '32px' }}>
            <div className="section-header">
              <h2 className="section-title">ARTISTS ({sortedArtists.length})</h2>
              <Link to="/map" className="section-link">
                VIEW ON MAP →
              </Link>
            </div>
          </div>

          {/* Artists Grid/List */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-3">
              {sortedArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {sortedArtists.map((artist) => (
                <ArtistListCard key={artist.id} artist={artist} />
              ))}
            </div>
          )}

          {sortedArtists.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <p className="small" style={{ marginBottom: '16px' }}>No artists found matching your criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedSpecialty('')
                }}
                className="cta"
              >
                CLEAR FILTERS
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

const ArtistCard = ({ artist }) => (
  <div className="card">
    <div className="card__media" style={{ backgroundColor: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {artist.profilePictureUrl ? (
        <img 
          src={artist.profilePictureUrl} 
          alt={`${artist.user.firstName} ${artist.user.lastName}`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'transform 0.3s ease-in-out'
          }}
        />
      ) : (
        <span style={{ fontSize: '48px' }}>🎨</span>
      )}
    </div>
    <div style={{ padding: '24px' }}>
      {/* Artist Messages */}
      {artist.messages && artist.messages.length > 0 && (
        <ArtistMessages messages={artist.messages} variant="card" />
      )}
      
      <div className="card__category">
        <span className="tag tag--yellow">{artist.specialties?.[0]?.name || 'ARTIST'}</span>
      </div>
      <h3 className="card__title">
        {artist.user.firstName} {artist.user.lastName}
      </h3>
      <p className="card__meta">{artist.studioName}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Star style={{ width: '16px', height: '16px', color: 'var(--accent-red)', fill: 'var(--accent-red)' }} />
        <span className="small">
          {artist.averageRating ? `${artist.averageRating.toFixed(1)}` : 'New'} 
          ({artist.reviewCount || 0} reviews)
        </span>
      </div>
      <p className="small" style={{ marginBottom: '16px' }}>
        {artist.bio?.substring(0, 120)}...
      </p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>${artist.hourlyRate}/hr</span>
        <Link to={`/artists/${artist.id}`} className="small">
          VIEW PROFILE →
        </Link>
      </div>
    </div>
  </div>
)

const ArtistListCard = ({ artist }) => (
  <div style={{ border: '1px solid var(--border)', padding: '24px', display: 'flex', gap: '24px' }}>
    <div style={{ 
      width: '120px', 
      height: '120px', 
      backgroundColor: 'var(--border)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
      borderRadius: '8px'
    }}>
      {artist.profilePictureUrl ? (
        <img 
          src={artist.profilePictureUrl} 
          alt={`${artist.user.firstName} ${artist.user.lastName}`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover'
          }}
        />
      ) : (
        <span style={{ fontSize: '32px' }}>🎨</span>
      )}
    </div>
    <div style={{ flex: 1 }}>
      {/* Artist Messages */}
      {artist.messages && artist.messages.length > 0 && (
        <ArtistMessages messages={artist.messages} variant="card" />
      )}
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
        <span className="tag tag--yellow">{artist.specialties?.[0]?.name || 'ARTIST'}</span>
        {artist.isVerified && (
          <span className="tag tag--blue">VERIFIED</span>
        )}
      </div>
      <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
        {artist.user.firstName} {artist.user.lastName}
      </h3>
      <p className="small" style={{ marginBottom: '8px' }}>{artist.studioName}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <Star style={{ width: '16px', height: '16px', color: 'var(--accent-red)', fill: 'var(--accent-red)' }} />
        <span className="small">
          {artist.averageRating ? `${artist.averageRating.toFixed(1)}` : 'New'} 
          ({artist.reviewCount || 0} reviews)
        </span>
      </div>
      <p className="small" style={{ marginBottom: '16px' }}>
        {artist.bio}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: 'var(--accent-red)', fontWeight: 'bold' }}>${artist.hourlyRate}/hr</span>
        <Link to={`/artists/${artist.id}`} className="cta">
          VIEW PROFILE
        </Link>
      </div>
    </div>
  </div>
) 