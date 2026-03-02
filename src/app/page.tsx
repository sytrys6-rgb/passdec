
"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, MapPin, X, Circle, Triangle, Square, Trophy, Loader2, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase'
import { allOffers } from '@/app/lib/offers'
import { doc, collection, query, orderBy, where } from 'firebase/firestore'
import placeholderData from '@/app/lib/placeholder-images.json'
import { CITY_DATA, getDistanceBetweenCities, MAIN_CITIES } from '@/app/lib/cities'

/**
 * @fileOverview Page d'accueil avec système d'alerte de nouveaux messages intégré.
 * Affiche un badge "Nouveau message" dans le header si des messages non lus existent.
 */

export default function HomePage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  
  // États des filtres
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [activeLocation, setActiveLocation] = useState<string>('all')
  const [activeRadius, setActiveRadius] = useState<number>(150)
  const [searchQuery, setSearchQuery] = useState('')
  const [isInitialized, setIsInitialized] = useState(false)

  // Charger les filtres sauvegardés au montage
  useEffect(() => {
    const savedCity = sessionStorage.getItem('last_city') || 'all'
    const savedRadius = sessionStorage.getItem('last_radius') || '150'
    const savedFilter = sessionStorage.getItem('last_filter') || 'null'
    const savedSearch = sessionStorage.getItem('last_search') || ''
    
    setActiveLocation(savedCity)
    setActiveRadius(parseInt(savedRadius))
    setActiveFilter(savedFilter === 'null' ? null : savedFilter)
    setSearchQuery(savedSearch)
    
    setTimeout(() => setIsInitialized(true), 100)
  }, [])

  // Sauvegarder les filtres
  useEffect(() => {
    if (!isInitialized) return
    sessionStorage.setItem('last_city', activeLocation)
    sessionStorage.setItem('last_radius', activeRadius.toString())
    sessionStorage.setItem('last_filter', activeFilter || 'null')
    sessionStorage.setItem('last_search', searchQuery)
  }, [activeLocation, activeRadius, activeFilter, searchQuery, isInitialized])

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  const userRef = useMemoFirebase(() => {
    if (!db || !user || isUserLoading) return null
    return doc(db, 'users', user.uid)
  }, [db, user, isUserLoading])

  const { data: profile } = useDoc(userRef)
  const favorites = profile?.favoris || []

  const offersQuery = useMemoFirebase(() => {
    if (!db || isUserLoading || !user) return null
    return query(collection(db, 'offres'), orderBy('createdAt', 'desc'))
  }, [db, isUserLoading, user])

  const { data: firestoreOffers, isLoading: isOffersLoading } = useCollection(offersQuery)

  // Surveillance des messages non lus pour l'alerte Accueil
  const convsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, 'conversations'), where('participants', 'array-contains', user.uid))
  }, [db, user])
  const { data: conversations } = useCollection(convsQuery)
  const hasUnread = useMemo(() => {
    if (!conversations || !user) return false
    return conversations.some(conv => (conv.unreadCount?.[user.uid] || 0) > 0)
  }, [conversations, user])

  if (isUserLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
  if (!user) return null

  const combinedOffers = [
    ...allOffers.map(o => ({
      ...o,
      image: o.image || 'https://picsum.photos/seed/foot/600/400',
    })),
    ...(firestoreOffers || []).map(o => ({
      ...o,
      image: o.photos?.[0] || 'https://picsum.photos/seed/foot/600/400',
      date: 'Publié récemment'
    }))
  ]

  const heroImage = placeholderData.placeholderImages.find(img => img.id === 'football-hero')?.imageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"

  const controllerFilters = [
    { id: 'vendre', label: 'Vendre', icon: X, color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    { id: 'evenement', label: 'Événement', icon: Circle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    { id: 'echanger', label: 'Échanger', icon: Triangle, color: 'text-green-500', bgColor: 'bg-green-500/10' },
    { id: 'matcher', label: 'Matcher', icon: Square, color: 'text-pink-500', bgColor: 'bg-pink-500/10' },
  ]

  const filteredOffers = combinedOffers.filter(offer => {
    const matchesCategory = !activeFilter || offer.typeOffre === activeFilter
    const searchCityMatch = MAIN_CITIES.find(c => c.toLowerCase() === searchQuery.trim().toLowerCase())
    const targetCityName = activeLocation !== 'all' ? activeLocation : searchCityMatch
    
    let matchesLocation = true;
    if (targetCityName) {
      const distance = getDistanceBetweenCities(targetCityName, offer.ville);
      if (distance !== null) {
        matchesLocation = distance <= activeRadius;
      } else {
        matchesLocation = offer.ville.toLowerCase() === targetCityName.toLowerCase()
      }
    }

    const matchesSearch = !searchQuery || 
      offer.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
      offer.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesLocation && matchesSearch
  })

  const toggleFavorite = (e: React.MouseEvent, offerId: string) => {
    e.preventDefault()
    if (!userRef || !user) return
    const newFavorites = favorites.includes(offerId)
      ? favorites.filter((id: string) => id !== offerId)
      : [...favorites, offerId]

    import('@/firebase').then(({ setDocumentNonBlocking }) => {
      setDocumentNonBlocking(userRef, { 
        id: user.uid,
        favoris: newFavorites 
      }, { merge: true })
    })
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-6 pb-2 flex flex-col items-center gap-4">
        <div className="w-full relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl border border-white/10 mt-2">
          <Image 
            src={heroImage} 
            alt="Action Football Pro" 
            fill
            className="object-cover"
            priority
            unoptimized
            data-ai-hint="football action"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        </div>

        <div className="text-center flex flex-col items-center">
          {hasUnread && (
            <Link href="/messages" className="animate-bounce mb-2">
              <Badge className="bg-destructive text-white border-none font-black uppercase tracking-tighter italic px-4 py-1.5 shadow-lg shadow-destructive/20 flex items-center gap-2">
                <MessageSquare className="w-3 h-3 fill-white" />
                Nouveau message au vestiaire !
              </Badge>
            </Link>
          )}
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            <span className="italic text-primary">100%</span>{" "}
            <span className="text-destructive">Pass' Déc'</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground mt-2">
            Le réseau qui fait marquer
          </p>
        </div>

        <div className="relative group w-full max-w-md mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une annonce ou une ville..." 
            className="pl-10 h-12 bg-card border-none ring-1 ring-white/10 focus-visible:ring-primary/50 rounded-xl shadow-inner"
          />
        </div>
      </header>

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

      <div className="px-6 py-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className={cn("w-3.5 h-3.5 flex-shrink-0 transition-colors", activeLocation !== 'all' ? "text-primary" : "text-muted-foreground")} />
          <span className="text-[10px] font-black uppercase tracking-widest">Rayon autour de :</span>
        </div>
        
        <div className="grid grid-cols-[2fr_1.2fr] gap-2">
          <Select 
            value={activeLocation} 
            onValueChange={(val) => setActiveLocation(val)}
          >
            <SelectTrigger className="bg-card border-none ring-1 ring-white/10 rounded-xl h-11 font-bold focus:ring-primary/50 text-xs">
              <SelectValue placeholder="Toute la France" />
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              <SelectItem value="all">Toute la France</SelectItem>
              {MAIN_CITIES.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select 
            value={activeRadius.toString()} 
            onValueChange={(val) => setActiveRadius(parseInt(val))}
          >
            <SelectTrigger className="bg-card border-none ring-1 ring-white/10 rounded-xl h-11 font-bold focus:ring-primary/50 text-xs">
              <SelectValue placeholder="Rayon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 km</SelectItem>
              <SelectItem value="25">25 km</SelectItem>
              <SelectItem value="50">50 km</SelectItem>
              <SelectItem value="100">100 km</SelectItem>
              <SelectItem value="150">150 km</SelectItem>
              <SelectItem value="200">200 km</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <section className="px-6 py-4 flex flex-col gap-6 pb-24">
        <div className="flex justify-between items-end">
          <h2 className="text-xl font-black italic uppercase tracking-tighter text-foreground">
            {activeFilter ? `Passes : ${activeFilter}` : 'Dernières passes'}
          </h2>
          {isOffersLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
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
                    unoptimized
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
              <p className="text-[10px] uppercase font-bold mt-2">Essayez d'élargir votre recherche ou de changer de ville.</p>
            </div>
          )}
        </div>
      </section>

      <Navigation />
    </div>
  )
}
