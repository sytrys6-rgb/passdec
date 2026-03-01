"use client"

import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, LogOut, ShieldCheck, MapPin, Trophy, Star } from 'lucide-react'
import Image from 'next/image'

export default function ProfilePage() {
  const user = {
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
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Profile Header */}
      <div className="relative h-48 w-full bg-primary/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute top-6 right-6 flex gap-2">
          <Button variant="ghost" size="icon" className="glass-morphism rounded-full">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-6 -mt-16 relative flex flex-col items-center text-center">
        <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-background bg-card shadow-2xl">
          <Image src={user.avatar} alt={user.nom} width={128} height={128} className="object-cover" />
        </div>
        
        <div className="mt-4 flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold italic uppercase tracking-tighter">{user.nom}</h1>
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span className="text-xs font-medium uppercase tracking-widest">{user.ville}</span>
          </div>
          <Badge variant="secondary" className="mt-2 bg-primary/20 text-primary border-none font-bold uppercase tracking-tighter italic">
            {user.typeProfil === 'club_foot' ? 'Club de Foot' : 'Particulier'}
          </Badge>
        </div>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
          {user.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 w-full gap-4 mt-8">
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center">
            <span className="text-xl font-black italic text-primary">{user.stats.offres}</span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Offres</span>
          </div>
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center">
            <span className="text-xl font-black italic text-primary">{user.stats.avis}</span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Avis</span>
          </div>
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center">
            <div className="flex items-center gap-1 text-primary">
              <span className="text-xl font-black italic">{user.stats.rating}</span>
              <Star className="w-3 h-3 fill-primary" />
            </div>
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Score</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 mt-8">
          <Button variant="outline" className="w-full rounded-xl py-6 border-white/5 bg-card hover:bg-muted font-bold uppercase tracking-widest text-xs h-12">
            Mes annonces
          </Button>
          <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl h-12 font-bold uppercase tracking-widest text-xs">
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>

      <Navigation />
    </div>
  )
}