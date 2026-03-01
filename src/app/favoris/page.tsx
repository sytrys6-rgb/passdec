
"use client"

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { Trophy, MapPin } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { allOffers } from '@/app/lib/offers'
import { useUser } from '@/firebase'
import { useRouter } from 'next/navigation'

export default function FavoritesPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

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

  const favoriteOffers = allOffers.filter(offer => favorites.includes(offer.id))

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const newFavs = favorites.filter(favId => favId !== id)
    setFavorites(newFavs)
    localStorage.setItem('pass-dec-favorites', JSON.stringify(newFavs))
  }

  if (isUserLoading || !user) return null

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-6">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Mes Trophées</h1>
        <div className="h-1 w-12 bg-primary mt-1 rounded-full" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
          Vos annonces favorites
        </p>
      </header>

      <div className="flex-grow px-6 pb-24">
        {favoriteOffers.length > 0 ? (
          <div className="grid gap-6">
            {favoriteOffers.map((offer) => (
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
                    className="absolute top-3 right-3 p-2 rounded-full text-primary bg-primary/20 border border-primary/30 glass-morphism transition-all active:scale-90 z-10"
                  >
                    <Trophy className="w-5 h-5 fill-primary" />
                  </button>

                  {offer.prix > 0 && (
                    <div className="absolute bottom-3 right-3 glass-morphism px-3 py-1 rounded-full font-black text-primary italic border-primary/20">
                      {offer.prix}€
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col gap-2">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors italic uppercase tracking-tighter">{offer.titre}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-1">{offer.description}</p>
                  
                  <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-2">
                    <span className="text-xs font-bold uppercase tracking-tighter">{offer.userNom}</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">{offer.ville}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <Trophy className="w-16 h-16 text-primary/10" />
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest italic">Aucun trophée pour le moment</p>
              <p className="text-[10px] font-bold mt-2">Marquez vos annonces préférées pour les retrouver ici.</p>
            </div>
            <Link href="/">
              <Badge className="mt-4 bg-primary text-black border-none font-black uppercase tracking-tighter italic px-6 py-2 cursor-pointer hover:bg-primary/80">
                Explorer les passes
              </Badge>
            </Link>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}
