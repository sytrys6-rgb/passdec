import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: "100% Pass' Déc' - Le réseau social qui fait marquer",
  description: 'La marketplace et le réseau social définitif pour les clubs de football et leurs fans.',
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
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
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