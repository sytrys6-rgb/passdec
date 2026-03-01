
"use client"

import { useParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, MessageSquare, Share2, ShieldCheck, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { allOffers } from '@/app/lib/offers'

export default function OfferDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id

  const offer = allOffers.find(o => o.id === id) || allOffers[0]

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      <div className="relative aspect-square w-full">
        <Image 
          src={offer.image} 
          alt={offer.titre} 
          fill 
          className="object-cover"
          priority
        />
        <div className="absolute top-6 left-6 flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="glass-morphism rounded-full h-10 w-10 border-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="absolute top-6 right-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="glass-morphism rounded-full h-10 w-10 border-white/10"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="px-6 -mt-8 relative">
        <div className="bg-card rounded-3xl p-6 shadow-2xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-1">
              <Badge className="w-fit bg-primary text-black font-black uppercase italic tracking-wider text-[10px]">
                {offer.typeOffre}
              </Badge>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter mt-1">{offer.titre}</h1>
            </div>
            {offer.prix > 0 ? (
              <div className="text-2xl font-black text-primary italic">{offer.prix}€</div>
            ) : (
              <div className="text-lg font-black text-primary italic uppercase tracking-tighter">Gratuit</div>
            )}
          </div>

          <div className="flex items-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">{offer.ville}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{offer.date}</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase italic tracking-widest text-primary border-b border-primary/20 pb-1 w-fit">Description</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {offer.description}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <Link href="/profile" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden">
                  <Image src={`https://picsum.photos/seed/${offer.userNom}/100/100`} alt={offer.userNom} width={48} height={48} className="object-cover" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-primary rounded-lg p-0.5 border-2 border-card">
                  <ShieldCheck className="w-3 h-3 text-black" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-black uppercase italic tracking-tighter text-sm">{offer.userNom}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold text-muted-foreground">{offer.userRating}</span>
                  <Star className="w-2.5 h-2.5 fill-primary text-primary" />
                </div>
              </div>
            </Link>
            <Button variant="outline" size="sm" className="rounded-xl border-white/10 hover:bg-primary hover:text-black font-bold uppercase tracking-tighter text-[10px]">
              Voir profil
            </Button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-24 left-6 right-6 z-40">
        <Button className="w-full h-14 rounded-2xl font-black italic uppercase tracking-wider text-lg shadow-2xl shadow-primary/20 gap-3 group">
          <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Faire une offre
        </Button>
      </div>

      <Navigation />
    </div>
  )
}
