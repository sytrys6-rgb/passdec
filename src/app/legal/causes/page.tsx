
"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function CausesPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background p-6 text-foreground flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Nos Causes</h1>
      </header>
      <div className="bg-card p-6 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <span className="text-secondary font-black italic uppercase text-4xl">100%</span>
        </div>
        <div className="relative z-10 space-y-4">
          <p className="font-bold text-sm leading-relaxed text-muted-foreground">
            100% Pass'Déc' est né d'une passion commune : le football sous toutes ses formes.
          </p>
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase italic tracking-widest text-primary">Notre mission :</h2>
            <ul className="text-xs space-y-1 text-muted-foreground font-medium">
              <li>— Créer du lien entre clubs, supporters et passionnés de football en France</li>
              <li>— Faciliter les échanges de matériel, billets et équipements entre fans</li>
              <li>— Soutenir les petits clubs amateurs</li>
              <li>— Promouvoir le fair-play et les valeurs du sport</li>
            </ul>
          </div>
          <p className="font-bold text-sm leading-relaxed text-muted-foreground italic">
            Nous croyons que le football appartient à tout le monde. Ensemble, faisons marquer la communauté !
          </p>
        </div>
      </div>
    </div>
  )
}
