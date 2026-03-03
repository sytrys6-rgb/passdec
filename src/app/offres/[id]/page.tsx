
"use client"

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

/**
 * @fileOverview Redirection de l'ancienne route dynamique vers la nouvelle route statique compatible export.
 * generateStaticParams est requis par Next.js pour l'exportation statique.
 */

export function generateStaticParams() {
  return [{ id: 'redirect' }]
}

export default function RedirectOfferPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  useEffect(() => {
    if (id) {
      router.replace(`/offres/details/?id=${id}`)
    }
  }, [id, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
