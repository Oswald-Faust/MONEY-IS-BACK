import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

// Middleware temporairement désactivé - On utilise uniquement AuthGuard côté client
export function middleware(request: NextRequest) {
  // Laisser passer toutes les requêtes sans vérification
  // Le AuthGuard côté client gère la protection des routes
  return NextResponse.next();
}

// Configuration des chemins (gardée pour référence future)
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
