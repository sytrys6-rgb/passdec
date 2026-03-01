"use client"

import { useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, X, Circle, Triangle, Square } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [activeLocation, setActiveLocation] = useState<string | null>(null)

  const controllerFilters = [
    { id: 'vendre', label: 'Vendre', icon: X, color: 'text-blue-500', bgColor: 'bg-blue-500/10', description: 'Équipements' },
    { id: 'evenement', label: 'Événement', icon: Circle, color: 'text-red-500', bgColor: 'bg-red-500/10', description: 'Tournois' },
    { id: 'echanger', label: 'Échanger', icon: Triangle, color: 'text-green-500', bgColor: 'bg-green-500/10', description: 'Troc & Dons' },
    { id: 'matcher', label: 'Matcher', icon: Square, color: 'text-pink-500', bgColor: 'bg-pink-500/10', description: 'Recrutement' },
  ]

  const cities = ['Lyon', 'Paris', 'Marseille', 'Lille', 'Bordeaux']

  const allOffers = [
    {
      id: '1',
      titre: 'Maillot OL 2024 Domicile',
      description: 'Neuf, jamais porté, taille L. Édition collector avec patch Ligue 1.',
      prix: 65,
      ville: 'Lyon',
      typeOffre: 'vendre',
      image: 'https://picsum.photos/seed/foot-shirt/600/400',
      userNom: 'GonesFC',
      userType: 'club_supporter'
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
      userType: 'club_foot'
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
      userType: 'particulier'
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
      userType: 'club_foot'
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
      userType: 'particulier'
    }
  ]

  const filteredOffers = useMemo(() => {
    return allOffers.filter(offer => {
      const matchesCategory = !activeFilter || offer.typeOffre === activeFilter
      const matchesLocation = !activeLocation || 
        offer.ville === activeLocation || 
        (activeLocation === 'Lyon' && offer.ville === 'Villeurbanne')
      return matchesCategory && matchesLocation
    })
  }, [activeFilter, activeLocation])

  const handleFilterToggle = (filterId: string) => {
    setActiveFilter(prev => prev === filterId ? null : filterId)
  }

  const handleLocationToggle = (city: string) => {
    setActiveLocation(prev => prev === city ? null : city)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-6 flex flex-col gap-5">
        <div className="flex flex-col">
          <h1 className="text-4xl font-black italic tracking-tighter leading-none uppercase">
            <span className="text-primary italic">100%</span> <span className="text-accent italic">Pass' Déc'</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground mt-1.5 border-l-2 border-primary pl-2">
            Le réseau social qui fait marquer
          </p>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Rechercher un maillot, un club, un match..." 
            className="pl-10 h-12 bg-card border-none ring-1 ring-white/10 focus-visible:ring-primary/50 rounded-xl"
          />
        </div>
      </header>

      <section className="px-6 py-2">
        <div className="grid grid-cols-4 gap-3">
          {controllerFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterToggle(filter.id)}
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

      <div className="px-6 py-4 flex items-center gap-2 text-muted-foreground overflow-x-auto no-scrollbar">
        <MapPin className={cn("w-4 h-4 flex-shrink-0 transition-colors", activeLocation ? "text-primary" : "text-muted-foreground")} />
        <span className="text-xs whitespace-nowrap uppercase font-bold tracking-tighter mr-1">Secteur :</span>
        <div className="flex gap-2">
          {cities.map((city) => (
            <Badge 
              key={city}
              variant={activeLocation === city ? "default" : "outline"}
              onClick={() => handleLocationToggle(city)}
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

      <section className="px-6 py-4 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">
              {activeFilter ? `Passes : ${activeFilter}` : 'Dernières passes'}
            </h2>
            {activeLocation && (
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest italic">
                Secteur : {activeLocation} (+150km)
              </span>
            )}
          </div>
          <Link href="/" className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">Voir tout</Link>
        </div>

        <div className="grid gap-6">
          {filteredOffers.length > 0 ? (
            filteredOffers.map((offer) => (
              <Link 
                href={`/offres/${offer.id}`}
                key={offer.id} 
                className="bg-card rounded-2xl overflow-hidden shadow-xl border border-white/5 group hover:border-primary/20 transition-all duration-300 animate-slide-up"
              >
                <div className="relative aspect-[16/9] w-full">
                  <Image 
                    src={offer.image} 
                    alt={offer.titre} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    data-ai-hint="football item"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-primary text-black text-[10px] uppercase font-black tracking-wider px-2 py-0.5">
                      {offer.typeOffre}
                    </Badge>
                  </div>
                  {offer.prix > 0 && (
                    <div className="absolute bottom-3 right-3 glass-morphism px-3 py-1 rounded-full font-black text-primary italic border-primary/20">
                      {offer.prix}€
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors italic uppercase tracking-tighter">{offer.titre}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{offer.description}</p>
                  
                  <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-black">
                        {offer.userNom[0]}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-tighter">{offer.userNom}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{offer.ville}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
              <Search className="w-10 h-10 opacity-20" />
              <p className="text-sm font-bold uppercase italic tracking-widest">Aucun résultat trouvé dans cette zone</p>
              <Button 
                variant="link" 
                onClick={() => {
                  setActiveFilter(null)
                  setActiveLocation(null)
                }}
                className="text-primary font-black uppercase italic tracking-widest text-[10px]"
              >
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </div>
      </section>

      <Navigation />
    </div>
  )
}
