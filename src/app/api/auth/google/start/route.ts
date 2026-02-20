import { NextRequest, NextResponse } from 'next/server';
import { generateOAuthState, getGoogleAuthUrl } from '@/lib/google-auth';

function sanitizeRelativePath(path?: string | null): string | null {
  if (!path) return null;
  if (!path.startsWith('/')) return null;
  if (path.startsWith('//')) return null;
  return path;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const mode = url.searchParams.get('mode') === 'register' ? 'register' : 'login';
    const callbackUrl = sanitizeRelativePath(url.searchParams.get('callbackUrl'));
    const plan = url.searchParams.get('plan');
    const billing = url.searchParams.get('billing');

    const state = generateOAuthState();
    const googleUrl = getGoogleAuthUrl(state);

    const response = NextResponse.redirect(googleUrl);

    response.cookies.set('oauth-state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60,
      path: '/',
    });

    response.cookies.set('oauth-mode', mode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60,
      path: '/',
    });

    if (callbackUrl) {
      response.cookies.set('oauth-callback', callbackUrl, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60,
        path: '/',
      });
    }

    if (plan) {
      response.cookies.set('oauth-plan', plan, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60,
        path: '/',
      });
    }

    if (billing) {
      response.cookies.set('oauth-billing', billing, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 10 * 60,
        path: '/',
      });
    }

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Impossible de démarrer Google OAuth';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
