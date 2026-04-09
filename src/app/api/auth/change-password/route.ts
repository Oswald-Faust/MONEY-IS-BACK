import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Vérifier l'authentification
    const authResult = await verifyAuth(request);
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;
    const currentPasswordValue = typeof currentPassword === 'string' ? currentPassword : '';

    if (!newPassword) {
      return NextResponse.json(
        { success: false, error: 'Veuillez fournir un nouveau mot de passe' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur avec son mot de passe
    const user = await User.findById(authResult.userId).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    const canSetPasswordWithoutCurrentPassword = user.authProvider === 'google';

    if (!canSetPasswordWithoutCurrentPassword) {
      if (!currentPasswordValue) {
        return NextResponse.json(
          { success: false, error: 'Veuillez fournir l\'ancien mot de passe' },
          { status: 400 }
        );
      }

      const isMatch = await user.comparePassword(currentPasswordValue);
      
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: 'L\'ancien mot de passe est incorrect' },
          { status: 400 }
        );
      }
    }

    // Mettre à jour le mot de passe
    // Le middleware pre-save se chargera du hachage
    user.password = newPassword;
    await user.save();

    return NextResponse.json({
      success: true,
      message: canSetPasswordWithoutCurrentPassword
        ? 'Mot de passe défini avec succès'
        : 'Mot de passe modifié avec succès',
    });
  } catch (error: unknown) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du changement de mot de passe' },
      { status: 500 }
    );
  }
}
