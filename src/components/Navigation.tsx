
"use client"

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Home, Trophy, PlusCircle, MessageSquare, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PlaceHolderImages } from '@/lib/placeholder-images'

export function Navigation() {
  const pathname = usePathname()
  const logoUrl = PlaceHolderImages.find(img => img.id === 'brand-logo')?.imageUrl || ''

  const navItems = [
    { href: '/', icon: Home, label: 'Accueil' },
    { href: '/favoris', icon: Trophy, label: 'Favoris' },
    { href: '/offres/new', icon: PlusCircle, label: 'Publier' },
    { href: '/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/profile', icon: User, label: 'Profil' },
  ]

  return (
    <>
      {/* Logo en haut à gauche */}
      <div className="fixed top-4 left-4 z-[60] pointer-events-none">
        {logoUrl && (
          <div className="w-12 h-12 relative pointer-events-auto">
            <Link href="/">
              <Image 
                src={logoUrl} 
                alt="Logo Pass' Déc'" 
                fill
                className="object-contain"
                unoptimized
              />
            </Link>
          </div>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 glass-morphism border-t border-white/10 px-4 py-2 flex justify-around items-center h-20">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium uppercase tracking-widest">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
