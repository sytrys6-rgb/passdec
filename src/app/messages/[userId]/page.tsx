
"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Configuration dynamique pour Vercel
export const dynamic = 'force-dynamic';

/**
 * @fileOverview Redirection des messages vers la liste principale.
 * Correction : Suppression des balises html/body interdites dans les composants enfants.
 */

export default function RedirectUserMessagesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/messages')
  }, [router])

  return (
    <div className="bg-background flex flex-col items-center justify-center min-h-screen p-6">
      <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
      <p className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground">Transfert vers les vestiaires...</p>
    </div>
  )
}

/**
 * Satisfait le build statique sur Vercel si nécessaire.
 */
export function generateStaticParams() {
  return []
}
