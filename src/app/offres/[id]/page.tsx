
"use client"

import { useParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, MessageSquare, Share2, ShieldCheck, Star, Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { allOffers } from '@/app/lib/offers'
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase'
import { doc } from 'firebase/firestore'

export default function OfferDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const db = useFirestore()

  // 1. Chercher d'abord dans les données mockées
  const mockOffer = allOffers.find(o => o.id === id)

  // 2. Si pas trouvé, chercher dans Firestore
  const offerRef = useMemoFirebase(() => {
    if (!db || !id || mockOffer) return null
    return doc(db, 'offres', id)
  }, [db, id, mockOffer])

  const { data: firestoreOffer, isLoading: isFirestoreLoading } = useDoc(offerRef)

  // On combine ou on choisit la source
  const offer = mockOffer || (firestoreOffer ? {
    id: firestoreOffer.id,
    titre: firestoreOffer.titre,
    description: firestoreOffer.description,
    prix: firestoreOffer.prix,
    etat: firestoreOffer.etat,
    ville: firestoreOffer.ville,
    typeOffre: firestoreOffer.typeOffre as any,
    image: firestoreOffer.photos?.[0] || 'https://picsum.photos/seed/foot/600/400',
    userNom: firestoreOffer.userNom,
    userType: firestoreOffer.userType,
    userRating: 5.0, // Défaut pour Firestore
    date: 'Publié récemment'
  } : null)

  if (isFirestoreLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter mb-4 text-destructive">Hors-jeu !</h1>
        <p className="text-muted-foreground mb-8">Cette annonce n'existe pas ou a été retirée du terrain.</p>
        <Button onClick={() => router.push('/')} className="rounded-xl font-black uppercase italic">Retour à l'accueil</Button>
      </div>
    )
  }

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
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <Badge className="w-fit bg-primary text-black font-black uppercase italic tracking-wider text-[10px]">
                  {offer.typeOffre}
                </Badge>
                {offer.etat && (
                  <Badge variant="outline" className="w-fit border-primary/40 text-primary font-black uppercase italic tracking-wider text-[8px] h-5">
                    {offer.etat === 'Satisfaisant' ? 'État satisfaisant' : offer.etat}
                  </Badge>
                )}
              </div>
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
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {offer.description}
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
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
            </div>
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
