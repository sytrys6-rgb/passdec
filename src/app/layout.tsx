import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PassDec - 100% Football Marketplace',
  description: 'The definitive marketplace for football clubs and fans.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow pb-20">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}