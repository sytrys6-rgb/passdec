
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware de protection globale pour Next.js 15.
 * Redirige vers /login si le cookie 'auth_token' est absent.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Routes publiques autorisées sans connexion
  const isPublicPath = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/login/' ||
    pathname.startsWith('/legal/') ||
    pathname === '/sw.js' ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.ico'

  // Fichiers statiques et internes de Next.js
  const isStaticFile = 
    pathname.startsWith('/_next') || 
    pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|js|css)$/)
  
  if (isPublicPath || isStaticFile) {
    return NextResponse.next()
  }

  // Vérification du cookie d'authentification pour toutes les autres routes (Vestiaire, Profil, Détails)
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    // Redirige vers /login avec l'URL de retour si possible
    const loginUrl = new URL('/login/', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configuration du matcher : on applique à tout sauf les routes internes spécifiques
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
