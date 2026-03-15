import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import Workspace from '@/models/Workspace';
import { verifyAuth } from '@/lib/auth';
import { createProjectForWorkspace } from '@/lib/projects/create-project';

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

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

    const workspace = await Workspace.findById(workspaceId).select('owner members');
    if (!workspace) {
      return NextResponse.json({ success: false, error: 'Workspace non trouvé' }, { status: 404 });
    }

    const isWorkspaceMember =
      workspace.owner.toString() === auth.userId ||
      workspace.members.some((member) => member.user.toString() === auth.userId);

    if (!isWorkspaceMember && auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 });
    }

    const query: {
      workspace: string;
      status?: string;
      $or?: Array<{ owner: string } | { 'members.user': string }>;
    } = {
      workspace: workspaceId,
      ...(auth.role === 'admin'
        ? {}
        : {
            $or: [
              { owner: auth.userId },
              { 'members.user': auth.userId },
            ],
          }),
    };
    if (status !== 'all') query.status = status;

    const projects = await Project.find(query)
      .populate('owner', 'firstName lastName avatar')
      .populate('members.user', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error, 'Erreur lors de la récupération des projets'),
      },
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

    if (!name || !workspace) {
      return NextResponse.json(
        { success: false, error: 'Nom et workspace requis' },
        { status: 400 }
      );
    }

    const { project } = await createProjectForWorkspace({
      userId: auth.userId,
      role: auth.role,
      workspaceId: workspace,
      name,
      description,
      color,
      icon,
      securePassword: body.securePassword,
    });

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Projet créé avec succès',
    });
  } catch (error) {
    console.error('Create project error:', error);
    const message = getErrorMessage(error, 'Erreur lors de la création du projet');
    const status =
      message === 'Nom du projet requis'
        ? 400
        : message === 'Workspace non trouvé'
        ? 404
        : message === 'Accès refusé' ||
            message.includes('désactivée') ||
            message.includes('Limite de projets atteinte')
          ? 403
          : 500;
    return NextResponse.json(
      { success: false, error: message },
      { status }
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
      (member) => member.user.toString() === auth.userId && member.role === 'admin'
    ) || ws?.owner.toString() === auth.userId;

    const isProjectAdmin = project.members.some(
      (member) => member.user.toString() === auth.userId && member.role === 'admin'
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
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(error, 'Erreur lors de la mise à jour du projet'),
      },
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
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json(
      { success: false, error: getErrorMessage(error, 'Erreur lors de la suppression') },
      { status: 500 }
    );
  }
}
