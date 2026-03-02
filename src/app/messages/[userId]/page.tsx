
"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Send, User, Loader2 } from 'lucide-react'
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase'
import { doc, collection, query, orderBy, serverTimestamp, limit } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

/**
 * @fileOverview Page de chat privée entre deux utilisateurs.
 * Gère l'envoi et la réception de messages en temps réel via Firestore.
 */

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const otherUserId = params.userId as string
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const [message, setMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Construction de l'ID de conversation déterministe (userId1_userId2 trié)
  const convId = useMemoFirebase(() => {
    if (!user || !otherUserId) return null
    const ids = [user.uid, otherUserId].sort()
    return `${ids[0]}_${ids[1]}`
  }, [user, otherUserId])

  // Références Firestore
  const convRef = useMemoFirebase(() => db && convId ? doc(db, 'conversations', convId) : null, [db, convId])
  
  const messagesQuery = useMemoFirebase(() => {
    if (!db || !convId) return null
    return query(
      collection(db, 'conversations', convId, 'messages'), 
      orderBy('createdAt', 'asc'), 
      limit(50)
    )
  }, [db, convId])

  const otherUserRef = useMemoFirebase(() => db && otherUserId ? doc(db, 'users', otherUserId) : null, [db, otherUserId])

  // Données Firestore en temps réel
  const { data: conversation, isLoading: isConvLoading } = useDoc(convRef)
  const { data: messages } = useCollection(messagesQuery)
  const { data: otherProfile } = useDoc(otherUserRef)
  const { data: myProfile } = useDoc(user ? doc(db!, 'users', user.uid) : null)

  // Auto-scroll vers le bas lors de l'arrivée de nouveaux messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Marquer la conversation comme lue pour l'utilisateur actuel
  useEffect(() => {
    if (convRef && user && conversation?.unreadCount?.[user.uid] > 0) {
      updateDocumentNonBlocking(convRef, {
        [`unreadCount.${user.uid}`]: 0
      })
    }
  }, [conversation, user, convRef])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !user || !convRef || !db || !convId) return

    const text = message.trim()
    setMessage('')

    // Données du nouveau message
    const msgData = {
      senderId: user.uid,
      text,
      createdAt: serverTimestamp(),
      read: false
    }

    // Ajout du message dans la sous-collection (non-bloquant pour UX fluide)
    addDocumentNonBlocking(collection(db, 'conversations', convId, 'messages'), msgData)

    // Mise à jour des métadonnées de la conversation
    setDocumentNonBlocking(convRef, {
      participants: [user.uid, otherUserId].sort(),
      participantNames: {
        [user.uid]: myProfile?.nom || user.email?.split('@')[0] || 'Moi',
        [otherUserId]: otherProfile?.nom || 'Recrue'
      },
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      [`unreadCount.${otherUserId}`]: (conversation?.unreadCount?.[otherUserId] || 0) + 1
    }, { merge: true })
  }

  if (isUserLoading || !user) return null

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header du Chat */}
      <header className="p-4 glass-morphism border-b border-white/10 flex items-center gap-4 sticky top-0 z-50">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-primary/20">
            <User className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-black italic uppercase tracking-tighter text-sm">
              {otherProfile?.nom || 'Chargement...'}
            </span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Match en direct</span>
          </div>
        </div>
      </header>

      {/* Zone de Messages */}
      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 flex flex-col gap-4 pb-32"
      >
        {isConvLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages && messages.length > 0 ? (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === user.uid
            const time = msg.createdAt?.seconds 
              ? format(new Date(msg.createdAt.seconds * 1000), 'HH:mm', { locale: fr })
              : ''

            return (
              <div 
                key={msg.id || idx} 
                className={cn(
                  "flex flex-col max-w-[80%] gap-1 animate-in fade-in slide-in-from-bottom-2",
                  isMe ? "self-end items-end" : "self-start items-start"
                )}
              >
                <div className={cn(
                  "px-4 py-2.5 rounded-2xl text-sm font-medium shadow-md",
                  isMe 
                    ? "bg-primary text-black rounded-tr-none" 
                    : "bg-card border border-white/5 text-foreground rounded-tl-none"
                )}>
                  {msg.text}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
                  {time}
                </span>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
            <Send className="w-12 h-12 mb-4" />
            <p className="text-xs font-black uppercase tracking-widest italic">Engagez le jeu !</p>
          </div>
        )}
      </div>

      {/* Input de Message */}
      <form 
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 p-4 pb-10 glass-morphism border-t border-white/10 flex gap-2"
      >
        <Input 
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Entrez votre passe décisive..."
          className="bg-card border-none ring-1 ring-white/10 focus-visible:ring-primary rounded-xl h-12 font-medium"
        />
        <Button 
          type="submit" 
          disabled={!message.trim()}
          size="icon" 
          className="h-12 w-12 rounded-xl bg-primary text-black shrink-0 shadow-lg shadow-primary/20"
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>
    </div>
  )
}
