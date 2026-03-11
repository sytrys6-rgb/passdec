import type { Metadata, Viewport } from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Toaster } from '@/components/ui/toaster';
import Script from 'next/script';

// Force le rendu dynamique pour éviter les erreurs de build liées à Firebase/SSR
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export const metadata: Metadata = {
  title: "100% Pass'Déc' - Le réseau social qui fait marquer",
    description: 'La marketplace et le réseau social définitif pour les clubs de football et leurs fans.',
      manifest: '/manifest.json',
        appleWebApp: {
            capable: true,
                statusBarStyle: 'black-translucent',
                    title: "Pass'Déc'",
                      },
                      };

                      export const viewport: Viewport = {
                        themeColor: '#000000',
                          width: 'device-width',
                            initialScale: 1,
                              maximumScale: 1,
                                userScalable: false,
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
                                                                                
                                                                                        {/* PWA Meta Tags */}
                                                                                                <link rel="apple-touch-icon" href="https://res.cloudinary.com/dfincejqz/image/upload/w_180,h_180,c_pad/v1772489336/logo_fec345.jpg" />
                                                                                                        <link rel="icon" href="https://res.cloudinary.com/dfincejqz/image/upload/w_32,h_32,c_pad/v1772489336/logo_fec345.jpg" />
                                                                                                                <link rel="manifest" href="/manifest.json" />
                                                                                                                        <meta name="apple-mobile-web-app-capable" content="yes" />
                                                                                                                                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                                                                                                                                        <meta name="theme-color" content="#000000" />
                                                                                                                                              </head>
                                                                                                                                                    <body className="font-body antialiased bg-background text-foreground min-h-screen">
                                                                                                                                                            <FirebaseClientProvider>
                                                                                                                                                                      <div className="flex flex-col min-h-screen">
                                                                                                                                                                                  <main className="flex-grow pb-20">
                                                                                                                                                                                                {children}
                                                                                                                                                                                                            </main>
                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                <Toaster />
                                                                                                                                                                                                                                        </FirebaseClientProvider>
                                                                                                                                                                                                                                                <Script id="register-sw" strategy="afterInteractive">
                                                                                                                                                                                                                                                          {`
                                                                                                                                                                                                                                                                      if ('serviceWorker' in navigator) {
                                                                                                                                                                                                                                                                                    window.addEventListener('load', function() {
                                                                                                                                                                                                                                                                                                    navigator.serviceWorker.register('/sw.js').then(function(registration) {
                                                                                                                                                                                                                                                                                                                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                                                                                                                                                                                                                                                                                                                                      }, function(err) {
                                                                                                                                                                                                                                                                                                                                                        console.log('ServiceWorker registration failed: ', err);
                                                                                                                                                                                                                                                                                                                                                                        });
                                                                                                                                                                                                                                                                                                                                                                                      });
                                                                                                                                                                                                                                                                                                                                                                                                  }
                                                                                                                                                                                                                                                                                                                                                                                                            `}
                                                                                                                                                                                                                                                                                                                                                                                                                    </Script>
                                                                                                                                                                                                                                                                                                                                                                                                                          </body>
                                                                                                                                                                                                                                                                                                                                                                                                                              </html>
                                                                                                                                                                                                                                                                                                                                                                                                                                );
                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                