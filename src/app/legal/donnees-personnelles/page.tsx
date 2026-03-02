
"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function DataPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background p-6 text-foreground flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Mes Données</h1>
      </header>
      <div className="bg-card p-6 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <span className="text-secondary font-black italic uppercase text-4xl">100%</span>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="space-y-1">
             <h2 className="text-xs font-black uppercase italic tracking-widest text-primary">RESPONSABLE :</h2>
             <p className="text-xs font-bold">Cyril Raso • sytrys6@gmail.com</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase italic tracking-widest text-secondary">DURÉE DE CONSERVATION :</h2>
            <ul className="text-[11px] space-y-1 text-muted-foreground font-medium">
              <li>— Compte actif : données conservées</li>
              <li>— Compte supprimé : suppression sous 30 jours</li>
              <li>— Messages : supprimés avec le compte</li>
            </ul>
          </div>
          <p className="text-[10px] text-muted-foreground italic leading-relaxed">
            Données hébergées chez Google Firebase (serveurs USA) avec garanties adéquates selon le RGPD.
          </p>
        </div>
      </div>
    </div>
  )
}
