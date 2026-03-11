
import { redirect } from 'next/navigation';

/**
 * @fileOverview Redirection de messagerie sécurisée (Server Component).
 * Assure la compatibilité avec le Middleware et l'export dynamique.
 */

interface PageProps {
  params: Promise<{
    userId: string;
    offerId: string;
  }>;
}

export default async function RedirectChatPage({ params }: PageProps) {
  const { userId, offerId } = await params;
  
  if (userId && offerId && userId !== 'redirect') {
    redirect(`/messages/chat/?userId=${userId}&offerId=${offerId}`);
  } else {
    redirect('/messages');
  }
}

export const dynamic = 'force-dynamic';
