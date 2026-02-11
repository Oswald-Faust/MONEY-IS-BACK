import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
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
