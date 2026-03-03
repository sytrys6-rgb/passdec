/**
 * @fileOverview Redirection de l'ancienne route de messagerie.
 */

export function generateStaticParams() {
  return [{ userId: 'redirect' }]
}

export default function RedirectUserMessagesPage() {
  return (
    <html>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.location.href = '/messages';
          `
        }} />
      </head>
      <body className="bg-background flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </body>
    </html>
  )
}
