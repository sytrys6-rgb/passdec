/**
 * @fileOverview Redirection de l'ancienne route dynamique vers la nouvelle route statique.
 * Ce fichier est un Server Component pour être compatible avec generateStaticParams en mode export.
 */

export function generateStaticParams() {
  // On génère une route statique "redirect" pour que le build passe.
  return [{ id: 'redirect' }]
}

export default function RedirectOfferPage() {
  return (
    <html>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            const params = new URLSearchParams(window.location.search);
            const id = window.location.pathname.split('/').filter(Boolean).pop();
            if (id && id !== 'redirect') {
              window.location.href = '/offres/details/?id=' + id;
            } else {
              window.location.href = '/';
            }
          `
        }} />
      </head>
      <body className="bg-background flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </body>
    </html>
  )
}
