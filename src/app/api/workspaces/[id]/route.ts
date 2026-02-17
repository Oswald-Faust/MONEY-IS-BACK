import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import jwt from 'jsonwebtoken';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };
    const userId = decoded.userId;

    const body = await request.json();
    const { name, description, settings, useCase } = body;

    // Find workspace and check permissions
    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return NextResponse.json({ success: false, error: 'Workspace introuvable' }, { status: 404 });
    }

    // Check if user is owner or admin member
    const isOwner = workspace.owner.toString() === userId;
    const isAdminMember = workspace.members.some(
      (m: any) => m.user.toString() === userId && m.role === 'admin'
    );

    if (!isOwner && !isAdminMember) {
      return NextResponse.json({ success: false, error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Update fields
    if (name) workspace.name = name;
    if (description !== undefined) workspace.description = description;
    if (useCase) workspace.useCase = useCase;
    
    if (settings) {
      workspace.settings = {
        ...workspace.settings,
        ...settings
      };
    }

    await workspace.save();

    return NextResponse.json({
      success: true,
      data: workspace,
      message: 'Workspace mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating workspace:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du workspace' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };
    const userId = decoded.userId;

    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return NextResponse.json({ success: false, error: 'Workspace introuvable' }, { status: 404 });
    }

    // Only owner can delete workspace
    if (workspace.owner.toString() !== userId) {
      return NextResponse.json({ success: false, error: 'Seul le propriétaire peut supprimer le workspace' }, { status: 403 });
    }

    // Don't allow deleting the last workspace? 
    // Maybe later. For now, just delete.
    
    await Workspace.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Workspace supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting workspace:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du workspace' },
      { status: 500 }
    );
  }
}
