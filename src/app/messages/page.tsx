"use client"

import { Navigation } from '@/components/Navigation'
import { Badge } from '@/components/ui/badge'
import { MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function MessagesPage() {
  const mockConversations = [
    {
      id: '1',
      userNom: 'FC Etoile',
      offreTitre: 'Maillot OL 2024',
      lastMessage: 'Bonjour, toujours disponible ?',
      time: '12:30',
      unread: true,
      avatar: 'https://picsum.photos/seed/user1/100/100'
    },
    {
      id: '2',
      userNom: 'Jean Foot',
      offreTitre: 'Crampons Adidas Predator',
      lastMessage: 'Je peux passer ce soir.',
      time: 'Hier',
      unread: false,
      avatar: 'https://picsum.photos/seed/user2/100/100'
    }
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-6">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Vestiaires</h1>
        <div className="h-1 w-12 bg-primary mt-1 rounded-full" />
      </header>

      <div className="flex-grow flex flex-col px-6 gap-3">
        {mockConversations.length > 0 ? (
          mockConversations.map((conv) => (
            <Link 
              key={conv.id}
              href={`/messages/${conv.id}`}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-white/5 hover:border-primary/20 transition-all group shadow-lg"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-muted border-2 border-transparent group-hover:border-primary/50 transition-colors">
                  <Image src={conv.avatar} alt={conv.userNom} width={56} height={56} className="object-cover" />
                </div>
                {conv.unread && (
                  <div className="absolute top-0 right-0 w-4 h-4 bg-primary border-2 border-card rounded-full" />
                )}
              </div>
              
              <div className="flex-grow flex flex-col gap-0.5">
                <div className="flex justify-between items-center">
                  <span className="font-black uppercase italic tracking-tighter text-sm">{conv.userNom}</span>
                  <span className="text-[10px] text-muted-foreground font-bold">{conv.time}</span>
                </div>
                <span className="text-xs font-bold text-primary italic uppercase tracking-tighter line-clamp-1">{conv.offreTitre}</span>
                <p className={`text-xs line-clamp-1 mt-0.5 ${conv.unread ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
            <MessageCircle className="w-12 h-12 text-primary/20" />
            <p className="text-sm font-black uppercase tracking-widest italic">Aucune conversation</p>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
}