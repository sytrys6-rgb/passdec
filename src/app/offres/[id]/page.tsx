
import { redirect } from 'next/navigation';

/**
 * @fileOverview Redirection des anciennes routes d'offres (Server-side).
 * Correction de l'erreur Internal Server Error.
 */

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RedirectOfferPage({ params }: PageProps) {
  const { id } = await params;

  if (id && id !== 'redirect') {
    redirect(`/offres/details/?id=${id}`);
  } else {
    redirect('/');
  }
}

export const dynamic = 'force-dynamic';
