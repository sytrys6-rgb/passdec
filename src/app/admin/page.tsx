
"use client"

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  useUser, useFirestore, useCollection, useDoc, useMemoFirebase, 
  updateDocumentNonBlocking, deleteDocumentNonBlocking 
} from '@/firebase'
import { collection, query, where, getDocs, doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldAlert, Loader2, Eye, Trash2, CheckCircle, 
  ArrowLeft, Calendar, User, History, ListFilter, Users, Ban, Unlock, Trophy
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import Image from 'next/image'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

export default function AdminPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false)

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, 'users', user.uid)
  }, [db, user])

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef)

  // Accès prioritaire pour le propriétaire sytrys6@gmail.com
  useEffect(() => {
    if (!isUserLoading) {
      if (user?.email === 'sytrys6@gmail.com') {
        setIsAdminAuthorized(true)
        return
      }
      
      if (!isProfileLoading) {
        if (!user || profile?.role !== 'admin') {
          router.push('/')
        } else {
          setIsAdminAuthorized(true)
        }
      }
    }
  }, [user, profile, isUserLoading, isProfileLoading, router])

  const pendingReportsQuery = useMemoFirebase(() => {
    if (!db || !isAdminAuthorized) return null
    return query(
      collection(db, 'signalements'),
      where('statut', '==', 'en_attente')
    )
  }, [db, isAdminAuthorized])

  const historyReportsQuery = useMemoFirebase(() => {
    if (!db || !isAdminAuthorized) return null
    return query(
      collection(db, 'signalements'),
      where('statut', 'in', ['traité', 'ignoré'])
    )
  }, [db, isAdminAuthorized])

  const allUsersQuery = useMemoFirebase(() => {
    if (!db || !isAdminAuthorized) return null
    return collection(db, 'users')
  }, [db, isAdminAuthorized])

  const allOffersQuery = useMemoFirebase(() => {
    if (!db || !isAdminAuthorized) return null
    return collection(db, 'offres')
  }, [db, isAdminAuthorized])

  const { data: pendingReports, isLoading: isPendingLoading } = useCollection(pendingReportsQuery)
  const { data: historyReports, isLoading: isHistoryLoading } = useCollection(historyReportsQuery)
  const { data: users, isLoading: isUsersLoading } = useCollection(allUsersQuery)
  const { data: allOffers, isLoading: isAllOffersLoading } = useCollection(allOffersQuery)

  const sortedPending = useMemo(() => {
    if (!pendingReports) return []
    return [...pendingReports].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [pendingReports])

  const sortedHistory = useMemo(() => {
    if (!historyReports) return []
    return [...historyReports].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [historyReports])

  const sortedUsers = useMemo(() => {
    if (!users) return []
    return [...users].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [users])

  const sortedOffers = useMemo(() => {
    if (!allOffers) return []
    return [...allOffers].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [allOffers])

  const handleIgnoreReport = (reportId: string) => {
    if (!db) return
    const reportRef = doc(db, 'signalements', reportId)
    updateDocumentNonBlocking(reportRef, { statut: 'ignoré' })
    toast({ title: "Signalement ignoré" })
  }

  const handleDeleteOffer = async (offerId: string, reportId?: string) => {
    if (!db) return
    const offerRef = doc(db, 'offres', offerId)
    deleteDocumentNonBlocking(offerRef)
    
    if (reportId) {
      const reportRef = doc(db, 'signalements', reportId)
      updateDocumentNonBlocking(reportRef, { statut: 'traité' })
    }
    
    toast({ 
      variant: "destructive",
      title: "Arbitrage effectué",
      description: "L'annonce a été retirée du terrain."
    })
  }

  const handleToggleBlockUser = (userId: string, currentlyBlocked: boolean) => {
    if (!db || !isAdminAuthorized) return
    const targetUserRef = doc(db, 'users', userId)
    updateDocumentNonBlocking(targetUserRef, { isBlocked: !currentlyBlocked })
    toast({ 
      title: currentlyBlocked ? "Joueur débloqué" : "Joueur suspendu",
      description: currentlyBlocked ? "Il peut de nouveau entrer sur le terrain." : "Son accès est désormais interdit."
    })
  }

  const handleDeleteUserPermanently = async (userId: string) => {
    if (!db || !isAdminAuthorized) return

    try {
      const offersQuery = query(collection(db, 'offres'), where('userId', '==', userId))
      const offersSnap = await getDocs(offersQuery)
      offersSnap.forEach(d => deleteDocumentNonBlocking(d.ref))

      const convsQuery = query(collection(db, 'conversations'), where('participants', 'array-contains', userId))
      const convsSnap = await getDocs(convsQuery)
      convsSnap.forEach(d => deleteDocumentNonBlocking(d.ref))

      const targetUserRef = doc(db, 'users', userId)
      deleteDocumentNonBlocking(targetUserRef)

      toast({
        variant: "destructive",
        title: "Exclusion Définitive",
        description: "Le joueur et toutes ses données ont été effacés du stade."
      })
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Erreur d'arbitrage",
        description: "Impossible de finaliser l'exclusion."
      })
    }
  }

  if (isUserLoading || isProfileLoading || !isAdminAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const ReportCard = ({ report, isHistory = false }: { report: any, isHistory?: boolean }) => (
    <div className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden">
      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <Badge className="w-fit bg-destructive/10 text-destructive border-destructive/20 font-black uppercase italic tracking-widest text-[9px] mb-1">
              {report.raison}
            </Badge>
            <h3 className="text-lg font-black uppercase italic tracking-tighter">
              {report.offreTitre}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest">
              {report.createdAt?.seconds ? format(new Date(report.createdAt.seconds * 1000), 'dd MMM HH:mm', { locale: fr }) : '...'}
            </span>
          </div>
        </div>

        <div className="bg-background/50 rounded-2xl p-4 border border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest mb-1 block">Signalisé par : {report.signaleParNom}</span>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            "{report.details || "Pas de détails."}"
          </p>
        </div>

        {!isHistory && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            <Button asChild variant="outline" className="rounded-xl font-black uppercase italic text-[10px] h-11">
              <Link href={`/offres/details/?id=${report.offreId}`}><Eye className="w-4 h-4 mr-2" />Voir</Link>
            </Button>
            <Button variant="outline" onClick={() => handleIgnoreReport(report.id)} className="rounded-xl font-black uppercase italic text-[10px] h-11">
              <CheckCircle className="w-4 h-4 mr-2" />Ignorer
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteOffer(report.offreId, report.id)} className="rounded-xl font-black uppercase italic text-[10px] h-11">
              <Trash2 className="w-4 h-4 mr-2" />Supprimer
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  const UserRow = ({ profile: rowProfile }: { profile: any }) => {
    const isBlocked = rowProfile.isBlocked === true
    const regDate = rowProfile.createdAt?.seconds 
      ? format(new Date(rowProfile.createdAt.seconds * 1000), 'dd/MM/yyyy', { locale: fr }) 
      : 'Inconnue'

    return (
      <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-white/5 mb-3 gap-4">
        <div className="flex items-center gap-4 flex-grow overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-primary/20 overflow-hidden relative shrink-0">
            {rowProfile.photoUrl ? (
              <Image src={rowProfile.photoUrl} alt={rowProfile.nom} fill className="object-cover" unoptimized />
            ) : (
              <User className="w-6 h-6 text-muted-foreground" />
            )}
            {isBlocked && (
              <div className="absolute inset-0 bg-destructive/40 flex items-center justify-center">
                <Ban className="w-6 h-6 text-white" />
              </div>
            )}
          </div>
          <div className="flex flex-col overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="font-black uppercase italic tracking-tighter text-sm truncate">{rowProfile.nom}</span>
              {isBlocked && <Badge className="bg-destructive text-[8px] h-4 font-black px-1.5 uppercase italic">Suspendu</Badge>}
              {rowProfile.role === 'admin' && <Badge className="bg-primary text-black text-[8px] h-4 font-black px-1.5 uppercase italic">Arbitre</Badge>}
            </div>
            <span className="text-[9px] font-bold uppercase text-primary tracking-widest">{rowProfile.typeProfil} • Inscrit le {regDate}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {rowProfile.id !== user?.uid && (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => handleToggleBlockUser(rowProfile.id, isBlocked)}
                className={isBlocked ? "text-primary border-primary/20" : "text-warning border-warning/20"}
              >
                {isBlocked ? <Unlock className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-white/10 rounded-3xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tighter text-destructive">Sortie Définitive ?</AlertDialogTitle>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl font-black uppercase tracking-tighter text-[10px]">Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteUserPermanently(rowProfile.id)} className="bg-destructive text-white rounded-xl font-black uppercase tracking-tighter text-[10px]">Confirmer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    )
  }

  const OfferRow = ({ offer }: { offer: any }) => (
    <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-white/5 mb-3 gap-4">
      <div className="flex items-center gap-4 flex-grow overflow-hidden">
        <div className="w-12 h-12 rounded-xl bg-muted overflow-hidden relative shrink-0">
          {offer.photos?.[0] ? (
            <Image src={offer.photos[0]} alt={offer.titre} fill className="object-cover" unoptimized />
          ) : (
            <Trophy className="w-6 h-6 text-muted-foreground m-3" />
          )}
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-black uppercase italic tracking-tighter text-sm truncate">{offer.titre}</span>
          <span className="text-[9px] font-bold uppercase text-primary tracking-widest">{offer.userNom} • {offer.ville}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button asChild variant="outline" size="icon" className="text-muted-foreground">
          <Link href={`/offres/details/?id=${offer.id}`}><Eye className="w-4 h-4" /></Link>
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteOffer(offer.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      <header className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full"><ArrowLeft className="w-6 h-6" /></Button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary" /> V.A.R Admin
          </h1>
        </div>
      </header>

      <div className="flex-grow pb-24">
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-card border border-white/5 rounded-2xl h-14 p-1 mb-8">
            <TabsTrigger value="pending" className="rounded-xl font-black uppercase italic text-[8px] data-[state=active]:bg-primary">
              Alertes ({sortedPending.length})
            </TabsTrigger>
            <TabsTrigger value="offers" className="rounded-xl font-black uppercase italic text-[8px] data-[state=active]:bg-primary">
              Terrain ({sortedOffers.length})
            </TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl font-black uppercase italic text-[8px] data-[state=active]:bg-primary">
              Joueurs ({sortedUsers.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl font-black uppercase italic text-[8px] data-[state=active]:bg-primary">
              Archives
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-0">
            {isPendingLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> :
              sortedPending.length > 0 ? <div className="grid gap-6">{sortedPending.map(r => <ReportCard key={r.id} report={r} />)}</div> :
              <p className="text-center py-20 text-muted-foreground uppercase font-black italic text-xs">Terrain propre !</p>}
          </TabsContent>

          <TabsContent value="offers" className="mt-0">
            {isAllOffersLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> :
              sortedOffers.length > 0 ? <div>{sortedOffers.map(o => <OfferRow key={o.id} offer={o} />)}</div> :
              <p className="text-center py-20 text-muted-foreground uppercase font-black italic text-xs">Aucune annonce.</p>}
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            {isUsersLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> :
              sortedUsers.length > 0 ? <div>{sortedUsers.map(u => <UserRow key={u.id} profile={u} />)}</div> :
              <p className="text-center py-20 text-muted-foreground uppercase font-black italic text-xs">Aucun joueur.</p>}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            {isHistoryLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> :
              sortedHistory.length > 0 ? <div className="grid gap-6">{sortedHistory.map(r => <ReportCard key={r.id} report={r} isHistory />)}</div> :
              <p className="text-center py-20 text-muted-foreground uppercase font-black italic text-xs">Aucun historique.</p>}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
