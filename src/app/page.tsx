"use client"

import { useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, X, Circle, Triangle, Square } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)

  const controllerFilters = [
    { id: 'vendre', label: 'Vendre', icon: X, color: 'bg-blue-500', iconColor: '#3b82f6', description: 'Équipements & Goodies' },
    { id: 'evenement', label: 'Événement', icon: Circle, color: 'bg-red-500', iconColor: '#ef4444', description: 'Tournois & Stages' },
    { id: 'echanger', label: 'Échanger', icon: Triangle, color: 'bg-green-500', iconColor: '#22c55e', description: 'Troc & Dons' },
    { id: 'matcher', label: 'Matcher', icon: Square, color: 'bg-purple-500', iconColor: '#a855f7', description: 'Recrutement & Jobs' },
  ]

  const mockOffers = [
    {
      id: '1',
      titre: 'Maillot OL 2024 Domicile',
      description: 'Neuf, jamais porté, taille L.',
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
      description: 'Poste de gardien pour tournoi régional.',
      prix: 0,
      ville: 'Villeurbanne',
      typeOffre: 'matcher',
      image: 'https://picsum.photos/seed/foot-match/600/400',
      userNom: 'FC Villeurbanne',
      userType: 'club_foot'
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tighter italic text-primary">
            PASS'DÉC<span className="text-foreground">.</span>
          </h1>
          <Badge variant="outline" className="border-primary/50 text-primary animate-pulse">
            100% FOOTBALL
          </Badge>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Rechercher un maillot, un club, un match..." 
            className="pl-10 h-12 bg-card border-none ring-1 ring-white/10 focus-visible:ring-primary/50 rounded-xl"
          />
        </div>
      </header>

      {/* Main Filter Section */}
      <section className="px-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          {controllerFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id === activeFilter ? null : filter.id)}
              className={`controller-btn group ${activeFilter === filter.id ? 'ring-2 ring-primary scale-105' : 'bg-card'}`}
            >
              <div className={`p-3 rounded-full mb-2 ${filter.color} bg-opacity-20`}>
                <filter.icon className="w-8 h-8" style={{ color: filter.iconColor }} />
              </div>
              <span className="font-bold text-sm uppercase tracking-widest">{filter.label}</span>
              <span className="text-[10px] text-muted-foreground opacity-70 mt-1">{filter.description}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Location Bar */}
      <div className="px-6 py-4 flex items-center gap-2 text-muted-foreground overflow-x-auto no-scrollbar">
        <MapPin className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs whitespace-nowrap">Proche de :</span>
        <Badge variant="secondary" className="rounded-full px-3 py-1 cursor-pointer hover:bg-primary hover:text-white transition-colors">Lyon</Badge>
        <Badge variant="outline" className="rounded-full px-3 py-1 cursor-pointer">Paris</Badge>
        <Badge variant="outline" className="rounded-full px-3 py-1 cursor-pointer">Marseille</Badge>
      </div>

      {/* Feed */}
      <section className="px-6 py-4 flex flex-col gap-6">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-bold">Dernières passes</h2>
          <Link href="/explore" className="text-primary text-xs font-semibold uppercase tracking-widest hover:underline">Voir tout</Link>
        </div>

        <div className="grid gap-6">
          {mockOffers.map((offer) => (
            <div 
              key={offer.id} 
              className="bg-card rounded-2xl overflow-hidden shadow-xl border border-white/5 group hover:border-primary/20 transition-all duration-300 animate-slide-up"
            >
              <div className="relative aspect-[16/9] w-full">
                <Image 
                  src={offer.image} 
                  alt={offer.titre} 
                  fill 
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  data-ai-hint="football product"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className="bg-primary/90 text-[10px] uppercase font-bold tracking-wider">
                    {offer.typeOffre}
                  </Badge>
                </div>
                {offer.prix > 0 && (
                  <div className="absolute bottom-3 right-3 glass-morphism px-3 py-1 rounded-full font-bold text-primary">
                    {offer.prix}€
                  </div>
                )}
              </div>
              
              <div className="p-4 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{offer.titre}</h3>
                </div>
                <p className="text-muted-foreground text-sm line-clamp-2">{offer.description}</p>
                
                <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                      {offer.userNom[0]}
                    </div>
                    <span className="text-xs font-medium">{offer.userNom}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{offer.ville}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Navigation />
    </div>
  )
}