
"use client"

import { useState, useMemo, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, X, Circle, Triangle, Square, Trophy } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { PlaceHolderImages } from '@/lib/placeholder-images'

export const allOffers = [
  {
    id: '1',
    titre: 'Maillot OL 2024 Domicile',
    description: 'Neuf, jamais porté, taille L. Édition collector avec patch Ligue 1.',
    prix: 65,
    ville: 'Lyon',
    typeOffre: 'vendre',
    image: 'https://picsum.photos/seed/foot-shirt/600/400',
    userNom: 'GonesFC',
  },
  {
    id: '2',
    titre: 'Recherche Joueur U17',
    description: 'Le club recherche un gardien de but motivé pour son équipe U17 régionale. Entraînements 3 fois par semaine.',
    prix: 0,
    ville: 'Villeurbanne',
    typeOffre: 'matcher',
    image: 'https://picsum.photos/seed/foot-match/600/400',
    userNom: 'FC Villeurbanne',
  },
  {
    id: '3',
    titre: 'Échange Crampons T42',
    description: 'Paire d\'Adidas Predator Portée 2 fois. Échange contre gants de gardien Reusch ou Uhlsport.',
    prix: 0,
    ville: 'Marseille',
    typeOffre: 'echanger',
    image: 'https://picsum.photos/seed/boots/600/400',
    userNom: 'OMFan13',
  },
  {
    id: '4',
    titre: 'Tournoi Futsal Solidaire',
    description: 'Inscrivez votre équipe pour le tournoi de charité au Five de Paris. Lots à gagner et buvette sur place.',
    prix: 20,
    ville: 'Paris',
    typeOffre: 'evenement',
    image: 'https://picsum.photos/seed/stadium/600/400',
    userNom: 'PSG Academy',
  },
  {
    id: '5',
    titre: 'Veste de survêtement vintage',
    description: 'Pièce rare des années 90, logo brodé. Très bon état général, taille M.',
    prix: 40,
    ville: 'Lyon',
    typeOffre: 'vendre',
    image: 'https://picsum.photos/seed/vintage/600/400',
    userNom: 'VintageFoot',
  }
]

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [activeLocation, setActiveLocation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [favorites, setFavorites] = useState<string[]>([])

  const logoImage = PlaceHolderImages.find(img => img.id === 'brand-logo')

  useEffect(() => {
    const saved = localStorage.getItem('pass-dec-favorites')
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse favorites", e)
      }
    }
  }, [])

  const updateFavorites = (newFavs: string[]) => {
    setFavorites(newFavs)
    localStorage.setItem('pass-dec-favorites', JSON.stringify(newFavs))
  }

  const controllerFilters = [
    { id: 'vendre', label: 'Vendre', icon: X, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { id: 'evenement', label: 'Événement', icon: Circle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { id: 'echanger', label: 'Échanger', icon: Triangle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { id: 'matcher', label: 'Matcher', icon: Square, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  ]

  const cities = ['Lyon', 'Paris', 'Marseille', 'Lille', 'Bordeaux']

  const filteredOffers = useMemo(() => {
    return allOffers.filter(offer => {
      const matchesCategory = !activeFilter || offer.typeOffre === activeFilter
      const matchesLocation = !activeLocation || 
        offer.ville === activeLocation || 
        (activeLocation === 'Lyon' && offer.ville === 'Villeurbanne')
      const matchesSearch = !searchQuery || offer.titre.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesCategory && matchesLocation && matchesSearch
    })
  }, [activeFilter, activeLocation, searchQuery])

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const newFavs = favorites.includes(id) 
      ? favorites.filter(favId => favId !== id) 
      : [...favorites, id]
    updateFavorites(newFavs)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-6 flex flex-col items-center gap-4">
        {/* Brand Logo Image */}
        {logoImage && (
          <div className="relative w-32 h-20 mb-2">
            <Image 
              src={logoImage.imageUrl} 
              alt="100% Pass' Déc' Logo" 
              fill 
              className="object-contain"
              priority
              data-ai-hint={logoImage.imageHint}
            />
          </div>
        )}

        {/* Brand Title and Slogan */}
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            <span className="text-primary italic">100%</span> <span className="text-destructive italic">Pass' Déc'</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-2">
            Le réseau social qui fait marquer
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full max-w-md mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une annonce..." 
            className="pl-10 h-12 bg-card border-none ring-1 ring-white/10 focus-visible:ring-primary/50 rounded-xl"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </header>

      {/* Controller Style Filters */}
      <section className="px-6 py-2">
        <div className="grid grid-cols-4 gap-3">
          {controllerFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(prev => prev === filter.id ? null : filter.id)}
              className={cn(
                "flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-200 border",
                activeFilter === filter.id 
                  ? 'bg-card border-primary/50 scale-105 shadow-lg shadow-primary/5' 
                  : 'bg-card/40 border-white/5 hover:border-white/10'
              )}
            >
              <div className={cn("p-2 rounded-full mb-1.5", filter.bgColor)}>
                <filter.icon className={cn("w-5 h-5", filter.color)} />
              </div>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-tighter",
                activeFilter === filter.id ? "text-primary" : "text-muted-foreground"
              )}>
                {filter.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Location Filter */}
      <div className="px-6 py-4 flex items-center gap-2 text-muted-foreground overflow-x-auto no-scrollbar">
        <MapPin className={cn("w-4 h-4 flex-shrink-0 transition-colors", activeLocation ? "text-primary" : "text-muted-foreground")} />
        <div className="flex gap-2">
          {cities.map((city) => (
            <Badge 
              key={city}
              variant={activeLocation === city ? "default" : "outline"}
              onClick={() => setActiveLocation(prev => prev === city ? null : city)}
              className={cn(
                "rounded-full px-4 py-1.5 cursor-pointer transition-all font-black uppercase tracking-tighter text-[10px]",
                activeLocation === city 
                  ? "bg-primary text-black border-primary" 
                  : "border-white/10 hover:border-primary/50 text-muted-foreground"
              )}
            >
              {city}
            </Badge>
          ))}
        </div>
      </div>

      {/* Feed Section */}
      <section className="px-6 py-4 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            {activeFilter ? `Passes : ${activeFilter}` : 'Dernières passes'}
          </h2>
          {activeLocation && (
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest italic">
              Secteur {activeLocation}
            </span>
          )}
        </div>

        <div className="grid gap-6">
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <Link 
                href={`/offres/${offer.id}`}
                key={offer.id} 
                className="bg-card rounded-2xl overflow-hidden shadow-xl border border-white/5 group hover:border-primary/20 transition-all duration-300 relative"
              >
                <div className="relative aspect-[16/9] w-full">
                  <Image 
                    src={offer.image} 
                    alt={offer.titre} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-primary text-black text-[10px] uppercase font-black tracking-wider px-2 py-0.5">
                      {offer.typeOffre}
                    </Badge>
                  </div>
                  
                  <button 
                    onClick={(e) => toggleFavorite(e, offer.id)}
                    className={cn(
                      "absolute top-3 right-3 p-2 rounded-full glass-morphism border-white/10 transition-all active:scale-90 z-10",
                      favorites.includes(offer.id) ? "text-primary bg-primary/20 border-primary/30" : "text-white/60"
                    )}
                  >
                    <Trophy className={cn("w-5 h-5", favorites.includes(offer.id) && "fill-primary")} />
                  </button>

                  {offer.prix > 0 && (
                    <div className="absolute bottom-3 right-3 glass-morphism px-3 py-1 rounded-full font-black text-primary italic border-primary/20">
                      {offer.prix}€
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors italic uppercase tracking-tighter">{offer.titre}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">{offer.description}</p>
                  
                  <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-2">
                    <span className="text-xs font-bold uppercase tracking-tighter">{offer.userNom}</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{offer.ville}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm font-bold uppercase italic tracking-widest">Aucun résultat trouvé</p>
            </div>
          )}
        </div>
      </section>

      <Navigation />
    </div>
  )
}
