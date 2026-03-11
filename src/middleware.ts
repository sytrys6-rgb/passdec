
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware de protection globale.
 * Redirige vers /login si le cookie 'auth_token' est absent, 
 * sauf pour les routes publiques (vitrine, login, legal, static).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Routes publiques autorisées sans connexion
  const isPublicPath = 
    pathname === '/' || 
    pathname === '/login' || 
    pathname === '/login/' ||
    pathname.startsWith('/legal/') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/manifest.json')

  // Fichiers statiques et internes de Next.js
  const isStaticFile = pathname.match(/\.(.*)$/) || pathname.startsWith('/_next')
  
  if (isPublicPath || isStaticFile) {
    return NextResponse.next()
  }

  // Vérification du cookie d'authentification
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    const loginUrl = new URL('/login/', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Configuration du matcher pour exclure les API et ressources système
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
