
"use client"

import { useParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, MapPin, MessageSquare, Share2, ShieldCheck, Star, Loader2, Info, User, Mail, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { allOffers } from '@/app/lib/offers'
import { useFirestore, useDoc, useMemoFirebase, useUser } from '@/firebase'
import { doc } from 'firebase/firestore'

const profileTypes = {
  particulier: { label: 'Footeux', complement: 'Particulier', emoji: '⚽' },
  club_foot: { label: 'Team', complement: 'Club de foot', emoji: '🏟️' },
  club_supporter: { label: 'Ultras', complement: 'Club de supporters', emoji: '🎺' },
  professionnel: { label: 'Pro', complement: 'Professionnel / Entreprise', emoji: '🏢' },
}

export default function OfferDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const db = useFirestore()
  const { user } = useUser()

  // 1. Chercher d'abord dans les données mockées
  const mockOffer = allOffers.find(o => o.id === id)

  // 2. Si pas trouvé, chercher dans Firestore
  const offerRef = useMemoFirebase(() => {
    if (!db || !id || mockOffer) return null
    return doc(db, 'offres', id)
  }, [db, id, mockOffer])

  const { data: firestoreOffer, isLoading: isFirestoreLoading } = useDoc(offerRef)

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
    userId: firestoreOffer.userId,
    userRating: 5.0,
    date: 'Publié récemment'
  } : null)

  // Charger le profil de l'auteur
  const authorId = offer?.userId
  const authorRef = useMemoFirebase(() => {
    if (!db || !authorId) return null
    return doc(db, 'users', authorId)
  }, [db, authorId])

  const { data: authorProfile } = useDoc(authorRef)

  const handleContactPassDec = () => {
    if (!user) {
      router.push('/login')
      return
    }
    if (offer?.userId) {
      router.push(`/messages/${offer.userId}`)
    }
  }

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

  const currentType = profileTypes[offer.userType as keyof typeof profileTypes] || profileTypes.particulier
  const isOwnOffer = user?.uid === offer.userId

  const whatsappLink = authorProfile?.whatsapp ? `https://wa.me/${authorProfile.whatsapp.replace(/\s+/g, '')}` : null
  const emailLink = authorProfile?.emailPublic ? `mailto:${authorProfile.emailPublic}` : null

  return (
    <div className="flex flex-col min-h-screen bg-background pb-48">
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

      <div className="px-6 -mt-8 relative z-10">
        <div className="bg-card rounded-3xl p-6 shadow-2xl border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-center">
                <Badge className="w-fit bg-primary text-black font-black uppercase italic tracking-wider text-[10px]">
                  {offer.typeOffre}
                </Badge>
                {offer.etat && (
                  <Badge variant="outline" className="w-fit border-primary/40 text-primary font-black uppercase italic tracking-wider text-[8px] h-5">
                    {offer.etat}
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
        </div>
      </div>

      {/* SECTION FICHE FIFA */}
      <div className="px-6 mt-8">
        <h2 className="text-lg font-black italic uppercase tracking-tighter mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-primary" />
          Fiche Recrue
        </h2>
        
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-card to-background rounded-[2.5rem] border-2 border-primary/20 transform rotate-1 group-hover:rotate-0 transition-transform duration-500" />
          
          <div className="relative bg-card/80 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl flex flex-col items-center gap-4 overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
            
            <div className="w-full flex justify-between items-start">
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black italic text-primary leading-none">5.0</span>
                <div className="flex gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-2.5 h-2.5 fill-primary text-primary" />
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase italic tracking-widest px-3 py-1 bg-primary/5">
                  {currentType.emoji} {currentType.label}
                </Badge>
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                  {currentType.complement}
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="w-28 h-28 rounded-full border-4 border-primary/20 overflow-hidden shadow-2xl bg-muted flex items-center justify-center">
                {authorProfile?.photoUrl ? (
                  <Image src={authorProfile.photoUrl} alt={offer.userNom} fill className="object-cover" unoptimized />
                ) : (
                  <User className="w-12 h-12 text-muted-foreground" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-primary p-1.5 rounded-full border-2 border-card shadow-lg">
                <ShieldCheck className="w-5 h-5 text-black" />
              </div>
            </div>

            <div className="text-center w-full space-y-1">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter text-foreground">{offer.userNom}</h3>
              <div className="flex items-center justify-center gap-1.5 text-primary">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em]">{offer.ville}</span>
              </div>
            </div>

            <div className="w-full bg-white/5 rounded-2xl p-4 mt-2 border border-white/5">
               <p className="text-[11px] font-bold text-muted-foreground italic text-center leading-relaxed">
                "{authorProfile?.description || "Cette recrue n'a pas encore rempli son palmarès."}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isOwnOffer && offer.userId && (
        <div className="fixed bottom-24 left-6 right-6 z-40 flex flex-col gap-2">
          {whatsappLink && (
            <Button 
              asChild
              className="w-full h-12 rounded-2xl font-black italic uppercase tracking-wider text-sm shadow-xl bg-green-500 hover:bg-green-600 text-white gap-3 group"
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                WhatsApp
              </a>
            </Button>
          )}

          {emailLink && (
            <Button 
              asChild
              className="w-full h-12 rounded-2xl font-black italic uppercase tracking-wider text-sm shadow-xl bg-blue-500 hover:bg-blue-600 text-white gap-3 group"
            >
              <a href={emailLink}>
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Envoyer un Email
              </a>
            </Button>
          )}

          <Button 
            onClick={handleContactPassDec}
            className="w-full h-14 rounded-2xl font-black italic uppercase tracking-wider text-lg shadow-2xl shadow-primary/20 gap-3 group"
          >
            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Messagerie Pass' Déc'
          </Button>
        </div>
      )}

      <Navigation />
    </div>
  )
}
