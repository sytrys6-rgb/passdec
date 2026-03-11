"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * @fileOverview Redirection des messages vers la liste principale.
 * Requis pour le build statique sur Vercel.
 */

export const dynamicParams = true;

export function generateStaticParams() {
  return [];
}

export default function RedirectUserMessagesPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/messages')
  }, [router])

  return (
    <div className="bg-background flex flex-col items-center justify-center min-h-screen p-6">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  )
}
