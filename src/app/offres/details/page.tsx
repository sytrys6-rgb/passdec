
"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, MapPin, MessageSquare, Share2, ShieldCheck, Star, 
  Loader2, Info, User, Mail, MessageCircle, Trophy, Flag, AlertTriangle, Shield, Trash2 
} from 'lucide-react'
import Image from 'next/image'
import { 
  useFirestore, useDoc, useMemoFirebase, useUser, 
  updateDocumentNonBlocking, addDocumentNonBlocking, useCollection, deleteDocumentNonBlocking 
} from '@/firebase'
import { doc, collection, query, where, serverTimestamp } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { useState, Suspense, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from '@/components/ui/textarea'

const ADMIN_UID = "OvtBOwidg7dc4lHw5rR56yqLlIT2"

const profileTypes = {
  particulier: { label: 'Footeux', complement: 'Particulier', emoji: '⚽' },
  club_foot: { label: 'Team', complement: 'Club de foot', emoji: '🏟️' },
  club_supporter: { label: 'Ultras', complement: 'Club de supporters', emoji: '🎺' },
  professionnel: { label: 'Pro', complement: 'Professionnel / Entreprise', emoji: '🏢' },
}

const REPORT_REASONS = [
  "Contenu inapproprié",
  "Arnaque / Fausse annonce",
  "Spam",
  "Contenu illégal",
  "Autre"
]

function OfferDetailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const id = searchParams.get('id')
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  const { toast } = useToast()

  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [reportReason, setReportReason] = useState("")
  const [reportDetails, setReportDetails] = useState("")
  const [isSendingReport, setIsSendingReport] = useState(false)

  // Redirection vers login si non connecté pour voir les détails
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

  const authorId = offer?.userId
  const authorRef = useMemoFirebase(() => {
    if (!db || !authorId) return null
    return doc(db, 'users', authorId)
  }, [db, authorId])

  const { data: authorProfile } = useDoc(authorRef)

  const checkReportQuery = useMemoFirebase(() => {
    if (!db || !user || !id) return null
    return query(collection(db, 'signalements'), where('offreId', '==', id), where('signalePar', '==', user.uid))
  }, [db, user, id])
  const { data: existingReports } = useCollection(checkReportQuery)
  const alreadyReported = existingReports && existingReports.length > 0

  const handleContactPassDec = () => {
    if (!user) {
      router.push('/login')
      return
    }
    if (offer?.userId) {
      router.push(`/messages/chat/?userId=${offer.userId}&offerId=${id}`)
    }
  }

  const toggleFavorite = () => {
    if (!userRef || !user) {
      router.push('/login')
      return
    }

    if (!id) return;

    const newFavorites = isFavorite
      ? favorites.filter((favId: string) => favId !== id)
      : [...favorites, id]

    updateDocumentNonBlocking(userRef, { 
      favoris: newFavorites 
    })
  }

  const handleSendReport = async () => {
    if (!user || !db || !offer || !reportReason || !id) return
    
    setIsSendingReport(true)
    try {
      const reportsCol = collection(db, 'signalements')
      addDocumentNonBlocking(reportsCol, {
        offreId: id,
        offreTitre: offer.titre,
        signalePar: user.uid,
        signaleParNom: currentUserProfile?.nom || user.email?.split('@')[0] || 'Inconnu',
        raison: reportReason,
        details: reportDetails,
        createdAt: serverTimestamp(),
        statut: "en_attente"
      })
      
      toast({
        title: "Signalement envoyé",
        description: "L'arbitre va examiner cette annonce. Merci pour votre fair-play."
      })
      setIsReportModalOpen(false)
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le signalement."
      })
    } finally {
      setIsSendingReport(false)
    }
  }

  const handleAdminDelete = () => {
    if (!db || !offerRef || user?.uid !== ADMIN_UID) return
    
    deleteDocumentNonBlocking(offerRef)
    toast({
      variant: "destructive",
      title: "Arbitrage effectué",
      description: "L'annonce a été retirée du terrain par l'arbitre."
    })
    router.push('/')
  }

  if (isUserLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
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
  const isAdmin = user?.uid === ADMIN_UID

  const whatsappLink = authorProfile?.whatsapp 
    ? `https://wa.me/${authorProfile.whatsapp.replace(/\D/g, '')}` 
    : null
  const emailLink = authorProfile?.emailPublic ? `mailto:${authorProfile.emailPublic}` : null

  return (
    <div className="flex flex-col min-h-screen bg-background pb-80">
      <div className="relative aspect-square w-full">
        <Image 
          src={offer.image} 
          alt={offer.titre} 
          fill 
          className="object-cover"
          priority
          unoptimized
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
        <div className="absolute top-6 right-6 flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleFavorite}
            className={cn(
              "glass-morphism rounded-full h-10 w-10 border-white/10 transition-all active:scale-90",
              isFavorite ? "text-primary bg-primary/20 border-primary/30" : "text-white"
            )}
          >
            <Trophy className={cn("w-5 h-5", isFavorite && "fill-primary")} />
          </Button>
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
                <Badge className="w-fit bg-primary text-black font-black uppercase italic tracking-wider text-[10px] border-none">
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
              
              {authorProfile?.clubPrefere && authorProfile?.typeProfil === 'particulier' && (
                <div className="flex items-center justify-center gap-1.5 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 w-fit mx-auto mb-1">
                  <span className="text-xs font-black uppercase tracking-tighter text-primary">Club de 💛 {authorProfile.clubPrefere}</span>
                </div>
              )}

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

            {isAdmin && (
              <div className="flex flex-col gap-2 w-full mt-4">
                <Button asChild variant="ghost" size="sm" className="w-full text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary h-8 opacity-50 flex items-center gap-2">
                  <Link href="/admin">
                    <Shield className="w-3.5 h-3.5" />
                    Panel Arbitre
                  </Link>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 h-8 flex items-center gap-2">
                      <Trash2 className="w-3.5 h-3.5" />
                      Supprimer l'annonce (Arbitre)
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-white/10 rounded-3xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tighter text-destructive">Carton Rouge !</AlertDialogTitle>
                      <AlertDialogDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Confirmez-vous la suppression immédiate de cette annonce ? Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl font-black uppercase tracking-tighter text-xs">Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleAdminDelete}
                        className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-black uppercase tracking-tighter text-xs"
                      >
                        Confirmer l'arbitrage
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </div>

      {!isOwnOffer && (
        <div className="px-6 mt-12 mb-20 flex justify-center">
          <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
            <DialogTrigger asChild>
              <button 
                disabled={alreadyReported}
                className={cn(
                  "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                  alreadyReported ? "text-muted-foreground cursor-not-allowed" : "text-muted-foreground hover:text-destructive"
                )}
              >
                <Flag className="w-3 h-3" />
                {alreadyReported ? "Signalé à l'arbitre" : "Signaler l'annonce"}
              </button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Signalement
                </DialogTitle>
                <DialogDescription className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Aidez-nous à garder le terrain propre et sécurisé.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Raison du signalement</label>
                  <Select value={reportReason} onValueChange={setReportReason}>
                    <SelectTrigger className="bg-background border-none ring-1 ring-white/10 rounded-xl">
                      <SelectValue placeholder="Choisir une raison" />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_REASONS.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Détails (Optionnel)</label>
                  <Textarea 
                    placeholder="Précisez votre signalement..."
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    className="bg-background border-none ring-1 ring-white/10 rounded-xl min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter className="flex flex-col gap-2">
                <Button 
                  onClick={handleSendReport} 
                  disabled={!reportReason || isSendingReport}
                  className="w-full bg-destructive text-white hover:bg-destructive/90 rounded-xl font-black uppercase italic tracking-wider h-12"
                >
                  {isSendingReport ? "Envoi..." : "Envoyer le signalement"}
                </Button>
                <Button variant="ghost" onClick={() => setIsReportModalOpen(false)} className="w-full uppercase font-black text-[10px] tracking-widest">
                  Annuler
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {!isOwnOffer && offer.userId && (
        <div className="fixed bottom-24 left-6 right-6 z-40 flex flex-col gap-3 animate-in slide-in-from-bottom-8 duration-500">
          {whatsappLink && (
            <Button 
              asChild
              className="w-full h-12 rounded-2xl font-black italic uppercase tracking-wider text-xs shadow-lg bg-green-500/10 border border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white transition-all gap-3 group"
            >
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                WhatsApp
              </a>
            </Button>
          )}

          {emailLink && (
            <Button 
              asChild
              className="w-full h-12 rounded-2xl font-black italic uppercase tracking-wider text-xs shadow-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all gap-3 group"
            >
              <a href={emailLink}>
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                Envoyer un Email
              </a>
            </Button>
          )}

          <Button 
            onClick={handleContactPassDec}
            className="w-full h-14 rounded-2xl font-black italic uppercase tracking-wider text-lg shadow-2xl shadow-primary/20 gap-3 group bg-primary text-black hover:bg-primary/90"
          >
            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
            Messagerie Pass' Déc'
          </Button>
        </div>
      )}

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
