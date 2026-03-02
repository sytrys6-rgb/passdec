
"use client"

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

/**
 * @fileOverview Redirection de l'ancienne route de messagerie vers la nouvelle structure par annonce.
 */
export default function RedirectChatPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  useEffect(() => {
    if (userId) {
      // Redirection vers une conversation par défaut pour cet utilisateur
      router.replace(`/messages/${userId}/default`)
    }
  }, [userId, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
