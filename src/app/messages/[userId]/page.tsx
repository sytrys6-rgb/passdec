
import { redirect } from 'next/navigation';

/**
 * @fileOverview Redirection des messages vers la liste principale (Server Component).
 * Utilise redirect() pour une navigation fluide et robuste côté serveur.
 */

export default async function RedirectUserMessagesPage() {
  redirect('/messages');
}

export const dynamic = 'force-dynamic';
