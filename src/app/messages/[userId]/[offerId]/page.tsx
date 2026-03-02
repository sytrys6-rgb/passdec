
"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Send, User, Loader2, Star, ShieldCheck, MapPin, MessageCircle, Mail, Info, Trophy } from 'lucide-react'
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase'
import { doc, collection, query, orderBy, serverTimestamp, limit, increment } from 'firebase/firestore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Image from 'next/image'
import { allOffers } from '@/app/lib/offers'

const profileTypes = {
  particulier: { label: 'Footeux', complement: 'Particulier', emoji: '⚽' },
  club_foot: { label: 'Team', complement: 'Club de foot', emoji: '🏟️' },
  club_supporter: { label: 'Ultras', complement: 'Club de supporters', emoji: '🎺' },
  professionnel: { label: 'Pro', complement: 'Professionnel / Entreprise', emoji: '🏢' },
}

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const otherUserId = params.userId as string
  const offerId = params.offerId as string
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const [message, setMessage] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Construction de l'ID de conversation déterministe par offre
  const convId = useMemoFirebase(() => {
    if (!user || !otherUserId || !offerId) return null
    const ids = [user.uid, otherUserId].sort()
    return `${offerId}_${ids[0]}_${ids[1]}`
  }, [user, otherUserId, offerId])

  const convRef = useMemoFirebase(() => db && convId ? doc(db, 'conversations', convId) : null, [db, convId])
  
  const messagesQuery = useMemoFirebase(() => {
    if (!db || !convId) return null
    return query(
      collection(db, 'conversations', convId, 'messages'), 
      orderBy('createdAt', 'asc'), 
      limit(50)
    )
  }, [db, convId])

  // Charger les données de l'annonce pour avoir le titre
  const mockOffer = allOffers.find(o => o.id === offerId)
  const fsOfferRef = useMemoFirebase(() => db && offerId && !mockOffer ? doc(db, 'offres', offerId) : null, [db, offerId, mockOffer])
  const { data: fsOffer } = useDoc(fsOfferRef)
  const currentOffer = mockOffer || fsOffer

  const otherUserRef = useMemoFirebase(() => db && otherUserId ? doc(db, 'users', otherUserId) : null, [db, otherUserId])
  const myUserRef = useMemoFirebase(() => db && user ? doc(db, 'users', user.uid) : null, [db, user])

  const { data: conversation, isLoading: isConvLoading } = useDoc(convRef)
  const { data: messages } = useCollection(messagesQuery)
  const { data: otherProfile } = useDoc(otherUserRef)
  const { data: myProfile } = useDoc(myUserRef)

  useEffect(() => {
    if (scrollRef.current && messages) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (convRef && user && (conversation?.unreadCount?.[user.uid] || 0) > 0) {
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

    // Lors de l'envoi d'un message, on réinitialise deletedBy pour que la conv réapparaisse pour tout le monde
    setDocumentNonBlocking(convRef, {
      participants: [user.uid, otherUserId].sort(),
      participantNames: {
        [user.uid]: myProfile?.nom || user.email?.split('@')[0] || 'Moi',
        [otherUserId]: otherProfile?.nom || 'Recrue'
      },
      offerId: offerId,
      offerTitle: currentOffer?.titre || 'Discussion',
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      [`unreadCount.${otherUserId}`]: increment(1),
      deletedBy: [] // Réinitialisation du statut masqué
    }, { merge: true })

    const messagesCol = collection(db, 'conversations', convId, 'messages')
    addDocumentNonBlocking(messagesCol, {
      senderId: user.uid,
      text,
      createdAt: serverTimestamp(),
      read: false
    })
  }

  if (isUserLoading || !user) return null

  const currentType = otherProfile ? (profileTypes[otherProfile.typeProfil as keyof typeof profileTypes] || profileTypes.particulier) : profileTypes.particulier
  const whatsappLink = otherProfile?.whatsapp 
    ? `https://wa.me/${otherProfile.whatsapp.replace(/\D/g, '')}` 
    : null
  const emailLink = otherProfile?.emailPublic ? `mailto:${otherProfile.emailPublic}` : null

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="p-4 glass-morphism border-b border-white/10 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/messages')} className="rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border border-primary/20 overflow-hidden relative">
              {otherProfile?.photoUrl ? (
                <Image src={otherProfile.photoUrl} alt={otherProfile.nom} fill className="object-cover" unoptimized />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-black italic uppercase tracking-tighter text-sm">
                {otherProfile?.nom || 'Chargement...'}
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-primary">Match en direct</span>
            </div>
          </div>
        </div>
        
        {currentOffer && (
          <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase italic tracking-widest text-[8px] px-2 py-1 bg-primary/5 hidden sm:flex items-center gap-1 max-w-[150px] truncate">
            <Trophy className="w-2.5 h-2.5" />
            {currentOffer.titre}
          </Badge>
        )}
      </header>

      {currentOffer && (
        <div className="bg-primary/5 p-2 border-b border-white/5 flex justify-center sm:hidden">
          <span className="text-[8px] font-black uppercase tracking-widest text-primary flex items-center gap-1 truncate max-w-[250px]">
            <Trophy className="w-2.5 h-2.5" />
            Objet : {currentOffer.titre}
          </span>
        </div>
      )}

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-6 flex flex-col gap-4 pb-48"
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
            <p className="text-xs font-black uppercase tracking-widest italic">Engagez le jeu pour cette annonce !</p>
          </div>
        )}

        {otherProfile && (
          <div className="mt-12 mb-8 animate-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-[10px] font-black italic uppercase tracking-widest mb-4 flex items-center justify-center gap-2 text-muted-foreground">
              <Info className="w-3 h-3 text-primary" />
              Changer de canal tactique ?
            </h2>
            
            <div className="relative group max-w-sm mx-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-card to-background rounded-[2.5rem] border-2 border-primary/20 transform rotate-1 group-hover:rotate-0 transition-transform duration-500" />
              
              <div className="relative bg-card/80 backdrop-blur-xl rounded-[2.5rem] p-6 border border-white/10 shadow-2xl flex flex-col items-center gap-4 overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                
                <div className="w-full flex justify-between items-start">
                  <div className="flex flex-col items-center">
                    <span className="text-4xl font-black italic text-primary leading-none">5.0</span>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase italic tracking-widest px-3 py-1 bg-primary/5">
                      {currentType.emoji} {currentType.label}
                    </Badge>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden shadow-2xl bg-muted flex items-center justify-center">
                    {otherProfile?.photoUrl ? (
                      <Image src={otherProfile.photoUrl} alt={otherProfile.nom} fill className="object-cover" unoptimized />
                    ) : (
                      <User className="w-10 h-10 text-muted-foreground" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary p-1 rounded-full border-2 border-card shadow-lg">
                    <ShieldCheck className="w-4 h-4 text-black" />
                  </div>
                </div>

                <div className="text-center w-full space-y-1">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground">{otherProfile.nom}</h3>
                  <div className="flex items-center justify-center gap-1.5 text-primary">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{otherProfile.ville}</span>
                  </div>
                </div>

                <div className="flex flex-col w-full gap-2 mt-2">
                  {whatsappLink && (
                    <Button 
                      asChild
                      className="w-full h-10 rounded-xl font-black italic uppercase tracking-wider text-[10px] shadow-lg bg-green-500/10 border border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white transition-all gap-2 group"
                    >
                      <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                        WhatsApp
                      </a>
                    </Button>
                  )}

                  {emailLink && (
                    <Button 
                      asChild
                      className="w-full h-10 rounded-xl font-black italic uppercase tracking-wider text-[10px] shadow-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all gap-2 group"
                    >
                      <a href={emailLink}>
                        <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                        Envoyer Email
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form 
        onSubmit={handleSend}
        className="fixed bottom-0 left-0 right-0 p-4 pb-10 glass-morphism border-t border-white/10 flex gap-2 z-50"
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
