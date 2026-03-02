
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, PlusCircle, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, where } from 'firebase/firestore'
import { useMemo } from 'react'

/**
 * @fileOverview Barre de navigation principale avec notifications visuelles en temps réel.
 * L'icône des messages s'illumine en cas de messages non lus (sans compteur numérique).
 */

export function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()
  const db = useFirestore()

  // On écoute toutes les conversations de l'utilisateur pour détecter les non-lus
  const convsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    )
  }, [db, user])

  const { data: conversations } = useCollection(convsQuery)

  // Vérifie s'il y a au moins un message non lu
  const hasUnread = useMemo(() => {
    if (!conversations || !user) return false
    return conversations.some(conv => (conv.unreadCount?.[user.uid] || 0) > 0)
  }, [conversations, user])

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/favoris', icon: Trophy, label: 'Favoris' },
    { href: '/offres/new', icon: PlusCircle, label: 'Publier' },
    { href: '/messages', icon: MessageSquare, label: 'Messages', isNotify: hasUnread },
    { href: '/profile', icon: User, label: 'Profil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-morphism border-t border-white/10 px-4 py-2 flex justify-around items-center h-20">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const isMessageNotify = item.label === 'Messages' && item.isNotify

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <div className={cn(
              "relative p-2 rounded-full transition-all duration-500",
              isMessageNotify && !isActive && "bg-primary/20 animate-pulse shadow-[0_0_15px_rgba(var(--primary),0.2)]",
              isMessageNotify && isActive && "bg-primary/10"
            )}>
              <item.icon className={cn("w-6 h-6", isActive && "fill-primary/20")} />
              
              {/* Point de notification discret au lieu du nombre */}
              {isMessageNotify && (
                <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-background shadow-lg" />
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
