
"use client"

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, X, Circle, Triangle, Square, Loader2, MessageSquare, Activity } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase'
import { doc, collection, query, where } from 'firebase/firestore'
import placeholderData from '@/app/lib/placeholder-images.json'
import { getDistanceBetweenCities, MAIN_CITIES } from '@/app/lib/cities'
import { allOffers as mockOffers } from '@/app/lib/offers'

/**
 * @fileOverview Page d'accueil - Le terrain de jeu principal.
 * Version stabilisée pour éliminer les erreurs d'hydratation et forcer l'affichage des annonces réelles pour tous.
 */

export default function HomePage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  
  const [mounted, setMounted] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [activeLocation, setActiveLocation] = useState<string>('all')
  const [activeRadius, setActiveRadius] = useState<number>(150)
  const [searchQuery, setSearchQuery] = useState('')

  // Hydratation et récupération des préférences locales
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      try {
        const savedCity = sessionStorage.getItem('last_city')
        const savedRadius = sessionStorage.getItem('last_radius')
        const savedFilter = sessionStorage.getItem('last_filter')
        const savedSearch = sessionStorage.getItem('last_search')
        
        if (savedCity) setActiveLocation(savedCity)
        if (savedRadius) setActiveRadius(parseInt(savedRadius))
        if (savedFilter && savedFilter !== 'null') setActiveFilter(savedFilter)
        if (savedSearch) setSearchQuery(savedSearch)
      } catch (e) {
        // Silencieux pour le build SSR
      }
    }
  }, [])

  // Sauvegarde des filtres tactiques
  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('last_city', activeLocation)
        sessionStorage.setItem('last_radius', activeRadius.toString())
        sessionStorage.setItem('last_filter', activeFilter || 'null')
        sessionStorage.setItem('last_search', searchQuery)
      } catch (e) {
        // Silencieux
      }
    }
  }, [activeLocation, activeRadius, activeFilter, searchQuery, mounted])

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])

  const { data: profile } = useDoc(userRef)

  // REQUÊTE PUBLIQUE : Toujours chargée pour tous (Mercato ouvert)
  const offersQuery = useMemoFirebase(() => {
    if (!db) return null
    return collection(db, 'offres')
  }, [db])

  const { data: firestoreOffers, isLoading: isOffersLoading } = useCollection(offersQuery)

  // Messages non lus (uniquement pour les joueurs connectés)
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

  // Fusion tactique des annonces : Réel d'abord, Démo ensuite
  const combinedOffers = useMemo(() => {
    const fsOffers = firestoreOffers ? firestoreOffers.map(o => ({
      ...o,
      image: o.photos?.[0] || 'https://picsum.photos/seed/foot/600/400',
      date: 'En ligne',
      isReal: true
    })) : [];

    const demoOffers = mockOffers.map(o => ({
      ...o,
      isDemo: true,
      isReal: false
    }));

    // Les annonces réelles passent devant les démos
    return [...fsOffers, ...demoOffers].sort((a, b) => {
      if (a.isReal && !b.isReal) return -1;
      if (!a.isReal && b.isReal) return 1;
      const timeA = a.createdAt?.seconds || 0;
      const timeB = b.createdAt?.seconds || 0;
      return timeB - timeA;
    });
  }, [firestoreOffers])

  const totalActiveRealCount = useMemo(() => combinedOffers.filter(o => o.isReal).length, [combinedOffers])
  const heroImage = placeholderData.placeholderImages.find(img => img.id === 'football-hero')?.imageUrl || "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=1200&auto=format&fit=crop"

  const filteredOffers = useMemo(() => {
    return combinedOffers.filter(offer => {
      const matchesCategory = !activeFilter || offer.typeOffre === activeFilter
      let matchesLocation = true;
      const searchCityMatch = MAIN_CITIES.find(c => c.toLowerCase() === searchQuery.trim().toLowerCase())
      const targetCityName = activeLocation !== 'all' ? activeLocation : (searchCityMatch || null)
      
      if (targetCityName) {
        const distance = getDistanceBetweenCities(targetCityName, offer.ville);
        if (distance !== null) {
          matchesLocation = distance <= activeRadius;
        } else {
          matchesLocation = offer.ville.toLowerCase().includes(targetCityName.toLowerCase())
        }
      }

      const matchesSearch = !searchQuery || 
        offer.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.ville.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      return matchesCategory && matchesLocation && matchesSearch
    })
  }, [combinedOffers, activeFilter, activeLocation, activeRadius, searchQuery])

  // RENDU STABLE : Le div racine doit avoir les mêmes classes dès le début pour éviter l'Internal Server Error
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!mounted ? (
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <header className="p-6 pb-2 flex flex-col items-center gap-4 animate-in fade-in duration-500">
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
                <div className="absolute top-4 right-4">
                  <Link href="/login">
                    <Badge className="bg-primary text-black font-black uppercase italic tracking-tighter px-4 py-2 cursor-pointer hover:scale-105 transition-transform">
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
                  Mercato : {totalActiveRealCount} annonces réelles
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
                placeholder="Chercher une annonce ou une ville..." 
                className="pl-10 h-12 bg-card border-none ring-1 ring-white/10 rounded-xl"
              />
            </div>
          </header>

          <section className="px-6 py-2">
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
                    activeFilter === filter.id ? 'bg-card border-primary/50 scale-105' : 'bg-card/40 border-white/5'
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

          <section className="px-6 py-4 flex flex-col gap-6 pb-32">
            <h2 className="text-xl font-black italic uppercase tracking-tighter">Dernières passes</h2>
            {isOffersLoading && (
              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            )}
            <div className="grid gap-6">
              {filteredOffers.length > 0 ? (
                filteredOffers.map((offer) => (
                  <Link href={`/offres/details/?id=${offer.id}`} key={offer.id} className="bg-card rounded-2xl overflow-hidden shadow-xl border border-white/5 group hover:border-primary/20 transition-all">
                    <div className="relative aspect-[16/9] w-full">
                      <Image src={offer.image} alt={offer.titre} fill className="object-cover" unoptimized />
                      <div className="absolute top-3 left-3">
                        <Badge className={offer.isReal ? "bg-primary text-black font-black uppercase italic" : "bg-muted text-muted-foreground font-black uppercase italic"}>
                          {offer.typeOffre}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg italic uppercase tracking-tighter">{offer.titre}</h3>
                      <div className="flex items-center gap-1 text-muted-foreground mt-2">
                        <MapPin className="w-3 h-3 text-primary" />
                        <span className="text-[10px] font-black uppercase">{offer.ville}</span>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-center py-10 text-muted-foreground uppercase font-black italic text-xs">Aucune annonce sur ce terrain.</p>
              )}
            </div>
          </section>

          <Navigation />
        </>
      )}
    </div>
  )
}
