import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { firstName, lastName, email, password, role = 'user' } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Valider le rôle
    if (role !== 'user' && role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Rôle invalide' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Cet email est déjà utilisé' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: role,
      preferences: {
        theme: 'dark',
        notifications: true,
        language: 'fr',
      },
    });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user.email, user.firstName).catch(err => {
      console.error('Error sending welcome email:', err);
    });

    // Workspace creation moved to onboarding step
    // const workspace = await Workspace.create({...});
    // user.workspaces = [workspace._id];
    // await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    // Return user without password
    const userResponse = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      preferences: user.preferences,
    };

    // Créer la réponse
    const response = NextResponse.json({
      success: true,
      data: {
        user: userResponse,
        token,
        // Workspace to be created in onboarding
      },
      message: 'Inscription réussie',
    });

    // Définir le cookie auth-token côté serveur (valable 7 jours)
    response.cookies.set('auth-token', token, {
      httpOnly: false, // Doit être false pour que le client puisse le lire
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours en secondes
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de l\'inscription' },
      { status: 500 }
    );
  }
}
