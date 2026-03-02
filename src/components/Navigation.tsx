
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, PlusCircle, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, where } from 'firebase/firestore'
import { useMemo } from 'react'

/**
 * @fileOverview Barre de navigation principale avec système d'alerte binaire (Lu / Non lu).
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

  // Analyse simple des messages non lus
  const unreadCount = useMemo(() => {
    if (!conversations || !user) return 0
    
    let count = 0
    conversations.forEach(conv => {
      if (conv.deletedBy?.includes(user.uid)) return;
      count += (conv.unreadCount?.[user.uid] || 0)
    })

    return count
  }, [conversations, user])

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/favoris', icon: Trophy, label: 'Favoris' },
    { href: '/offres/new', icon: PlusCircle, label: 'Publier' },
    { 
      href: '/messages', 
      icon: MessageSquare, 
      label: 'Vestiaire', 
      count: unreadCount
    },
    { href: '/profile', icon: User, label: 'Profil' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-morphism border-t border-white/10 px-4 py-2 flex justify-around items-center h-20">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
        const showBadge = (item.count || 0) > 0 && !isActive

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
              showBadge && "bg-orange-500/10"
            )}>
              <item.icon className={cn(
                "w-6 h-6 transition-colors", 
                isActive && "fill-primary/20",
                showBadge && "text-orange-500 fill-orange-500/20"
              )} />
              
              {showBadge && (
                <div className="absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 border-background px-1 z-10 shadow-lg bg-orange-500 text-white">
                  <span className="text-[10px] font-black italic">{item.count}</span>
                </div>
              )}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-colors",
              showBadge && "text-orange-500"
            )}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
