
"use client"

import { useEffect, useMemo } from 'react'
import { Navigation } from '@/components/Navigation'
import { MessageCircle, User, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { useRouter } from 'next/navigation'
import { collection, query, where } from 'firebase/firestore'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * @fileOverview Liste des conversations de l'utilisateur.
 * Utilise Firestore pour récupérer les échanges en temps réel.
 * Le tri est effectué côté client pour éviter les erreurs d'index composite Firestore.
 */

export default function MessagesPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login')
    }
  }, [user, isUserLoading, router])

  // Récupération des conversations où l'utilisateur est participant
  // On retire l'orderBy pour éviter de bloquer si l'index n'est pas créé
  const convsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    )
  }, [db, user])

  const { data: rawConversations, isLoading: isConvsLoading } = useCollection(convsQuery)

  // Tri côté client par date du dernier message
  const sortedConversations = useMemo(() => {
    if (!rawConversations) return []
    return [...rawConversations].sort((a, b) => {
      const timeA = a.lastMessageAt?.seconds || 0
      const timeB = b.lastMessageAt?.seconds || 0
      return timeB - timeA
    })
  }, [rawConversations])

  if (isUserLoading || !user) return null

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-6">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Vestiaires</h1>
        <div className="h-1 w-12 bg-primary mt-1 rounded-full" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">
          Vos échanges tactiques (Temps réel)
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

            return (
              <Link 
                key={conv.id}
                href={`/messages/${otherId}`}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-white/5 hover:border-primary/20 transition-all group shadow-lg relative"
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
                
                <div className="flex-grow flex flex-col gap-0.5">
                  <div className="flex justify-between items-center">
                    <span className="font-black uppercase italic tracking-tighter text-sm">{otherName}</span>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase">{lastMsgDate}</span>
                  </div>
                  <p className={`text-xs line-clamp-1 mt-0.5 ${unreadCount > 0 ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
                    {conv.lastMessage || 'Démarrez la conversation...'}
                  </p>
                </div>
              </Link>
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
