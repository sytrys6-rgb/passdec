"use client"

import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Camera, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NewOfferPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold italic uppercase tracking-tighter">Nouvelle Offre</h1>
      </div>

      <form className="flex flex-col gap-6 pb-12">
        <div className="grid grid-cols-2 gap-4">
          <div className="aspect-square rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer bg-card">
            <Camera className="w-8 h-8" />
            <span className="text-[10px] font-bold uppercase">Photo 1</span>
          </div>
          <div className="aspect-square rounded-2xl border-2 border-dashed border-muted flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer bg-card">
            <Camera className="w-8 h-8" />
            <span className="text-[10px] font-bold uppercase">Photo 2</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Type de passe</Label>
          <Select>
            <SelectTrigger className="bg-card border-none ring-1 ring-white/10 rounded-xl">
              <SelectValue placeholder="Choisir le type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendre">Vendre</SelectItem>
              <SelectItem value="echanger">Échanger</SelectItem>
              <SelectItem value="evenement">Événement</SelectItem>
              <SelectItem value="matcher">Matcher (Recrutement)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Titre de l'annonce</Label>
          <Input placeholder="Ex: Maillot collector OL 2002" className="bg-card border-none ring-1 ring-white/10 rounded-xl" />
        </div>

        <div className="space-y-2">
          <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Description</Label>
          <Textarea 
            placeholder="Détaillez votre offre (état, taille, conditions...)" 
            className="bg-card border-none ring-1 ring-white/10 rounded-xl min-h-[120px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Ville</Label>
            <Input placeholder="Ex: Lyon" className="bg-card border-none ring-1 ring-white/10 rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Prix (€)</Label>
            <Input type="number" placeholder="0" className="bg-card border-none ring-1 ring-white/10 rounded-xl" />
          </div>
        </div>

        <Button size="lg" className="w-full rounded-2xl h-14 text-lg font-extrabold italic uppercase tracking-wider mt-4 shadow-lg shadow-primary/20">
          Publier l'offre
        </Button>
      </form>

      <Navigation />
    </div>
  )
}