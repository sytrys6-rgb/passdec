
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, PlusCircle, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, where } from 'firebase/firestore'
import { useMemo } from 'react'

/**
 * @fileOverview Barre de navigation principale avec notification visuelle rouge.
 * L'icône devient rouge et un point apparaît lorsqu'il y a des messages non lus.
 * Persiste après actualisation car basé sur les données réelles de Firestore.
 */

export function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()
  const db = useFirestore()

  // On écoute toutes les conversations où l'utilisateur est participant
  const convsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    )
  }, [db, user])

  const { data: conversations } = useCollection(convsQuery)

  // Calcul du statut de notification en temps réel
  const hasUnread = useMemo(() => {
    if (!conversations || !user) return false
    // On vérifie si au moins une conversation a un compteur de messages non lus pour MOI
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
        // Un item est actif si on est sur sa page ou une sous-page (ex: /messages/123)
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
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
              
              {/* Point de notification rouge vif (Carton Rouge) */}
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
