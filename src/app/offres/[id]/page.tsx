
"use client"

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Configuration dynamique pour Vercel
export const dynamic = 'force-dynamic';

/**
 * @fileOverview Redirection des anciennes routes vers le nouveau système de détails.
 * Correction : Suppression des balises html/body interdites.
 */

export default function RedirectOfferPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  useEffect(() => {
    if (id && id !== 'redirect') {
      router.replace(`/offres/details/?id=${id}`)
    } else {
      router.replace('/')
    }
  }, [id, router])

  return (
    <div className="bg-background flex flex-col items-center justify-center min-h-screen p-6">
      <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
      <p className="text-[10px] font-black uppercase italic tracking-widest text-muted-foreground">Redirection tactique...</p>
    </div>
  )
}

export function generateStaticParams() {
  return []
}
