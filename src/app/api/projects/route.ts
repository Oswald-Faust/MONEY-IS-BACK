import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import GlobalSettings from '@/models/GlobalSettings';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspace');
    const status = searchParams.get('status') || 'active';

    const query: any = {};
    if (workspaceId) query.workspace = workspaceId;
    if (status !== 'all') query.status = status;

    // Tous les utilisateurs voient tous les projets, sans distinction.
    // L'ancien filtrage par rôle/membre a été retiré à la demande de l'utilisateur.

    const projects = await Project.find(query)
      .populate('owner', 'firstName lastName avatar')
      .populate('members.user', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error: any) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération des projets' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, color, icon, workspace } = body;

    // Check Global Permissions
    if (auth.role !== 'admin') {
      const settings = await GlobalSettings.findOne();
      if (settings && settings.permissions.createProject === false) {
        return NextResponse.json(
          { success: false, error: 'La création de projet est temporairement désactivée pour les utilisateurs standard.' },
          { status: 403 }
        );
      }
    }

    if (!name || !workspace) {
      return NextResponse.json(
        { success: false, error: 'Nom et workspace requis' },
        { status: 400 }
      );
    }

    const project = await Project.create({
      name,
      description,
      color: color || '#6366f1',
      icon: icon || 'folder',
      workspace,
      owner: auth.userId,
      members: [{ user: auth.userId, role: 'admin', joinedAt: new Date() }],
      status: 'active',
      tasksCount: 0,
      completedTasksCount: 0,
    });

    await project.populate('owner', 'firstName lastName avatar');

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Projet créé avec succès',
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la création du projet' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID du projet requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est le propriétaire
    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Projet non trouvé' }, { status: 404 });
    }

    if (project.owner.toString() !== auth.userId) {
      return NextResponse.json({ success: false, error: 'Seul le propriétaire peut supprimer le projet' }, { status: 403 });
    }

    await Project.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Projet supprimé avec succès',
    });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

