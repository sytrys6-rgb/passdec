
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, PlusCircle, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, where } from 'firebase/firestore'
import { useMemo } from 'react'

/**
 * @fileOverview Barre de navigation principale avec notification "Carton Rouge".
 * L'icône devient rouge et un point apparaît lorsqu'il y a au moins un message non lu.
 * Système 100% temps réel pour chaque utilisateur.
 */

export function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()
  const db = useFirestore()

  // On écoute toutes les conversations où l'utilisateur est présent
  const convsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    )
  }, [db, user])

  const { data: conversations } = useCollection(convsQuery)

  // On vérifie si n'importe laquelle des conversations a un compteur de non lu pour l'utilisateur actuel
  const hasUnread = useMemo(() => {
    if (!conversations || !user) return false
    return conversations.some(conv => (conv.unreadCount?.[user.uid] || 0) > 0)
  }, [conversations, user])

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/favoris', icon: Trophy, label: 'Favoris' },
    { href: '/offres/new', icon: PlusCircle, label: 'Publier' },
    { href: '/messages', icon: MessageSquare, label: 'Messages', hasNotification: hasUnread },
    { href: '/profile', icon: User, label: 'Profil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-morphism border-t border-white/10 px-4 py-2 flex justify-around items-center h-20">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        // On affiche la notification seulement si on n'est pas déjà sur la page des messages
        const isNotified = item.hasNotification && !isActive

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
              <item.icon className={cn(
                "w-6 h-6 transition-colors", 
                isActive && "fill-primary/20",
                isNotified && "text-destructive fill-destructive/10 animate-pulse"
              )} />
              
              {/* Point de notification (Carton Rouge) */}
              {isNotified && (
                <div className="absolute top-1.5 right-1.5 w-3 h-3 bg-destructive rounded-full border-2 border-background shadow-lg shadow-destructive/40 animate-in zoom-in-50 duration-300" />
              )}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest",
              isNotified && "text-destructive font-black"
            )}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
