
"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  useUser, useFirestore, useCollection, useMemoFirebase, 
  updateDocumentNonBlocking, deleteDocumentNonBlocking 
} from '@/firebase'
import { collection, query, where, orderBy, doc } from 'firebase/firestore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShieldAlert, Loader2, Eye, Trash2, CheckCircle, 
  ArrowLeft, Calendar, User, AlertCircle 
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

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

  const reportsQuery = useMemoFirebase(() => {
    if (!db || !isAdmin) return null
    return query(
      collection(db, 'signalements'),
      where('statut', '==', 'en_attente'),
      orderBy('createdAt', 'desc')
    )
  }, [db, isAdmin])

  const { data: reports, isLoading: isReportsLoading } = useCollection(reportsQuery)

  const handleIgnoreReport = (reportId: string) => {
    if (!db) return
    const reportRef = doc(db, 'signalements', reportId)
    updateDocumentNonBlocking(reportRef, { statut: 'ignoré' })
    toast({ title: "Signalement ignoré" })
  }

  const handleDeleteOffer = (reportId: string, offerId: string) => {
    if (!db) return
    const offerRef = doc(db, 'offres', offerId)
    const reportRef = doc(db, 'signalements', reportId)
    
    // Supprimer l'annonce
    deleteDocumentNonBlocking(offerRef)
    // Marquer le signalement comme traité
    updateDocumentNonBlocking(reportRef, { statut: 'traité' })
    
    toast({ 
      variant: "destructive",
      title: "Action RADICALE !",
      description: "Annonce supprimée du stade."
    })
  }

  if (isUserLoading || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-6">
      <header className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/')} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-primary" />
            V.A.R Admin
          </h1>
        </div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-14">
          Gestion des signalements et arbitrage
        </p>
      </header>

      <div className="flex-grow pb-20">
        {isReportsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports && reports.length > 0 ? (
          <div className="grid gap-6">
            {reports.map((report) => (
              <div 
                key={report.id} 
                className="bg-card rounded-3xl p-6 border border-white/5 shadow-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                
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
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Signalisé par : {report.signaleParNom}</span>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                      "{report.details || "Pas de détails supplémentaires fournis."}"
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <Button 
                      asChild
                      variant="outline"
                      className="rounded-xl font-black uppercase italic text-[10px] tracking-widest h-11 border-white/10"
                    >
                      <Link href={`/offres/${report.offreId}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Voir
                      </Link>
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleIgnoreReport(report.id)}
                      className="rounded-xl font-black uppercase italic text-[10px] tracking-widest h-11 border-white/10 hover:bg-muted"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Ignorer
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => handleDeleteOffer(report.id, report.offreId)}
                      className="rounded-xl font-black uppercase italic text-[10px] tracking-widest h-11 shadow-lg shadow-destructive/20"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <div className="p-6 rounded-full bg-primary/5">
              <ShieldAlert className="w-12 h-12 text-primary/20" />
            </div>
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest italic">Aucun litige en cours</p>
              <p className="text-[10px] font-bold uppercase mt-2 tracking-widest">Le terrain est propre coach !</p>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-6 right-6">
        <div className="bg-primary/10 backdrop-blur-md border border-primary/20 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-primary" />
          <p className="text-[9px] font-bold uppercase tracking-wider leading-relaxed">
            Espace sécurisé : Toutes vos actions sont définitives pour l'expérience des utilisateurs.
          </p>
        </div>
      </div>
    </div>
  )
}
