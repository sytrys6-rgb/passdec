
"use client"

import { useEffect, useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, LogOut, ShieldCheck, MapPin, Star, Loader2, MapPin as MapPinIcon, ArrowDownToLine, User as UserIcon, RefreshCcw } from 'lucide-react'
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

const profileTypes = {
  particulier: { label: 'Footeux', complement: 'Particulier', emoji: '⚽' },
  club_foot: { label: 'Team', complement: 'Club de foot', emoji: '🏟️' },
  club_supporter: { label: 'Ultras', complement: 'Club de supporters', emoji: '🎺' },
  professionnel: { label: 'Pro', complement: 'Professionnel / Entreprise', emoji: '🏢' },
}

export default function ProfilePage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [showMyOffers, setShowMyOffers] = useState(false)

  // Redirection si non connecté
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  // On attend que l'utilisateur soit prêt avant tout
  const userRef = useMemoFirebase(() => {
    if (!db || !user || isUserLoading) return null
    return doc(db, 'users', user.uid)
  }, [db, user, isUserLoading])

  const { data: profile } = useDoc(userRef)

  // Chargement des offres de l'utilisateur
  const myOffersQuery = useMemoFirebase(() => {
    if (!db || isUserLoading || !user) return null
    return query(
      collection(db, 'offres'), 
      where('userId', '==', user.uid)
    )
  }, [db, isUserLoading, user])

  const { data: myOffers, isLoading: isMyOffersLoading } = useCollection(myOffersQuery)

  // Tri manuel côté client pour éviter le besoin d'index composite complexe au début
  const sortedMyOffers = useMemo(() => {
    if (!myOffers) return []
    return [...myOffers].sort((a, b) => {
      // On gère les timestamps potentiellement null pendant l'optimistic UI
      const timeA = a.createdAt?.seconds || Date.now() / 1000
      const timeB = b.createdAt?.seconds || Date.now() / 1000
      return timeB - timeA
    })
  }, [myOffers])

  const handleLogout = () => {
    signOut(auth)
  }

  const handleDeleteOffer = (e: React.MouseEvent, offerId: string) => {
    if (!db) return

    const offerRef = doc(db, 'offres', offerId)
    deleteDocumentNonBlocking(offerRef)
    
    toast({
      title: "Sortie définitive !",
      description: "L'annonce a été retirée du terrain."
    })
  }

  const handleEditInactive = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toast({
      title: "Changement en préparation...",
      description: "La modification d'annonce sera disponible lors de la prochaine saison (mise à jour)."
    })
  }

  const handleWarningInactive = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toast({
      title: "Carton Jaune !",
      description: "Le système d'avertissement et de fair-play sera déployé prochainement pour garantir un terrain propre."
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
    description: profile?.description || 'Passionné de football sur 100% Pass\' Déc\'.',
    stats: {
      offres: sortedMyOffers.length,
      avis: 0,
      rating: 5.0
    },
    avatar: profile?.photoUrl || null
  }

  const currentType = profileTypes[profileData.typeProfil as keyof typeof profileTypes] || profileTypes.particulier

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="relative h-48 w-full bg-gradient-to-b from-primary/20 to-transparent overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute top-6 right-6 flex gap-2">
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
            <Image src={profileData.avatar} alt={profileData.nom} width={128} height={128} className="object-cover h-full w-full" />
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
          <div className="flex flex-col items-center gap-1 mt-3">
            <Badge className="bg-primary text-black border-none font-black uppercase tracking-tighter italic px-4 gap-2">
              <span>{currentType.emoji}</span>
              <span>{currentType.label}</span>
            </Badge>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{currentType.complement}</span>
          </div>
        </div>

        <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-sm px-4">
          {profileData.description}
        </p>

        <div className="grid grid-cols-3 w-full gap-4 mt-8">
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center border border-white/5 group hover:border-primary/30 transition-colors">
            <span className="text-2xl font-black italic text-primary">{profileData.stats.offres}</span>
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Passes</span>
          </div>
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center border border-white/5 group hover:border-primary/30 transition-colors">
            <span className="text-2xl font-black italic text-primary">{profileData.stats.avis}</span>
            <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mt-1">Avis</span>
          </div>
          <div className="bg-card p-4 rounded-2xl flex flex-col items-center border border-white/5 group hover:border-primary/30 transition-colors">
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
            className={`w-full rounded-xl py-6 transition-all font-black uppercase tracking-widest text-xs h-12 italic ${showMyOffers ? 'bg-secondary text-white' : 'bg-primary text-black hover:bg-primary/90'}`}
          >
            {showMyOffers ? "Voir mon profil" : "Mes annonces"}
          </Button>

          {showMyOffers && (
            <div className="w-full mt-4 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-left text-sm font-black uppercase italic tracking-widest text-primary border-b border-primary/20 pb-1">Mes Passes en cours</h3>
              {isMyOffersLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : sortedMyOffers.length > 0 ? (
                <div className="grid gap-4">
                  {sortedMyOffers.map((offer) => (
                    <div key={offer.id} className="relative group/item">
                      <div className="flex gap-4 p-3 bg-card rounded-2xl border border-white/5 items-center group hover:border-primary/30 transition-all shadow-lg pr-36">
                        <Link 
                          href={`/offres/${offer.id}`}
                          className="flex gap-4 items-center flex-grow overflow-hidden"
                        >
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <Image src={offer.photos?.[0] || 'https://picsum.photos/seed/foot/100/100'} alt={offer.titre} fill className="object-cover" />
                          </div>
                          <div className="flex flex-col text-left overflow-hidden">
                            <span className="text-[9px] font-black uppercase text-primary italic">{offer.typeOffre}</span>
                            <h4 className="font-bold text-sm truncate uppercase tracking-tighter">{offer.titre}</h4>
                            <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-bold">
                              <MapPinIcon className="w-2.5 h-2.5" />
                              <span>{offer.ville}</span>
                              <span className="mx-1">•</span>
                              <span>{offer.prix > 0 ? `${offer.prix}€` : 'Gratuit'}</span>
                            </div>
                          </div>
                        </Link>

                        <div className="absolute right-3 flex gap-1.5 items-center">
                          {/* Carton Jaune (Avertissement) - Inactif */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleWarningInactive}
                            className="h-10 w-10 text-yellow-500 hover:bg-yellow-500/10 rounded-full bg-background/50 backdrop-blur-sm border border-yellow-500/20"
                            title="Signaler un problème (Carton Jaune)"
                          >
                            <div className="w-2.5 h-3.5 bg-yellow-500 rounded-[2px] border border-yellow-600 shadow-sm" />
                          </Button>

                          {/* Bouton Changement (Substitution / Edit) - Inactif */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleEditInactive}
                            className="h-10 w-10 text-primary hover:bg-primary/10 rounded-full bg-background/50 backdrop-blur-sm border border-primary/20"
                            title="Procéder au changement (Modifier)"
                          >
                            <RefreshCcw className="w-5 h-5" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-full bg-background/50 backdrop-blur-sm border border-destructive/20"
                                title="Sortie définitive (Supprimer)"
                              >
                                <ArrowDownToLine className="w-5 h-5 rotate-180" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-card border-white/10 rounded-3xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tighter">Sortie définitive ?</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                  Êtes-vous sûr de vouloir retirer cette annonce du terrain ? Elle disparaîtra également de l'accueil.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-xl font-black uppercase tracking-tighter text-xs">Annuler</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={(e) => handleDeleteOffer(e as any, offer.id)}
                                  className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-black uppercase tracking-tighter text-xs"
                                >
                                  Confirmer la sortie
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-muted-foreground italic text-xs">Aucune passe décisive enregistrée pour le moment.</div>
              )}
            </div>
          )}

          {!showMyOffers && (
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full text-accent hover:text-accent hover:bg-accent/10 rounded-xl h-12 font-black uppercase tracking-widest text-xs"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          )}
        </div>
      </div>

      <Navigation />
    </div>
  )
}
