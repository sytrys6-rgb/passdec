
"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function CookiesPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background p-6 text-foreground flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Cookies</h1>
      </header>
      <div className="bg-card p-6 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <span className="text-secondary font-black italic uppercase text-4xl">100%</span>
        </div>
        <div className="relative z-10 space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dernière mise à jour : Mars 2026</p>
          <p className="text-xs font-bold leading-relaxed text-muted-foreground italic uppercase tracking-tighter">
            100% Pass'Déc' utilise uniquement des cookies techniques nécessaires au fonctionnement de l'application.
          </p>
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase italic tracking-widest text-primary">COOKIES UTILISÉS :</h2>
            <ul className="text-[11px] space-y-1 text-muted-foreground font-medium">
              <li>— Firebase Authentication (maintenir votre connexion)</li>
              <li>— Cookies de session (navigation dans l'app)</li>
            </ul>
          </div>
          <p className="text-xs font-black text-secondary uppercase italic tracking-widest">L'application est 100% sans publicité.</p>
        </div>
      </div>
    </div>
  )
}
