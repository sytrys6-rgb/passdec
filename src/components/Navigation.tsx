
"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Trophy, PlusCircle, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase'
import { collection, query, where } from 'firebase/firestore'
import { useMemo, useState, useEffect } from 'react'

/**
 * @fileOverview Barre de navigation principale avec système d'alerte multiniveaux.
 * - Badge numérique : Immédiat si messages non lus (total cumulé).
 * - Carton Rouge : Couleur rouge et pulsation si au moins un message attend depuis > 1 min.
 */

export function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()
  const db = useFirestore()
  const [now, setNow] = useState<number>(Date.now())

  // Mise à jour régulière du temps pour la règle de la minute
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000)
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

  // Analyse précise des messages non lus
  const unreadStats = useMemo(() => {
    if (!conversations || !user) return { totalCount: 0, hasDelayed: false }
    
    let totalCount = 0
    let hasDelayed = false

    conversations.forEach(conv => {
      // On filtre les conversations masquées par l'utilisateur
      if (conv.deletedBy?.includes(user.uid)) return;

      const count = conv.unreadCount?.[user.uid] || 0
      if (count > 0) {
        totalCount += count
        const lastTime = conv.lastMessageAt?.seconds || (Date.now() / 1000)
        // Règle du carton rouge : plus de 60 secondes d'attente
        if ((now / 1000 - lastTime) > 60) {
          hasDelayed = true
        }
      }
    })

    return { totalCount, hasDelayed }
  }, [conversations, user, now])

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/favoris', icon: Trophy, label: 'Favoris' },
    { href: '/offres/new', icon: PlusCircle, label: 'Publier' },
    { 
      href: '/messages', 
      icon: MessageSquare, 
      label: 'Vestiaire', 
      count: unreadStats.totalCount,
      isDelayed: unreadStats.hasDelayed
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
              showBadge && (item.isDelayed ? "bg-destructive/10" : "bg-primary/10")
            )}>
              <item.icon className={cn(
                "w-6 h-6 transition-colors", 
                isActive && "fill-primary/20",
                showBadge && (item.isDelayed ? "text-destructive fill-destructive/20 animate-pulse scale-110" : "text-primary fill-primary/20")
              )} />
              
              {/* Badge numérique (Immédiat) */}
              {showBadge && (
                <div className={cn(
                  "absolute -top-1 -right-1 min-w-[20px] h-[20px] flex items-center justify-center rounded-full border-2 border-background px-1 z-10 shadow-lg transition-all duration-500",
                  item.isDelayed 
                    ? "bg-destructive text-white shadow-destructive/40 scale-110 animate-bounce" 
                    : "bg-primary text-black shadow-primary/40"
                )}>
                  <span className="text-[10px] font-black italic">{item.count}</span>
                </div>
              )}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-widest transition-colors",
              showBadge && (item.isDelayed ? "text-destructive" : "text-primary")
            )}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
