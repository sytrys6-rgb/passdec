
"use client"

import { useEffect, useMemo } from 'react'
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

export default function MessagesPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

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
    // Filtrer les conversations que l'utilisateur a supprimées (masquées)
    return [...rawConversations]
      .filter(conv => !conv.deletedBy?.includes(user.uid))
      .sort((a, b) => {
        const timeA = a.lastMessageAt?.seconds || 0
        const timeB = b.lastMessageAt?.seconds || 0
        return timeB - timeA
      })
  }, [rawConversations, user])

  const handleDeleteConversation = (e: React.MouseEvent, convId: string) => {
    e.preventDefault()
    e.stopPropagation()
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

      <div className="flex-grow flex flex-col px-6 gap-3 pb-32">
        {isConvsLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : sortedConversations.length > 0 ? (
          sortedConversations.map((conv) => {
            const otherId = conv.participants.find((id: string) => id !== user.uid)
            const otherName = conv.participantNames?.[otherId] || 'Recrue'
            const unreadCount = conv.unreadCount?.[user.uid] || 0
            const lastMsgDate = conv.lastMessageAt?.seconds 
              ? formatDistanceToNow(new Date(conv.lastMessageAt.seconds * 1000), { addSuffix: true, locale: fr })
              : ''
            
            const targetOfferId = conv.offerId || 'default'

            return (
              <div key={conv.id} className="relative group">
                <Link 
                  href={`/messages/${otherId}/${targetOfferId}`}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-white/5 hover:border-primary/20 transition-all shadow-lg relative pr-14"
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-muted border-2 border-transparent group-hover:border-primary/50 transition-colors flex items-center justify-center">
                      <User className="w-6 h-6 text-muted-foreground" />
                    </div>
                    {unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary flex items-center justify-center rounded-full border-2 border-card shadow-lg">
                        <span className="text-[10px] font-black text-black">{unreadCount}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-grow flex flex-col gap-0.5 overflow-hidden text-left">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-black uppercase italic tracking-tighter text-sm truncate max-w-[150px]">{otherName}</span>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase shrink-0">{lastMsgDate}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 mb-1.5 bg-primary/5 px-2 py-1 rounded-md w-fit max-w-full border border-primary/10">
                      <Trophy className="w-3 h-3 text-primary shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary truncate">
                        {conv.offerTitle || 'Discussion tactique'}
                      </span>
                    </div>

                    <p className={`text-xs line-clamp-1 ${unreadCount > 0 ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
                      {conv.lastMessage || 'Démarrez la conversation...'}
                    </p>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
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
