
"use client"

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function LegalMentionsPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-background p-6 text-foreground flex flex-col gap-6">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-primary">Mentions Légales</h1>
      </header>
      <div className="bg-card p-6 rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-10">
           <span className="text-secondary font-black italic uppercase text-4xl">100%</span>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase italic tracking-widest text-primary">ÉDITEUR :</h2>
            <p className="text-xs font-bold text-white uppercase tracking-tighter">Cyril Raso</p>
            <p className="text-[11px] text-muted-foreground">sytrys6@gmail.com • France</p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase italic tracking-widest text-secondary">HÉBERGEMENT :</h2>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Google Firebase
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="text-xs font-black uppercase italic tracking-widest text-primary">STOCKAGE IMAGES :</h2>
            <p className="text-[11px] text-muted-foreground">Cloudinary Ltd.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
