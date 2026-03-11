
"use client"

import { useEffect, useState, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Settings, LogOut, ShieldCheck, MapPin, Star, Loader2, 
  Flag, ChevronRight, Shield, Cookie, FileText, Database, 
  Smartphone, Trophy, UserX, User, Trash2, Download, 
  Share, Info, Heart
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, useCollection, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase'
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

const LOGO_URL = "https://res.cloudinary.com/dfincejqz/image/upload/v1772489336/logo_fec345.jpg"

export default function ProfilePage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [showMyOffers, setShowMyOffers] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const isIOSDevice = [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod'
    ].includes(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document);
    
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    if (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true) {
      setIsInstalled(true)
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Installation manuelle",
        description: "Utilisez le menu de votre navigateur pour 'Installer l'application' ou 'Ajouter à l'écran d'accueil'."
      });
      return;
    }
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setIsInstalled(true)
      toast({
        title: "Transfert réussi !",
        description: "L'application est en cours d'installation sur votre appareil."
      })
    }
  }

  const userRef = useMemoFirebase(() => {
    if (!db || !user || isUserLoading) return null
    return doc(db, 'users', user.uid)
  }, [db, user, isUserLoading])

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef)

  useEffect(() => {
    if (user?.email === 'sytrys6@gmail.com' && profile && profile.role !== 'admin' && userRef) {
      updateDocumentNonBlocking(userRef, { role: 'admin' });
      toast({
        title: "Accès Arbitre Activé",
        description: "Votre compte sytrys6@gmail.com a été promu Administrateur."
      });
    }
  }, [user, profile, userRef, toast]);

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

  const handleLogout = async () => {
    try {
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      await signOut(auth)
      toast({
        title: "Sortie du vestiaire",
        description: "Vous avez été déconnecté avec succès."
      })
      router.push('/login')
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Erreur tactique",
        description: "Impossible de se déconnecter."
      })
    }
  }

  const handleDeleteOffer = async (e: React.MouseEvent, offerId: string) => {
    if (!db) return
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
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
    signOut(auth).then(() => {
      toast({
        variant: "destructive",
        title: "Hors-jeu !",
        description: "Vous avez quitté le stade définitivement."
      })
      router.push('/login')
    })
  }

  if (isUserLoading || isProfileLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  )
  if (!user) return null

  const profileData = {
    nom: profile?.nom || user.email?.split('@')[0] || 'Nouvelle Recrue',
    role: profile?.role || 'user',
    typeProfil: profile?.typeProfil || 'particulier',
    ville: profile?.ville || 'Inconnue',
    description: profile?.description || 'Cette recrue n\'a pas encore rempli son palmarès.',
    clubPrefere: profile?.clubPrefere || '',
    stats: {
      offres: sortedMyOffers.length,
      avis: 0,
      rating: 5.0
    },
    avatar: profile?.photoUrl || null
  }

  const currentType = profileTypes[profileData.typeProfil as keyof typeof profileTypes] || profileTypes.particulier

  const lawsOfGame = [
    { name: "Nos Causes", icon: Trophy, path: "/legal/causes" },
    { name: "Confidentialité", icon: Shield, path: "/legal/confidentialite" },
    { name: "Cookies", icon: Cookie, path: "/legal/cookies" },
    { name: "Mentions légales", icon: FileText, path: "/legal/mentions-legales" },
    { name: "Données personnelles", icon: Database, path: "/legal/donnees-personnelles" },
    { name: "Conformité Stores", icon: Smartphone, path: "/legal/stores" },
    { name: "Spécificité football", icon: Flag, path: "/legal/football" },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="relative h-48 w-full bg-gradient-to-b from-primary/20 to-transparent border-b border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        <div className="absolute top-6 left-6 opacity-80">
           <Image 
            src={LOGO_URL}
            alt="Logo"
            width={100}
            height={40}
            unoptimized={true}
            className="object-contain"
          />
        </div>

        <div className="absolute top-6 right-6 flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="glass-morphism rounded-full border-white/10">
                <Flag className="w-5 h-5 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-white/10 rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                  <Flag className="w-5 h-5 text-primary" />
                  Lois du Jeu
                </DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-2 mt-4">
                {lawsOfGame.map((law) => (
                  <Link
                    key={law.name}
                    href={law.path}
                    className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-white/5 hover:border-primary/30 group"
                  >
                    <div className="flex items-center gap-3">
                      <law.icon className="w-4 h-4 text-primary" />
                      <span className="text-[11px] font-black uppercase tracking-widest">{law.name}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                  </Link>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="glass-morphism rounded-full border-white/10">
                <UserX className="w-5 h-5 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-white/10 rounded-3xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tighter text-destructive">Carton Rouge !</AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                  Votre profil et vos annonces seront supprimés définitivement.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl font-black uppercase tracking-tighter text-xs">Rester</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-white rounded-xl font-black uppercase tracking-tighter text-xs">Confirmer</AlertDialogAction>
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
            <User className="w-12 h-12 text-muted-foreground" />
          )}
          <div className="absolute bottom-0 right-0 p-1 bg-primary rounded-tl-xl">
            <ShieldCheck className="w-4 h-4 text-black" />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col items-center gap-1">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">{profileData.nom}</h1>
          <div className="flex gap-2 items-center">
            <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase italic tracking-widest px-3 py-1 bg-primary/5">
               {currentType.emoji} {currentType.label}
            </Badge>
            {profileData.role === 'admin' && <Badge className="bg-destructive text-white border-none font-black uppercase italic tracking-widest text-[8px] px-2 py-1">Arbitre V.A.R</Badge>}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground mt-2">
            <MapPin className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{profileData.ville}</span>
          </div>
        </div>

        {profileData.clubPrefere && (
          <div className="mt-6 w-full animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Heart className="w-4 h-4 text-primary fill-primary/20" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Club de cœur</span>
                  <span className="text-sm font-black italic uppercase tracking-tighter text-primary">{profileData.clubPrefere}</span>
                </div>
              </div>
              <Trophy className="w-5 h-5 text-primary opacity-20" />
            </div>
          </div>
        )}

        <div className="w-full mt-6 text-left">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 ml-1 italic">Palmarès / Bio</h2>
          <div className="bg-card/40 border border-white/5 rounded-2xl p-4">
            <p className="text-xs font-medium text-muted-foreground leading-relaxed italic">
              "{profileData.description}"
            </p>
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

        <div className="w-full flex flex-col gap-3 mt-8 pb-32">
          <div className="bg-card/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2 mb-1">
              <Smartphone className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Tactique Mobile</span>
            </div>
            
            {isInstalled ? (
              <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-[11px] font-black uppercase tracking-tighter text-primary">Application installée au stade</span>
              </div>
            ) : deferredPrompt ? (
              <Button 
                onClick={handleInstallClick}
                className="w-full bg-primary text-black rounded-xl h-12 font-black uppercase italic tracking-widest text-sm shadow-xl animate-pulse"
              >
                <Download className="w-4 h-4 mr-2" />
                Installer maintenant
              </Button>
            ) : isIOS ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-primary text-black rounded-xl h-12 font-black uppercase italic tracking-widest text-sm shadow-xl">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Ajouter à l'écran d'accueil
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-white/10 rounded-3xl max-w-[90vw]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      Guide d'entrée
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-6 py-4">
                    <div className="flex flex-col items-center text-center gap-4">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Share className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wide leading-relaxed">
                        Pour installer l'app sur votre iPhone :
                      </p>
                    </div>
                    <div className="space-y-4 text-left">
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center font-black text-xs shrink-0">1</div>
                        <p className="text-[11px] font-medium leading-relaxed">Appuyez sur le bouton <span className="font-black text-primary">Partager</span> en bas de votre navigateur Safari.</p>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center font-black text-xs shrink-0">2</div>
                        <p className="text-[11px] font-medium leading-relaxed">Faites défiler vers le bas et sélectionnez <span className="font-black text-primary italic">"Sur l'écran d'accueil"</span>.</p>
                      </div>
                      <div className="flex gap-4 items-start">
                        <div className="w-6 h-6 rounded-full bg-primary text-black flex items-center justify-center font-black text-xs shrink-0">3</div>
                        <p className="text-[11px] font-medium leading-relaxed">Appuyez sur <span className="font-black text-primary">Ajouter</span> en haut à droite pour finaliser le transfert.</p>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              <div className="flex flex-col gap-3">
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "100% Pass'Déc'",
                        text: "Rejoins le stade Pass'Déc' !",
                        url: window.location.origin
                      });
                    } else {
                      toast({ title: "Copie le lien", description: window.location.origin });
                    }
                  }}
                  className="w-full bg-primary/10 text-primary border border-primary/20 rounded-xl h-12 font-black uppercase italic tracking-widest text-sm"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Partager le stade
                </Button>
                <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-xl border border-white/5">
                  <Info className="w-4 h-4 text-muted-foreground shrink-0" />
                  <p className="text-[9px] font-bold text-muted-foreground uppercase leading-relaxed text-left">
                    Ouvrez ce site dans Chrome ou Safari pour accéder aux options d'installation.
                  </p>
                </div>
              </div>
            )}
          </div>

          {(profileData.role === 'admin' || user?.email === 'sytrys6@gmail.com') && (
            <Link href="/admin" className="w-full">
              <Button className="w-full bg-secondary text-white rounded-xl h-14 font-black uppercase italic tracking-widest text-base shadow-xl border-2 border-white/10 hover:bg-secondary/90 flex items-center justify-center gap-3">
                <Shield className="w-6 h-6 animate-pulse" />
                V.A.R • Panel Arbitre
              </Button>
            </Link>
          )}

          <Button 
            onClick={() => setShowMyOffers(!showMyOffers)}
            className={`w-full rounded-xl py-6 font-black uppercase tracking-widest text-xs h-12 italic ${showMyOffers ? 'bg-muted text-muted-foreground' : 'bg-primary text-black'}`}
          >
            {showMyOffers ? "Voir mon profil" : "Gérer mes annonces"}
          </Button>

          {showMyOffers && (
            <div className="w-full mt-4 space-y-4">
              {isMyOffersLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
              ) : sortedMyOffers.length > 0 ? (
                <div className="grid gap-4">
                  {sortedMyOffers.map((offer) => (
                    <div key={offer.id} className="relative">
                      <div className="flex gap-4 p-3 bg-card rounded-2xl border border-white/5 items-center shadow-lg pr-24">
                        <Link href={`/offres/details/?id=${offer.id}`} className="flex gap-4 items-center flex-grow overflow-hidden text-left">
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                            <Image src={offer.photos?.[0] || 'https://picsum.photos/seed/foot/100/100'} alt={offer.titre} fill className="object-cover" unoptimized />
                          </div>
                          <div className="flex flex-col overflow-hidden">
                            <h4 className="font-bold text-sm truncate uppercase tracking-tighter">{offer.titre}</h4>
                            <span className="text-[9px] font-black text-primary italic uppercase">{offer.typeOffre} • {offer.prix}€</span>
                          </div>
                        </Link>
                        <div className="absolute right-3">
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => handleDeleteOffer(e as any, offer.id)}>
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-muted-foreground italic text-xs">Aucune annonce sur le terrain.</div>
              )}
            </div>
          )}

          <div className="w-full pt-4 mt-2 border-t border-white/5">
            <Button 
              variant="ghost" 
              onClick={handleLogout} 
              className="w-full text-destructive hover:bg-destructive/10 rounded-xl h-12 font-black uppercase tracking-widest text-xs"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Quitter le stade (Déconnexion)
            </Button>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  )
}
