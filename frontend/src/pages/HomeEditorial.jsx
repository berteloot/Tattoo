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
      {/* Hero Section - Editorial Style */}
      <section className="editorial-hero text-center py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="editorial-title mb-6">
            Le goût de l'art corporel
          </h1>
          <p className="editorial-subtitle mb-8">
            Découvrez les meilleurs artistes tatoueurs de Montréal. 
            Du traditionnel au contemporain, trouvez l'artiste qui saura donner vie à vos idées.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/map"
              className="btn bg-editorial-600 text-white hover:bg-editorial-700 btn-lg"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Explorer les studios
            </Link>
            <Link
              to="/register"
              className="btn border-editorial-600 text-editorial-600 hover:bg-editorial-50 btn-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Rejoindre comme artiste
            </Link>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="editorial-subtitle mb-4">Trouvez des studios près de chez vous</h2>
            <p className="editorial-text max-w-2xl mx-auto">
              Explorez notre carte interactive pour découvrir les studios de tatouage talentueux à Montréal. 
              Cliquez sur n'importe quel marqueur pour voir les détails du studio et obtenir des directions.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <StudioMap />
          </div>
        </div>
      </section>

      {/* CTA Bar */}
      <section className="bg-white shadow-lg border-t border-cream-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-xl font-display font-semibold text-cream-900 mb-2">
                Vous ne trouvez pas votre studio ?
              </h3>
              <p className="text-cream-600">
                Inscrivez-vous comme artiste et ajoutez votre studio à notre plateforme
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/register"
                className="btn bg-editorial-600 text-white hover:bg-editorial-700"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Ajouter votre studio
              </Link>
              <Link
                to="/artists"
                className="btn border-editorial-600 text-editorial-600 hover:bg-editorial-50"
              >
                <Search className="w-4 h-4 mr-2" />
                Parcourir tous les artistes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="editorial-section py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="editorial-subtitle text-center mb-12">
            Pourquoi choisir Tattooed World ?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-editorial-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-editorial-600" />
              </div>
              <h3 className="text-xl font-display font-semibold text-cream-900 mb-2">
                Recherche par localisation
              </h3>
              <p className="editorial-text">
                Trouvez des artistes près de chez vous avec notre carte interactive et nos filtres géolocalisés.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-editorial-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-editorial-600" />
              </div>
              <h3 className="text-xl font-display font-semibold text-cream-900 mb-2">
                Avis vérifiés
              </h3>
              <p className="editorial-text">
                Lisez des avis authentiques de vrais clients pour prendre des décisions éclairées.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-editorial-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="h-8 w-8 text-editorial-600" />
              </div>
              <h3 className="text-xl font-display font-semibold text-cream-900 mb-2">
                Portfolio d'artistes
              </h3>
              <p className="editorial-text">
                Parcourez les portfolios d'artistes et les designs flash pour trouver votre style parfait.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artist Showcase - Editorial Style */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="editorial-subtitle text-center mb-12">Artistes en vedette</h2>
          
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
              <p className="editorial-text mb-4">Aucun artiste en vedette disponible pour le moment.</p>
              <Link to="/artists" className="btn bg-editorial-600 text-white hover:bg-editorial-700">
                Parcourir tous les artistes
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-editorial-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-display font-bold mb-4">
            Prêt à trouver votre studio parfait ?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Rejoignez des milliers de clients qui ont trouvé leur artiste tatoueur parfait grâce à notre plateforme.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/map"
              className="btn bg-white text-editorial-600 hover:bg-cream-50 btn-lg"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Explorer la carte des studios
            </Link>
            <Link
              to="/register"
              className="btn border-white text-white hover:bg-white hover:text-editorial-600 btn-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              S'inscrire comme artiste
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
} 