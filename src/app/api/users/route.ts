import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

// GET /api/users - Récupérer tous les utilisateurs (admin only)
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

// POST /api/users - Créer un utilisateur (admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, email, password, role } = body;

    // Validation basic
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return NextResponse.json({ success: false, error: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    // Créer l'utilisateur
    const newUser = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
    });

    const userResponse = newUser.toObject() as any;
    const { password: _, ...safeUser } = userResponse;

    return NextResponse.json({
      success: true,
      data: safeUser,
      message: 'Utilisateur créé avec succès',
    });
  } catch (error: Error | any) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Supprimer un utilisateur (admin only)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'ID utilisateur requis' }, { status: 400 });
    }

    // Empêcher de se supprimer soi-même
    if (userId === auth.userId) {
      return NextResponse.json({ success: false, error: 'Vous ne pouvez pas vous supprimer vous-même' }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Utilisateur supprimé avec succès',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'utilisateur' },
      { status: 500 }
    );
  }
}

// PATCH /api/users - Mettre à jour un utilisateur (admin only)
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { id, driveAccess } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID utilisateur requis' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { driveAccess },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: 'Utilisateur mis à jour avec succès',
    });
  } catch (error: Error | any) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
