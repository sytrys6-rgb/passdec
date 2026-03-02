
"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function FootballPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background p-6 text-foreground flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-primary truncate">Spécificité Football</h1>
      </header>
      <div className="bg-card p-6 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <span className="text-secondary font-black italic uppercase text-4xl">100%</span>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase italic tracking-widest text-primary">AUTORISÉ :</h2>
            <ul className="text-[10px] space-y-1 text-muted-foreground font-bold uppercase tracking-tight">
              <li>⚽ Vente de matériel football</li>
              <li>⚽ Échange d'équipements sportifs</li>
              <li>⚽ Organisation d'événements football</li>
              <li>⚽ Recherche de partenaires de match</li>
              <li>⚽ Vente de billets entre particuliers</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase italic tracking-widest text-secondary">INTERDIT :</h2>
            <ul className="text-[10px] space-y-1 text-muted-foreground font-bold uppercase tracking-tight">
              <li>🚫 Contrefaçons et faux produits</li>
              <li>🚫 Contenu offensant ou discriminatoire</li>
              <li>🚫 Spam et publicité non autorisée</li>
              <li>🚫 Harcèlement entre utilisateurs</li>
              <li>🚫 Revente abusive de billets</li>
            </ul>
          </div>
          <div className="p-4 bg-background/50 rounded-2xl border border-white/5">
             <h2 className="text-xs font-black uppercase italic tracking-widest text-primary mb-2">MODÉRATION :</h2>
             <p className="text-[10px] leading-relaxed text-muted-foreground font-medium">
               Tout contenu inapproprié peut être signalé via le bouton ⚑ disponible sur chaque annonce. Notre équipe traite chaque signalement sous 48h.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
