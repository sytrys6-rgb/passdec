
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, PlusCircle, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, where } from 'firebase/firestore'
import { useMemo, useState, useEffect } from 'react'

/**
 * @fileOverview Barre de navigation principale avec notification "Carton Rouge" différée.
 * L'icône devient rouge et pulse uniquement si un message est non lu depuis plus d'une minute.
 */

export function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()
  const db = useFirestore()
  const [now, setNow] = useState<number | null>(null)

  // Initialisation du temps pour éviter les erreurs d'hydratation et gérer le délai d'une minute
  useEffect(() => {
    setNow(Date.now())
    const interval = setInterval(() => setNow(Date.now()), 5000) // Mise à jour toutes les 5s
    return () => clearInterval(interval)
  }, [])

  // On écoute toutes les conversations où l'utilisateur est présent
  const convsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', user.uid)
    )
  }, [db, user])

  const { data: conversations } = useCollection(convsQuery)

  // Vérification des messages non lus depuis plus d'une minute
  const hasUnreadDelayed = useMemo(() => {
    if (!conversations || !user || !now) return false
    return conversations.some(conv => {
      const count = conv.unreadCount?.[user.uid] || 0
      const lastTime = conv.lastMessageAt?.seconds || 0
      const isDelayed = (now / 1000 - lastTime) > 60 // Plus de 60 secondes
      return count > 0 && isDelayed
    })
  }, [conversations, user, now])

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/favoris', icon: Trophy, label: 'Favoris' },
    { href: '/offres/new', icon: PlusCircle, label: 'Publier' },
    { href: '/messages', icon: MessageSquare, label: 'Messages', hasNotification: hasUnreadDelayed },
    { href: '/profile', icon: User, label: 'Profil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-morphism border-t border-white/10 px-4 py-2 flex justify-around items-center h-20">
      {navItems.map((item) => {
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
              isActive && "bg-primary/10",
              isNotified && "bg-destructive/10"
            )}>
              <item.icon className={cn(
                "w-6 h-6 transition-colors", 
                isActive && "fill-primary/20",
                isNotified && "text-destructive fill-destructive/20 animate-pulse scale-110"
              )} />
              
              {/* Point de notification (Carton Rouge) */}
              {isNotified && (
                <div className="absolute top-1 right-1 w-3.5 h-3.5 bg-destructive rounded-full border-2 border-background shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-in zoom-in-50 duration-300" />
              )}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-colors",
              isNotified && "text-destructive"
            )}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
