
"use client"

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * @fileOverview Redirection de messagerie.
 * Correction : Ne renvoie plus de balises <html> pour éviter Internal Server Error.
 */
export default function RedirectChatPage() {
  const router = useRouter()
  const params = useParams()
  
  useEffect(() => {
    const userId = params.userId as string
    const offerId = params.offerId as string
    if (userId && offerId && userId !== 'redirect') {
      router.replace(`/messages/chat/?userId=${userId}&offerId=${offerId}`)
    } else {
      router.replace('/messages')
    }
  }, [params, router])

  return (
    <div className="bg-background flex flex-col items-center justify-center min-h-screen p-6">
      <Loader2 className="animate-spin h-8 w-8 text-primary" />
    </div>
  )
}
