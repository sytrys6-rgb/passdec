
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
 * Affiche un badge numérique avec le nombre de messages non lus.
 */

export function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()
  const db = useFirestore()

  // On écoute toutes les conversations de l'utilisateur pour compter les non-lus
  const convsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    )
  }, [db, user])

  const { data: conversations } = useCollection(convsQuery)

  // Calcule le nombre total de messages non lus
  const totalUnread = useMemo(() => {
    if (!conversations || !user) return 0
    return conversations.reduce((acc, conv) => acc + (conv.unreadCount?.[user.uid] || 0), 0)
  }, [conversations, user])

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/favoris', icon: Trophy, label: 'Favoris' },
    { href: '/offres/new', icon: PlusCircle, label: 'Publier' },
    { href: '/messages', icon: MessageSquare, label: 'Messages', unread: totalUnread },
    { href: '/profile', icon: User, label: 'Profil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-morphism border-t border-white/10 px-4 py-2 flex justify-around items-center h-20">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        const hasBadge = item.label === 'Messages' && (item.unread || 0) > 0

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
              isActive && "bg-primary/10"
            )}>
              <item.icon className={cn("w-6 h-6", isActive && "fill-primary/20")} />
              
              {/* Badge numérique pour les messages non lus */}
              {hasBadge && (
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary flex items-center justify-center rounded-full border border-background shadow-lg animate-in zoom-in-50 duration-300">
                  <span className="text-[8px] font-black text-black leading-none">
                    {item.unread && item.unread > 9 ? '9+' : item.unread}
                  </span>
                </div>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
