
"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, MapPin, MessageSquare, ShieldCheck, Star, 
  Loader2, Info, User, Trophy, Flag, Shield, Heart
} from 'lucide-react'
import Image from 'next/image'
import { 
  useFirestore, useDoc, useMemoFirebase, useUser, 
  updateDocumentNonBlocking, deleteDocumentNonBlocking 
} from '@/firebase'
import { doc } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { Suspense, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export const dynamic = 'force-dynamic';

const profileTypes = {
  particulier: { label: 'Footeux', complement: 'Particulier', emoji: '⚽' },
  club_foot: { label: 'Team', complement: 'Club de foot', emoji: '🏟️' },
  club_supporter: { label: 'Ultras', complement: 'Club de supporters', emoji: '🎺' },
  professionnel: { label: 'Pro', complement: 'Professionnel / Entreprise', emoji: '🏢' },
}

function OfferDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  const offerRef = useMemoFirebase(() => {
    if (!db || !id) return null
    return doc(db, 'offres', id)
  }, [db, id])

  const { data: firestoreOffer, isLoading: isFirestoreLoading } = useDoc(offerRef)

  const offer = firestoreOffer ? {
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
    userId: firestoreOffer.userId,
    userRating: 5.0,
    date: 'En ligne'
  } : null

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])
  
  const { data: currentUserProfile } = useDoc(userRef)
  const favorites = currentUserProfile?.favoris || []
  const isFavorite = id ? favorites.includes(id) : false
  const isAdmin = currentUserProfile?.role === 'admin' || user?.email === 'sytrys6@gmail.com'

  const authorId = offer?.userId
  const authorRef = useMemoFirebase(() => {
    if (!db || !authorId) return null
    return doc(db, 'users', authorId)
  }, [db, authorId])

  const { data: authorProfile } = useDoc(authorRef)

  const handleContactPassDec = () => {
    if (offer?.userId) {
      router.push(`/messages/chat/?userId=${offer.userId}&offerId=${id}`)
    }
  }

  const toggleFavorite = () => {
    if (!id || !userRef) return;
    const newFavorites = isFavorite ? favorites.filter((favId: string) => favId !== id) : [...favorites, id]
    updateDocumentNonBlocking(userRef, { favoris: newFavorites })
  }

  const handleAdminDelete = () => {
    if (!offerRef) return
    deleteDocumentNonBlocking(offerRef)
    toast({
      variant: "destructive",
      title: "Arbitrage effectué",
      description: "L'annonce a été retirée du terrain par l'arbitre."
    })
    router.push('/')
  }

  if (isFirestoreLoading || isUserLoading || !user) {
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
        <p className="text-muted-foreground mb-8">Cette annonce n'existe pas ou a été retirée.</p>
        <Button onClick={() => router.push('/')} className="rounded-xl font-black uppercase italic">Retour à l'accueil</Button>
      </div>
    )
  }

  const authorType = authorProfile ? (profileTypes[authorProfile.typeProfil as keyof typeof profileTypes] || profileTypes.particulier) : profileTypes.particulier
  const isOwnOffer = user?.uid === offer.userId

  return (
    <div className="flex flex-col min-h-screen bg-background pb-80">
      <div className="relative aspect-square w-full">
        <Image src={offer.image} alt={offer.titre} fill className="object-cover" priority unoptimized />
        <div className="absolute top-6 left-6 flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="glass-morphism rounded-full h-10 w-10 border-white/10 shadow-lg">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="absolute top-6 right-6 flex gap-2">
          <Button variant="ghost" size="icon" onClick={toggleFavorite} className={cn("glass-morphism rounded-full h-10 w-10 border-white/10 shadow-lg", isFavorite ? "text-primary bg-primary/20 border-primary/30" : "text-white")}>
            <Trophy className={cn("w-5 h-5", isFavorite && "fill-primary")} />
          </Button>
        </div>
      </div>

      <div className="px-6 -mt-8 relative z-10">
        <div className="bg-card rounded-3xl p-6 shadow-2xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-2">
              <Badge className="w-fit bg-primary text-black font-black uppercase italic tracking-wider text-[10px]">
                {offer.typeOffre}
              </Badge>
              <h1 className="text-2xl font-black italic uppercase tracking-tighter mt-1">{offer.titre}</h1>
            </div>
            <div className="text-2xl font-black text-primary italic">{offer.prix > 0 ? `${offer.prix}€` : 'Gratuit'}</div>
          </div>

          <div className="flex items-center gap-4 text-muted-foreground mb-6">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold uppercase tracking-widest">{offer.ville}</span>
            </div>
          </div>

          <div className="space-y-4 text-left">
            <h2 className="text-sm font-black uppercase italic tracking-widest text-primary border-b border-primary/20 pb-1 w-fit">Description du match</h2>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">{offer.description}</p>
          </div>
        </div>
      </div>

      <div className="px-6 mt-8">
        <div className="relative bg-card/80 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl flex flex-col items-center gap-4 overflow-hidden text-center">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
          
          <div className="relative">
            <div className="w-28 h-28 rounded-full border-4 border-primary/20 overflow-hidden shadow-2xl bg-muted flex items-center justify-center">
              {authorProfile?.photoUrl ? <Image src={authorProfile.photoUrl} alt={offer.userNom} fill className="object-cover" unoptimized /> : <User className="w-12 h-12 text-muted-foreground" />}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-primary p-1.5 rounded-full border-2 border-card shadow-lg">
              <ShieldCheck className="w-4 h-4 text-black" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter">{offer.userNom}</h3>
            <div className="flex justify-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 font-black uppercase italic tracking-widest text-[8px]">{authorType.emoji} {authorType.label}</Badge>
              {authorProfile?.role === 'admin' && <Badge className="bg-destructive text-white border-none font-black uppercase italic tracking-widest text-[8px]">Arbitre</Badge>}
            </div>
          </div>

          {authorProfile?.clubPrefere && (
            <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/5 border border-primary/10 rounded-full">
              <Heart className="w-3 h-3 text-primary fill-primary/20" />
              <span className="text-[10px] font-black uppercase italic tracking-tighter text-primary">{authorProfile.clubPrefere}</span>
            </div>
          )}

          <div className="w-full mt-2">
            <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed px-4">
              "{authorProfile?.description || "Ce joueur n'a pas encore rempli sa bio tactique."}"
            </p>
          </div>

          <div className="flex gap-4 w-full justify-center pt-2">
            <div className="flex flex-col items-center">
              <span className="text-lg font-black italic text-primary">5.0</span>
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-2 h-2 fill-primary text-primary" />)}
              </div>
            </div>
            <div className="w-px h-8 bg-white/5" />
            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Membre</span>
              <span className="text-[10px] font-bold text-foreground">Pro</span>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-24 left-6 right-6 z-40 flex flex-col gap-3 animate-in slide-in-from-bottom-8">
        {!isOwnOffer && (
          <Button onClick={handleContactPassDec} className="w-full h-14 rounded-2xl font-black italic uppercase tracking-wider text-lg bg-primary text-black shadow-2xl">
            <MessageSquare className="w-5 h-5 mr-3" />
            Messagerie Pass' Déc'
          </Button>
        )}
        
        {isAdmin && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full h-12 rounded-xl font-black uppercase italic tracking-widest text-xs border-2 border-white/10 shadow-2xl">
                <Shield className="w-4 h-4 mr-2" />
                Supprimer (Arbitre)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-white/10 rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tighter text-destructive">Arbitrage V.A.R</AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Voulez-vous retirer cette annonce du terrain définitivement ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl font-black uppercase tracking-tighter text-xs">Annuler</AlertDialogCancel>
                <AlertDialogAction onClick={handleAdminDelete} className="bg-destructive text-white rounded-xl font-black uppercase tracking-tighter text-xs">Confirmer</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <Navigation />
    </div>
  )
}

export default function OfferDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-background"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <OfferDetailContent />
    </Suspense>
  )
}
