
"use client"

import { useEffect, useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, LogOut, ShieldCheck, MapPin, Star, Loader2, MapPin as MapPinIcon, ArrowDownToLine, User as UserIcon, RefreshCcw, Flag, ChevronRight, Shield, Cookie, FileText, Database, Smartphone, Trophy, UserX } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, useCollection, deleteDocumentNonBlocking } from '@/firebase'
import { signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { doc, collection, query, where } from 'firebase/firestore'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const profileTypes = {
  particulier: { label: 'Footeux', complement: 'Particulier', emoji: '⚽' },
  club_foot: { label: 'Team', complement: 'Club de foot', emoji: '🏟️' },
  club_supporter: { label: 'Ultras', complement: 'Club de supporters', emoji: '🎺' },
  professionnel: { label: 'Pro', complement: 'Professionnel / Entreprise', emoji: '🏢' },
}

const ADMIN_UID = "OvtBOwidg7dc4lHw5rR56yqLlIT2"
const CLOUDINARY_CLOUD_NAME = "dfincejqz";
const CLOUDINARY_API_KEY = "323874418517541";

export default function ProfilePage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [showMyOffers, setShowMyOffers] = useState(false)

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  const userRef = useMemoFirebase(() => {
    if (!db || !user || isUserLoading) return null
    return doc(db, 'users', user.uid)
  }, [db, user, isUserLoading])

  const { data: profile } = useDoc(userRef)

  const myOffersQuery = useMemoFirebase(() => {
    if (!db || isUserLoading || !user) return null
    return query(
      collection(db, 'offres'), 
      where('userId', '==', user.uid)
    )
  }, [db, isUserLoading, user])

  const { data: myOffers, isLoading: isMyOffersLoading } = useCollection(myOffersQuery)

  const sortedMyOffers = useMemo(() => {
    if (!myOffers) return []
    return [...myOffers].sort((a, b) => {
      const timeA = a.createdAt?.seconds || Date.now() / 1000
      const timeB = b.createdAt?.seconds || Date.now() / 1000
      return timeB - timeA
    })
  }, [myOffers])

  const handleLogout = () => {
    signOut(auth)
  }

  const handleDeleteOffer = async (e: React.MouseEvent, offerId: string, photoIds?: string[]) => {
    if (!db) return

    // 1. Logique de suppression Cloudinary (Prête pour activation avec API Secret)
    if (photoIds && photoIds.length > 0) {
      console.log(`[Cloudinary] Nettoyage requis pour les IDs: ${photoIds.join(', ')}`);
      // Note: La suppression réelle nécessite une signature générée avec l'API Secret.
    }

    // 2. Suppression Firestore
    const offerRef = doc(db, 'offres', offerId)
    deleteDocumentNonBlocking(offerRef)
    
    toast({
      title: "Sortie définitive !",
      description: "L'annonce a été retirée du terrain."
    })
  }

  const handleDeleteAccount = () => {
    if (!db || !user) return

    myOffers?.forEach((offer) => {
      const oRef = doc(db, 'offres', offer.id)
      deleteDocumentNonBlocking(oRef)
    })

    if (userRef) {
      deleteDocumentNonBlocking(userRef)
    }

    signOut(auth).then(() => {
      toast({
        variant: "destructive",
        title: "Hors-jeu !",
        description: "Vous avez quitté le stade définitivement."
      })
      router.push('/login')
    })
  }

  const handleInactiveFeature = (e: React.MouseEvent, featureName: string) => {
    e.preventDefault()
    e.stopPropagation()
    toast({
      variant: "warning",
      title: "Carton jaune !",
      description: `La section "${featureName}" est en cours de validation.`
    })
  }

  if (isUserLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
  if (!user) return null

  const profileData = {
    nom: profile?.nom || user.email?.split('@')[0] || 'Nouvelle Recrue',
    typeProfil: profile?.typeProfil || 'particulier',
    ville: profile?.ville || 'Inconnue',
    description: profile?.description || 'Passionné de football.',
    stats: {
      offres: sortedMyOffers.length,
      avis: 0,
      rating: 5.0
    },
    avatar: profile?.photoUrl || null
  }

  const currentType = profileTypes[profileData.typeProfil as keyof typeof profileTypes] || profileTypes.particulier

  const lawsOfGame = [
    { name: "Nos Causes", icon: Trophy },
    { name: "Politique de confidentialité", icon: Shield },
    { name: "Politique de cookies", icon: Cookie },
    { name: "Mentions légales", icon: FileText },
    { name: "Données personnelles", icon: Database },
    { name: "Conformité Stores", icon: Smartphone },
    { name: "Spécificité football", icon: Flag },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="relative h-48 w-full bg-gradient-to-b from-primary/20 to-transparent border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute top-6 right-6 flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="glass-morphism rounded-full border-white/10">
                <Flag className="w-5 h-5 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 rounded-3xl max-w-[90vw] sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                  <Flag className="w-5 h-5 text-primary" />
                  Lois du Jeu
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2 mt-4">
                {lawsOfGame.map((law) => (
                  <button
                    key={law.name}
                    onClick={(e) => handleInactiveFeature(e, law.name)}
                    className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5 hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <law.icon className="w-4 h-4 text-primary" />
                      <span className="text-[11px] font-black uppercase tracking-widest text-left">{law.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="glass-morphism rounded-full border-white/10 hover:bg-destructive/20 hover:text-destructive">
                <UserX className="w-5 h-5 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-white/10 rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tighter text-destructive">Carton Rouge !</AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Attention ! Votre profil et vos annonces seront supprimés définitivement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl font-black uppercase tracking-tighter text-xs">Rester</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-black uppercase tracking-tighter text-xs">Confirmer la sortie</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Link href="/profile/edit">
            <Button variant="ghost" size="icon" className="glass-morphism rounded-full border-white/10">
              <Settings className="w-5 h-5 text-primary" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="px-6 -mt-16 relative flex flex-col items-center text-center">
        <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-background bg-card shadow-2xl relative flex items-center justify-center">
          {profileData.avatar ? (
            <Image src={profileData.avatar} alt={profileData.nom} width={128} height={128} className="object-cover h-full w-full" unoptimized />
          ) : (
            <UserIcon className="w-12 h-12 text-muted-foreground" />
          )}
          <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-tl-xl border-t border-l border-background">
            <ShieldCheck className="w-4 h-4 text-black" />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col items-center gap-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">{profileData.nom}</h1>
          <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{profileData.ville}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 w-full gap-4 mt-8">
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center border border-white/5">
            <span className="text-2xl font-black italic text-primary">{profileData.stats.offres}</span>
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Passes</span>
          </div>
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center border border-white/5">
            <span className="text-2xl font-black italic text-primary">{profileData.stats.avis}</span>
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Avis</span>
          </div>
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center border border-white/5">
            <div className="flex items-center gap-1 text-primary">
              <span className="text-2xl font-black italic">{profileData.stats.rating}</span>
              <Star className="w-3 h-3 fill-primary" />
            </div>
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Niveau</span>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3 mt-8 pb-10">
          <Button 
            onClick={() => setShowMyOffers(!showMyOffers)}
            className={`w-full rounded-xl py-6 font-black uppercase tracking-widest text-xs h-12 italic ${showMyOffers ? 'bg-secondary text-white' : 'bg-primary text-black'}`}
          >
            {showMyOffers ? "Voir profil" : "Mes annonces"}
          </Button>

          {showMyOffers && (
            <div className="w-full mt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              {isMyOffersLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : sortedMyOffers.length > 0 ? (
                <div className="grid gap-4">
                  {sortedMyOffers.map((offer) => (
                    <div key={offer.id} className="relative group/item">
                      <div className="flex gap-4 p-3 bg-card rounded-2xl border border-white/5 items-center shadow-lg pr-24">
                        <Link href={`/offres/${offer.id}`} className="flex gap-4 items-center flex-grow overflow-hidden">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <Image src={offer.photos?.[0] || 'https://picsum.photos/seed/foot/100/100'} alt={offer.titre} fill className="object-cover" unoptimized />
                          </div>
                          <div className="flex flex-col text-left overflow-hidden">
                            <h4 className="font-bold text-sm truncate uppercase tracking-tighter">{offer.titre}</h4>
                            <span className="text-[9px] font-black text-primary italic uppercase">{offer.typeOffre} • {offer.prix}€</span>
                          </div>
                        </Link>

                        <div className="absolute right-3 flex gap-1.5 items-center">
                          <Button 
                            variant="ghost" size="icon" 
                            onClick={(e) => handleInactiveFeature(e, "Modification")}
                            className="h-10 w-10 text-primary hover:bg-primary/10 rounded-full bg-background/50"
                          >
                            <RefreshCcw className="w-5 h-5" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-full bg-background/50">
                                <ArrowDownToLine className="w-5 h-5 rotate-180" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-white/10 rounded-3xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tighter">Sortie définitive ?</AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl font-black uppercase tracking-tighter text-xs">Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={(e) => handleDeleteOffer(e as any, offer.id, offer.photoIds)} className="bg-destructive text-white rounded-xl font-black uppercase tracking-tighter text-xs">Confirmer</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-muted-foreground italic text-xs">Aucune annonce.</div>
              )}
            </div>
          )}

          {!showMyOffers && (
            <div className="flex flex-col gap-2">
              <Button variant="ghost" onClick={handleLogout} className="w-full text-accent hover:bg-accent/10 rounded-xl h-12 font-black uppercase tracking-widest text-xs">
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </Button>
              {user?.uid === ADMIN_UID && (
                <Link href="/admin" className="w-full mt-4">
                  <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary rounded-xl h-10 font-black uppercase tracking-widest text-[9px] opacity-50">
                    <Shield className="w-3.5 h-3.5 mr-2" />
                    Panel Arbitre
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
      <Navigation />
    </div>
  )
}
