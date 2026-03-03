/**
 * @fileOverview Redirection de l'ancienne route dynamique de messagerie vers la nouvelle route statique.
 */

export function generateStaticParams() {
  return [{ userId: 'redirect', offerId: 'redirect' }]
}

export default function RedirectChatPage() {
  return (
    <html>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            const userId = pathParts[1];
            const offerId = pathParts[2];
            if (userId && offerId && userId !== 'redirect') {
              window.location.href = '/messages/chat/?userId=' + userId + '&offerId=' + offerId;
            } else {
              window.location.href = '/messages';
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
