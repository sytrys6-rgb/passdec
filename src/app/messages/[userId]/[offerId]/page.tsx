"use client"

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

// Configuration pour permettre le build en mode export statique
export const dynamic = 'force-static';
export const dynamicParams = false;

/**
 * @fileOverview Redirection de messagerie.
  * Correction : Ne renvoie plus de balises <html> pour éviter Internal Server Error.
   */
   export default function RedirectChatPage() {
     const router = useRouter()
       const params = useParams()
         
           useEffect(() => {
               // Utilisation de la vérification de type sécurisée pour les params
                   const userId = params?.userId as string
                       const offerId = params?.offerId as string
                           
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

                                                                       
