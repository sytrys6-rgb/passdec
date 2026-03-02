
"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function StoresPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background p-6 text-foreground flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-primary truncate">Conformité Stores</h1>
      </header>
      <div className="bg-card p-6 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <span className="text-secondary font-black italic uppercase text-4xl">100%</span>
        </div>
        <div className="relative z-10 space-y-4">
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase italic tracking-widest text-primary">APPLICATION GRATUITE :</h2>
            <p className="text-xs font-bold leading-relaxed text-muted-foreground uppercase tracking-tighter">
              100% Pass'Déc' est gratuite au téléchargement et à l'utilisation.
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase italic tracking-widest text-secondary">CONTENU :</h2>
            <ul className="text-[11px] space-y-1 text-muted-foreground font-medium">
              <li>— Application destinée aux +13 ans</li>
              <li>— Contenu modéré par notre équipe</li>
              <li>— Signalement disponible sur chaque annonce</li>
            </ul>
          </div>
          <p className="text-xs font-black text-primary italic uppercase tracking-widest text-center py-4">Fait par et pour les passionnés.</p>
        </div>
      </div>
    </div>
  )
}
