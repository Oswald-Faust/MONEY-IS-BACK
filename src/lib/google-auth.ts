import crypto from 'crypto';

const GOOGLE_AUTH_BASE = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

export interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
}

export function getGoogleRedirectUri(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
  return `${appUrl.replace(/\/$/, '')}/api/auth/google/callback`;
}

export function generateOAuthState(): string {
  return crypto.randomBytes(24).toString('hex');
}

export function getGoogleAuthUrl(state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID manquant');
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGoogleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });

  return `${GOOGLE_AUTH_BASE}?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string): Promise<{ access_token: string }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Configuration Google OAuth incomplète');
  }

  const body = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: getGoogleRedirectUri(),
    grant_type: 'authorization_code',
  });

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Échange du code Google impossible: ${text}`);
  }

  const data = await response.json();

  if (!data.access_token) {
    throw new Error('Réponse Google invalide: access_token manquant');
  }

  return { access_token: data.access_token as string };
}

export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Impossible de récupérer le profil Google: ${text}`);
  }

  const data = await response.json();

  if (!data.sub || !data.email) {
    throw new Error('Profil Google incomplet');
  }

  return data as GoogleUserInfo;
}

export function splitName(name?: string): { firstName: string; lastName: string } {
  const safe = (name || '').trim();
  if (!safe) {
    return { firstName: 'Utilisateur', lastName: 'Google' };
  }

  const parts = safe.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: 'Google' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export function generateRandomPassword(): string {
  return crypto.randomBytes(24).toString('base64url');
}
