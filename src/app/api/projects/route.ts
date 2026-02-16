import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import User from '@/models/User';
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

    if (!workspaceId) {
       return NextResponse.json({ success: false, error: 'Workspace ID requis' }, { status: 400 });
    }

    const query: any = { workspace: workspaceId };
    if (status !== 'all') query.status = status;

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

    // Check Plan Limits
    const Workspace = (await import('@/models/Workspace')).default;
    const { PLAN_LIMITS } = await import('@/lib/limits');
    
    const ws = await Workspace.findById(workspace);
    if (!ws) {
      return NextResponse.json({ success: false, error: 'Workspace non trouvé' }, { status: 404 });
    }

    const projectCount = await Project.countDocuments({ workspace });
    const limit = PLAN_LIMITS[ws.subscriptionPlan as keyof typeof PLAN_LIMITS]?.maxProjects || 0;

    if (projectCount >= limit) {
      return NextResponse.json({ 
        success: false, 
        error: `Limite de projets atteinte pour le plan ${ws.subscriptionPlan}. Veuillez passer au plan supérieur.` 
      }, { status: 403 });
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
      securePassword: body.securePassword || undefined,
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

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { name, description, color, status, securePassword } = body;

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ success: false, error: 'Projet non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions : Projet Admin ou Workspace Admin
    const Workspace = (await import('@/models/Workspace')).default;
    const ws = await Workspace.findById(project.workspace);
    
    const isWorkspaceAdmin = ws?.members.some(
      (m: any) => m.user.toString() === auth.userId && m.role === 'admin'
    ) || ws?.owner.toString() === auth.userId;

    const isProjectAdmin = project.members.some(
      (m: any) => m.user.toString() === auth.userId && m.role === 'admin'
    ) || project.owner.toString() === auth.userId;

    if (!isWorkspaceAdmin && !isProjectAdmin) {
      return NextResponse.json({ success: false, error: 'Permissions insuffisantes' }, { status: 403 });
    }

    // Si on veut changer le mot de passe, seul l'admin du workspace peut le faire (selon la demande client)
    if (securePassword !== undefined && !isWorkspaceAdmin) {
        return NextResponse.json({ success: false, error: 'Seul l\'administrateur du workspace peut modifier le mot de passe sécurisé' }, { status: 403 });
    }

    // Mise à jour des champs
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (color) project.color = color;
    if (status) project.status = status;
    if (securePassword) project.securePassword = securePassword;

    await project.save();

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Projet mis à jour avec succès',
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la mise à jour du projet' },
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

