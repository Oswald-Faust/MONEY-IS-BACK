import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import {
  exchangeCodeForTokens,
  fetchGoogleUserInfo,
  generateRandomPassword,
  splitName,
} from '@/lib/google-auth';

function cleanCookie(response: NextResponse, name: string) {
  response.cookies.set(name, '', {
    path: '/',
    expires: new Date(0),
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const stateCookie = request.cookies.get('oauth-state')?.value;
  const callbackCookie = request.cookies.get('oauth-callback')?.value;
  const planCookie = request.cookies.get('oauth-plan')?.value;
  const billingCookie = request.cookies.get('oauth-billing')?.value;

  if (!code || !state || !stateCookie || state !== stateCookie) {
    return NextResponse.redirect(new URL('/login?error=google_oauth_state', request.url));
  }

  try {
    await connectDB();

    const { access_token } = await exchangeCodeForTokens(code);
    const profile = await fetchGoogleUserInfo(access_token);

    if (!profile.email_verified) {
      return NextResponse.redirect(new URL('/login?error=google_email_not_verified', request.url));
    }

    const email = profile.email.toLowerCase();
    let user = await User.findOne({ email });
    const isNewUser = !user;

    if (!user) {
      const fromFullName = splitName(profile.name);
      const firstName = profile.given_name || fromFullName.firstName;
      const lastName = profile.family_name || fromFullName.lastName;

      user = await User.create({
        firstName,
        lastName,
        email,
        password: generateRandomPassword(),
        role: 'user',
        authProvider: 'google',
        googleId: profile.sub,
        ...(profile.picture ? { avatar: profile.picture } : {}),
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'fr',
        },
      });
    } else {
      const updates: Record<string, unknown> = {};

      if (!user.googleId) {
        updates.googleId = profile.sub;
      }

      if (user.authProvider !== 'google') {
        updates.authProvider = 'google';
      }

      if (!user.avatar && profile.picture) {
        updates.avatar = profile.picture;
      }

      if (Object.keys(updates).length > 0) {
        user = await User.findByIdAndUpdate(user._id, updates, { new: true }) || user;
      }
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    const hasExplicitCallback = !!(callbackCookie && callbackCookie.startsWith('/'));
    let nextPath = '/dashboard';

    if (hasExplicitCallback) {
      nextPath = callbackCookie as string;
    } else if (isNewUser) {
      const plan = planCookie ? encodeURIComponent(planCookie) : null;
      const billing = billingCookie ? encodeURIComponent(billingCookie) : 'monthly';
      nextPath = plan ? `/onboarding?plan=${plan}&billing=${billing}` : '/onboarding';
    }

    const response = NextResponse.redirect(
      new URL(`/auth/google/success?next=${encodeURIComponent(nextPath)}`, request.url)
    );

    response.cookies.set('auth-token', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    cleanCookie(response, 'oauth-state');
    cleanCookie(response, 'oauth-mode');
    cleanCookie(response, 'oauth-callback');
    cleanCookie(response, 'oauth-plan');
    cleanCookie(response, 'oauth-billing');

    return response;
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(new URL('/login?error=google_oauth_failed', request.url));
  }
}
