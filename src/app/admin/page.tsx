
"use client"

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  useUser, useFirestore, useCollection, useMemoFirebase, 
  updateDocumentNonBlocking, deleteDocumentNonBlocking 
} from '@/firebase'
import { collection, query, where, getDoc, doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldAlert, Loader2, Eye, Trash2, CheckCircle, 
  ArrowLeft, Calendar, User, AlertCircle, History, ListFilter
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from '@/lib/utils'

const ADMIN_UID = "OvtBOwidg7dc4lHw5rR56yqLlIT2"

export default function AdminPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (!isUserLoading) {
      if (!user || user.uid !== ADMIN_UID) {
        router.push('/')
      } else {
        setIsAdmin(true)
      }
    }
  }, [user, isUserLoading, router])

  const pendingReportsQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null
    return query(
      collection(db, 'signalements'),
      where('statut', '==', 'en_attente')
    )
  }, [db, isAdmin])

  const historyReportsQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null
    return query(
      collection(db, 'signalements'),
      where('statut', 'in', ['traité', 'ignoré'])
    )
  }, [db, isAdmin])

  const { data: pendingReports, isLoading: isPendingLoading } = useCollection(pendingReportsQuery)
  const { data: historyReports, isLoading: isHistoryLoading } = useCollection(historyReportsQuery)

  const sortedPending = useMemo(() => {
    if (!pendingReports) return []
    return [...pendingReports].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [pendingReports])

  const sortedHistory = useMemo(() => {
    if (!historyReports) return []
    return [...historyReports].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
  }, [historyReports])

  const handleIgnoreReport = (reportId: string) => {
    if (!db) return
    const reportRef = doc(db, 'signalements', reportId)
    updateDocumentNonBlocking(reportRef, { statut: 'ignoré' })
    toast({ title: "Signalement ignoré" })
  }

  const handleDeleteOffer = async (reportId: string, offerId: string) => {
    if (!db) return
    
    // Récupérer l'annonce pour les IDs photo Cloudinary
    const offerRef = doc(db, 'offres', offerId)
    const offerSnap = await getDoc(offerRef)
    
    if (offerSnap.exists()) {
      const offerData = offerSnap.data()
      if (offerData.photoIds && offerData.photoIds.length > 0) {
        console.log(`[Cloudinary Admin] Nettoyage requis pour les IDs: ${offerData.photoIds.join(', ')}`);
        // Note: Suppression Cloudinary nécessite l'API Secret.
      }
    }

    const reportRef = doc(db, 'signalements', reportId)
    deleteDocumentNonBlocking(offerRef)
    updateDocumentNonBlocking(reportRef, { statut: 'traité' })
    
    toast({ 
      variant: "destructive",
      title: "Action RADICALE !",
      description: "Annonce et photos (IDs logués) retirées."
    })
  }

  if (isUserLoading || !isAdmin) {
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
              <Link href={`/offres/${report.offreId}`}><Eye className="w-4 h-4 mr-2" />Voir</Link>
            </Button>
            <Button variant="outline" onClick={() => handleIgnoreReport(report.id)} className="rounded-xl font-black uppercase italic text-[10px] h-11">
              <CheckCircle className="w-4 h-4 mr-2" />Ignorer
            </Button>
            <Button variant="destructive" onClick={() => handleDeleteOffer(report.id, report.offreId)} className="rounded-xl font-black uppercase italic text-[10px] h-11">
              <Trash2 className="w-4 h-4 mr-2" />Supprimer
            </Button>
          </div>
        )}
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
          <TabsList className="grid w-full grid-cols-2 bg-card border border-white/5 rounded-2xl h-14 p-1 mb-8">
            <TabsTrigger value="pending" className="rounded-xl font-black uppercase italic text-[10px] data-[state=active]:bg-primary">
              <ListFilter className="w-4 h-4 mr-2" /> En attente ({sortedPending.length})
            </TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl font-black uppercase italic text-[10px] data-[state=active]:bg-primary">
              <History className="w-4 h-4 mr-2" /> Historique ({sortedHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-0">
            {isPendingLoading ? <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div> :
              sortedPending.length > 0 ? <div className="grid gap-6">{sortedPending.map(r => <ReportCard key={r.id} report={r} />)}</div> :
              <p className="text-center py-20 text-muted-foreground uppercase font-black italic text-xs">Terrain propre !</p>}
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
