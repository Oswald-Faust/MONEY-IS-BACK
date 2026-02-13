import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, bio, profileColor, avatar } = body;

    // Validation basic
    if (email && !email.includes('@')) {
        return NextResponse.json({ success: false, error: 'Email invalide' }, { status: 400 });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
        auth.userId,
        { 
            $set: {
                firstName,
                lastName,
                email,
                ...(bio !== undefined && { bio }),
                ...(profileColor !== undefined && { profileColor }),
                ...(avatar !== undefined && { avatar })
            }
        },
        { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json({
        success: true,
        data: updatedUser,
        message: 'Profil mis à jour avec succès'
    });

  } catch (error: any) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Erreur lors de la mise à jour' }, { status: 500 });
  }
}
