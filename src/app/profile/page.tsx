"use client"

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, LogOut, ShieldCheck, MapPin, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const profileTypes = {
  particulier: { label: 'Footeux', complement: 'Particulier', emoji: '⚽' },
  club_foot: { label: 'Team', complement: 'Club de foot', emoji: '🏟️' },
  club_supporter: { label: 'Ultras', complement: 'Club de supporters', emoji: '🎺' },
  professionnel: { label: 'Pro', complement: 'Professionnel / Entreprise', emoji: '🏢' },
}

export default function ProfilePage() {
  const [user, setUser] = useState({
    nom: 'FC Etoile',
    typeProfil: 'club_foot',
    ville: 'Lyon',
    description: 'Club amateur historique de la région lyonnaise. On cherche toujours des nouveaux talents !',
    stats: {
      offres: 12,
      avis: 48,
      rating: 4.8
    },
    avatar: 'https://picsum.photos/seed/club-logo/200/200'
  })

  useEffect(() => {
    const savedUser = localStorage.getItem('pass-dec-user')
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        setUser(prev => ({ ...prev, ...parsed }))
      } catch (e) {
        console.error("Failed to parse user data", e)
      }
    }
  }, [])

  const currentType = profileTypes[user.typeProfil as keyof typeof profileTypes] || profileTypes.particulier

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="relative h-48 w-full bg-gradient-to-b from-primary/20 to-transparent overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute top-6 right-6 flex gap-2">
          <Link href="/profile/edit">
            <Button variant="ghost" size="icon" className="glass-morphism rounded-full border-white/10">
              <Settings className="w-5 h-5 text-primary" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-6 -mt-16 relative flex flex-col items-center text-center">
        <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-background bg-card shadow-2xl relative">
          <Image src={user.avatar} alt={user.nom} width={128} height={128} className="object-cover" />
          <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-tl-xl border-t border-l border-background">
            <ShieldCheck className="w-4 h-4 text-black" />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col items-center gap-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">{user.nom}</h1>
          <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{user.ville}</span>
          </div>
          <div className="flex flex-col items-center gap-1 mt-3">
            <Badge className="bg-primary text-black border-none font-black uppercase tracking-tighter italic px-4 gap-2">
              <span>{currentType.emoji}</span>
              <span>{currentType.label}</span>
            </Badge>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{currentType.complement}</span>
          </div>
        </div>

        <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-sm px-4">
          {user.description}
        </p>

        <div className="grid grid-cols-3 w-full gap-4 mt-8">
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center border border-white/5 group hover:border-primary/30 transition-colors">
            <span className="text-2xl font-black italic text-primary">{user.stats.offres}</span>
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Passes</span>
          </div>
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center border border-white/5 group hover:border-primary/30 transition-colors">
            <span className="text-2xl font-black italic text-primary">{user.stats.avis}</span>
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Avis</span>
          </div>
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center border border-white/5 group hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-1 text-primary">
              <span className="text-2xl font-black italic">{user.stats.rating}</span>
              <Star className="w-3 h-3 fill-primary" />
            </div>
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Niveau</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 mt-8 pb-10">
          <Button className="w-full rounded-xl py-6 bg-primary text-black hover:bg-primary/90 font-black uppercase tracking-widest text-xs h-12 italic">
            Mes annonces
          </Button>
          <Button variant="ghost" className="w-full text-accent hover:text-accent hover:bg-accent/10 rounded-xl h-12 font-black uppercase tracking-widest text-xs">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      <Navigation />
    </div>
  )
}
