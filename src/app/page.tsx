
"use client"

import { useState, useEffect, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, X, Circle, Triangle, Square, Loader2, MessageSquare, Activity, Compass } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase'
import { collection, query, where } from 'firebase/firestore'
import placeholderData from '@/app/lib/placeholder-images.json'
import { getDistanceBetweenCities, MAIN_CITIES } from '@/app/lib/cities'

/**
 * @fileOverview Page d'accueil - La vitrine publique.
 * Optimisation de l'alignement des filtres et stabilisation du rendu client.
 */

export default function HomePage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const [mounted, setMounted] = useState(false)
  
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [activeLocation, setActiveLocation] = useState<string>('all')
  const [activeRadius, setActiveRadius] = useState<number>(100)
  const [searchQuery, setSearchQuery] = useState('')

  // Stabilisation de l'hydratation
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const savedCity = sessionStorage.getItem('last_city')
      const savedRadius = sessionStorage.getItem('last_radius')
      const savedFilter = sessionStorage.getItem('last_filter')
      const savedSearch = sessionStorage.getItem('last_search')
      
      if (savedCity) setActiveLocation(savedCity)
      if (savedRadius) setActiveRadius(parseInt(savedRadius))
      if (savedFilter && savedFilter !== 'null') setActiveFilter(savedFilter)
      if (savedSearch) setSearchQuery(savedSearch)
    }
  }, [])

  // Sauvegarde des préférences
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      sessionStorage.setItem('last_city', activeLocation)
      sessionStorage.setItem('last_radius', activeRadius.toString())
      sessionStorage.setItem('last_filter', activeFilter || 'null')
      sessionStorage.setItem('last_search', searchQuery)
    }
  }, [activeLocation, activeRadius, activeFilter, searchQuery, mounted])

  const offersQuery = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, 'offres')
  }, [db])

  const { data: firestoreOffers, isLoading: isOffersLoading } = useCollection(offersQuery)

  const convsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid))
  }, [db, user])
  
  const { data: conversations } = useCollection(convsQuery)
  
  const totalUnread = useMemo(() => {
    if (!conversations || !user) return 0
    let count = 0
    conversations.forEach(conv => {
      if (conv.deletedBy?.includes(user.uid)) return;
      const unread = conv.unreadCount?.[user.uid] ?? conv[`unreadCount.${user.uid}`] ?? 0;
      count += unread;
    })
    return count
  }, [conversations, user])

  const combinedOffers = useMemo(() => {
    if (!firestoreOffers) return [];
    return [...firestoreOffers].sort((a, b) => {
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [firestoreOffers])

  const heroImage = placeholderData.placeholderImages.find(img => img.id === 'football-hero')?.imageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"

  const filteredOffers = useMemo(() => {
    return combinedOffers.filter(offer => {
      const matchesCategory = !activeFilter || offer.typeOffre === activeFilter
      let matchesLocation = true;
      const targetCityName = activeLocation !== 'all' ? activeLocation : null
      
      if (targetCityName && offer.ville) {
        const distance = getDistanceBetweenCities(targetCityName, offer.ville);
        if (distance !== null) {
          matchesLocation = distance <= activeRadius;
        } else {
          matchesLocation = offer.ville.toLowerCase().includes(targetCityName.toLowerCase())
        }
      }

      const queryLower = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery || 
        (offer.titre || '').toLowerCase().includes(queryLower) ||
        (offer.ville || '').toLowerCase().includes(queryLower) ||
        (offer.description || '').toLowerCase().includes(queryLower)
      
      return matchesCategory && matchesLocation && matchesSearch
    })
  }, [combinedOffers, activeFilter, activeLocation, activeRadius, searchQuery])

  // Rendu de sécurité pour l'hydratation
  if (!mounted) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-grow flex flex-col pb-24">
        <header className="p-6 pb-2 flex flex-col items-center gap-4">
          <div className="w-full relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mt-2">
            <Image 
              src={heroImage} 
              alt="Football Action" 
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
            
            {!user && !isUserLoading && (
              <div className="absolute top-4 right-4 animate-in fade-in duration-500">
                <Link href="/login">
                  <Badge className="bg-primary text-black font-black uppercase italic tracking-tighter px-4 py-2 cursor-pointer hover:scale-105 transition-transform border-none shadow-lg">
                    Connexion
                  </Badge>
                </Link>
              </div>
            )}
          </div>

          <div className="text-center flex flex-col items-center">
            <div className="flex flex-wrap justify-center gap-2 mb-2">
              {totalUnread > 0 && user && (
                <Link href="/messages">
                  <Badge className="bg-orange-500 text-white border-none font-black uppercase italic tracking-tighter px-4 py-1.5 animate-bounce">
                    <MessageSquare className="w-3 h-3 fill-white mr-2" />
                    {totalUnread} message(s)
                  </Badge>
                </Link>
              )}
              <Badge variant="outline" className="border-primary/50 text-primary font-black uppercase italic tracking-tighter px-4 py-1.5 bg-primary/5">
                <Activity className="w-3 h-3 animate-pulse mr-2" />
                Mercato : {combinedOffers.length} annonces réelles
              </Badge>
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              <span className="text-primary">100%</span> <span className="text-secondary">Pass&apos; Déc&apos;</span>
            </h1>
          </div>

          <div className="relative group w-full max-w-md mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chercher un article ou une ville..." 
              className="pl-10 h-12 bg-card border-none ring-1 ring-white/10 rounded-xl focus-visible:ring-primary"
            />
          </div>
        </header>

        {/* SECTION TACTIQUE DE ZONE - ALIGNEMENT CÔTE À CÔTE PARFAIT */}
        <section className="px-6 py-2 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-primary" />
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Tactique de Zone</h3>
          </div>
          
          <div className="flex flex-row flex-nowrap gap-2 items-center w-full">
            <div className="flex-[2] min-w-0">
              <Select value={activeLocation} onValueChange={setActiveLocation}>
                <SelectTrigger className="bg-card border-none ring-1 ring-white/10 rounded-xl h-11 font-bold italic text-[11px] w-full px-3">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <MapPin className="w-3 h-3 text-primary shrink-0" />
                    <SelectValue placeholder="Ville" />
                  </div>
                </SelectTrigger>
                <SelectContent className="max-h-[300px] z-[100]" position="popper">
                  <SelectItem value="all">🇫🇷 Toute la France</SelectItem>
                  {MAIN_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-0">
              <Select 
                value={activeRadius.toString()} 
                onValueChange={(v) => setActiveRadius(parseInt(v))}
                disabled={activeLocation === 'all'}
              >
                <SelectTrigger className={cn(
                  "bg-card border-none ring-1 ring-white/10 rounded-xl h-11 font-bold italic text-[11px] w-full px-3",
                  activeLocation === 'all' && "opacity-40"
                )}>
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <Activity className="w-3 h-3 text-primary shrink-0" />
                    <SelectValue placeholder="Rayon" />
                  </div>
                </SelectTrigger>
                <SelectContent className="z-[100]" position="popper">
                  <SelectItem value="25">25 km</SelectItem>
                  <SelectItem value="50">50 km</SelectItem>
                  <SelectItem value="100">100 km</SelectItem>
                  <SelectItem value="150">150 km</SelectItem>
                  <SelectItem value="200">200 km</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="px-6 py-2 mt-2">
          <div className="grid grid-cols-4 gap-3">
            {[
              { id: 'vendre', label: 'Vendre', icon: X, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
              { id: 'evenement', label: 'Événement', icon: Circle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
              { id: 'echanger', label: 'Échanger', icon: Triangle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
              { id: 'matcher', label: 'Matcher', icon: Square, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(prev => prev === filter.id ? null : filter.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-3 rounded-xl transition-all border",
                  activeFilter === filter.id ? 'bg-card border-primary/50 scale-105 shadow-lg' : 'bg-card/40 border-white/5'
                )}
              >
                <div className={cn("p-2 rounded-full mb-1.5", filter.bgColor)}>
                  <filter.icon className={cn("w-5 h-5", filter.color)} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-tighter">{filter.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="px-6 py-4 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Le Mercato</h2>
            <Badge variant="ghost" className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50">
              {filteredOffers.length} {filteredOffers.length > 1 ? 'Annonces' : 'Annonce'}
            </Badge>
          </div>

          {isOffersLoading && (
            <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          )}

          <div className="grid gap-6">
            {filteredOffers.length > 0 ? (
              filteredOffers.map((offer) => (
                <Link 
                  href={`/offres/details/?id=${offer.id}`} 
                  key={offer.id} 
                  className="bg-card rounded-2xl overflow-hidden shadow-xl border border-white/5 group hover:border-primary/20 transition-all active:scale-[0.98]"
                >
                  <div className="relative aspect-[16/9] w-full">
                    {offer.photos?.[0] ? (
                       <Image src={offer.photos[0]} alt={offer.titre} fill className="object-cover" unoptimized />
                    ) : (
                       <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Activity className="w-10 h-10 text-muted-foreground/20" />
                       </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="font-black uppercase italic border-none px-3 py-1 text-[9px] shadow-lg bg-primary text-black">
                        {offer.typeOffre}
                      </Badge>
                    </div>
                    {offer.prix > 0 && (
                      <div className="absolute bottom-3 right-3 glass-morphism px-3 py-1 rounded-full font-black text-primary italic border-primary/20 text-sm shadow-lg">
                        {offer.prix}€
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-1 text-left">
                    <h3 className="font-bold text-lg italic uppercase tracking-tighter line-clamp-1 group-hover:text-primary transition-colors">{offer.titre}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{offer.ville}</span>
                      </div>
                      <span className="text-[9px] font-bold text-muted-foreground italic opacity-70">En direct</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center gap-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-primary/20" />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest italic text-muted-foreground">Aucune annonce sur ce terrain.</p>
                  <p className="text-[10px] font-bold text-muted-foreground mt-2 opacity-50">Essayez d'élargir votre zone ou de changer de filtre.</p>
                </div>
                <button 
                  onClick={() => {
                    setActiveFilter(null);
                    setActiveLocation('all');
                    setSearchQuery('');
                  }}
                  className="text-[10px] font-black uppercase italic text-primary hover:underline underline-offset-4"
                >
                  Réinitialiser la tactique
                </button>
              </div>
            )}
          </div>
        </section>
      </div>

      <Navigation />
    </div>
  )
}
