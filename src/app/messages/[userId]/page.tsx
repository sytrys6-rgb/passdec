
import { redirect } from 'next/navigation';

/**
 * @fileOverview Redirection des messages vers la liste principale (Server-side).
 * Correction de l'erreur Internal Server Error.
 */

export default async function RedirectUserMessagesPage() {
  redirect('/messages');
}

export const dynamic = 'force-dynamic';
