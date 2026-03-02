
"use client"

import { useEffect, useMemo, useState } from 'react'
import { Navigation } from '@/components/Navigation'
import { MessageCircle, User, Loader2, Trophy, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useUser, useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase'
import { useRouter } from 'next/navigation'
import { collection, query, where, doc, arrayUnion } from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
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

/**
 * Icône de sifflet personnalisée (SVG)
 */
const WhistleIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={cn("animate-bounce", className)}
  >
    <path d="M18 7H6a3 3 0 0 0-3 3v4a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-4a3 3 0 0 0-3-3z" />
    <path d="M9 7V4h6v3" />
    <circle cx="11" cy="12" r="1.5" />
    <path d="M21 12h2" />
  </svg>
)

export default function MessagesPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  const convsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    )
  }, [db, user])

  const { data: rawConversations, isLoading: isConvsLoading } = useCollection(convsQuery)

  const sortedConversations = useMemo(() => {
    if (!rawConversations || !user) return []
    return [...rawConversations]
      .filter(conv => !conv.deletedBy?.includes(user.uid))
      .sort((a, b) => {
        const timeA = a.lastMessageAt?.seconds || 0
        const timeB = b.lastMessageAt?.seconds || 0
        return timeB - timeA
      })
  }, [rawConversations, user])

  const handleDeleteConversation = (convId: string) => {
    if (!db || !user) return

    const convRef = doc(db, 'conversations', convId)
    updateDocumentNonBlocking(convRef, {
      deletedBy: arrayUnion(user.uid)
    })

    toast({
      title: "Vestiaire nettoyé",
      description: "La conversation a été retirée de votre liste."
    })
  }

  if (isUserLoading || !user) return null

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-6">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Vestiaires</h1>
        <div className="h-1 w-12 bg-primary mt-1 rounded-full" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
          Vos échanges tactiques par annonce
        </p>
      </header>

      <div className="flex-grow flex flex-col px-6 gap-4 pb-32">
        {isConvsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sortedConversations.length > 0 ? (
          sortedConversations.map((conv) => {
            const otherId = conv.participants.find((id: string) => id !== user.uid)
            const otherName = conv.participantNames?.[otherId] || 'Recrue'
            const unreadCount = conv.unreadCount?.[user.uid] || 0
            const lastTime = conv.lastMessageAt?.seconds || (Date.now() / 1000)
            const isDelayed = unreadCount > 0 && (now / 1000 - lastTime) > 60

            const lastMsgDate = conv.lastMessageAt?.seconds 
              ? formatDistanceToNow(new Date(conv.lastMessageAt.seconds * 1000), { addSuffix: true, locale: fr })
              : ''
            
            const targetOfferId = conv.offerId || 'default'

            return (
              <div key={conv.id} className="relative group">
                <Link 
                  href={`/messages/${otherId}/${targetOfferId}`}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl bg-card border transition-all shadow-xl relative pr-14",
                    unreadCount > 0 
                      ? isDelayed 
                        ? "border-destructive bg-destructive/10 shadow-destructive/20 border-2" 
                        : "border-primary bg-primary/10 shadow-primary/20 border-2"
                      : "border-white/5 hover:border-primary/20"
                  )}
                >
                  <div className="relative">
                    <div className={cn(
                      "w-14 h-14 rounded-full overflow-hidden bg-muted border-2 flex items-center justify-center transition-colors",
                      unreadCount > 0 
                        ? isDelayed ? "border-destructive" : "border-primary" 
                        : "border-transparent group-hover:border-primary/50"
                    )}>
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    {unreadCount > 0 && (
                      <div className={cn(
                        "absolute -top-1 -right-1 w-6 h-6 flex items-center justify-center rounded-full border-2 border-card shadow-lg z-10",
                        isDelayed ? "bg-destructive animate-bounce" : "bg-primary"
                      )}>
                        <span className="text-[10px] font-black text-black italic">{unreadCount}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow flex flex-col gap-0.5 overflow-hidden text-left">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className={cn(
                          "font-black uppercase italic tracking-tighter text-sm truncate max-w-[150px]",
                          unreadCount > 0 
                            ? isDelayed ? "text-destructive" : "text-primary" 
                            : "text-muted-foreground"
                        )}>{otherName}</span>
                        {unreadCount > 0 && (
                          <WhistleIcon className={cn("w-4 h-4 shrink-0", isDelayed ? "text-destructive" : "text-primary")} />
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase shrink-0">{lastMsgDate}</span>
                    </div>
                    
                    <div className={cn(
                      "flex items-center gap-1.5 mb-1.5 px-2 py-1 rounded-md w-fit max-w-full border transition-colors shadow-sm",
                      unreadCount > 0 
                        ? isDelayed ? "bg-destructive/20 border-destructive/40" : "bg-primary/20 border-primary/40"
                        : "bg-white/5 border-white/5"
                    )}>
                      <Trophy className={cn("w-3 h-3 shrink-0", unreadCount > 0 ? isDelayed ? "text-destructive" : "text-primary" : "text-muted-foreground")} />
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest truncate",
                        unreadCount > 0 ? isDelayed ? "text-destructive" : "text-primary" : "text-muted-foreground"
                      )}>
                        {conv.offerTitle || 'Discussion tactique'}
                      </span>
                    </div>

                    <p className={cn(
                      "text-xs line-clamp-1",
                      unreadCount > 0 ? "text-foreground font-black italic" : "text-muted-foreground font-medium"
                    )}>
                      {conv.lastMessage || 'Démarrez la conversation...'}
                    </p>
                  </div>
                </Link>

                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Sortie définitive (Supprimer)"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-card border-white/10 rounded-3xl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-black italic uppercase tracking-tighter">Sortie définitive ?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                          Voulez-vous retirer cette conversation de votre vestiaire ? L'autre joueur pourra toujours voir l'historique de son côté.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl font-black uppercase tracking-tighter text-xs">Annuler</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteConversation(conv.id)}
                          className="bg-destructive text-white hover:bg-destructive/90 rounded-xl font-black uppercase tracking-tighter text-xs"
                        >
                          Confirmer la sortie
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <MessageCircle className="w-12 h-12 text-primary/10" />
            <div className="text-center">
              <p className="text-sm font-black uppercase tracking-widest italic">Vestiaire vide</p>
              <p className="text-[10px] font-bold mt-2">Contactez un joueur sur une annonce pour discuter.</p>
            </div>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}
