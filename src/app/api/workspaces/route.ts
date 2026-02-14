import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

// GET /api/workspaces - Récupérer les workspaces de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };

    // Récupérer les workspaces où l'utilisateur est propriétaire ou membre
    const workspaces = await Workspace.find({
      $or: [
        { owner: decoded.userId },
        { 'members.user': decoded.userId }
      ]
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des workspaces' },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - Créer un nouveau workspace
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };
    const userId = decoded.userId;

    const body = await request.json();
    const { name, description, useCase, theme, icon } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Le nom du workspace est requis' },
        { status: 400 }
      );
    }

    // Créer le workspace
    const workspace = await Workspace.create({
      name,
      description: description || '',
      owner: userId,
      members: [{ user: userId, role: 'admin', joinedAt: new Date() }],
      useCase: useCase || 'other',
      settings: {
        defaultProjectColor: '#6366f1',
        allowInvitations: true,
        icon: icon || 'Briefcase',
        theme: theme || 'dark'
      }
    });

    // Mettre à jour l'utilisateur pour ajouter le workspace
    await User.findByIdAndUpdate(userId, {
      $push: { workspaces: workspace._id }
    });

    return NextResponse.json({
      success: true,
      data: workspace,
      message: 'Workspace créé avec succès'
    });

  } catch (error: any) {
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la création du workspace' },
      { status: 500 }
    );
  }
}
