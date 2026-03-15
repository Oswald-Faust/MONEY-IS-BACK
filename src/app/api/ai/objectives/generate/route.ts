import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import Project from '@/models/Project';
import { ensureWorkspaceAccess } from '@/lib/ai/access';
import { generateObjectiveDraft } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorise' }, { status: 401 });
    }

    const body = await request.json();
    const workspaceId = body.workspaceId ? String(body.workspaceId) : null;
    const projectId = body.projectId ? String(body.projectId) : null;
    const title = body.title ? String(body.title) : '';
    const description = body.description ? String(body.description) : '';
    const prompt = body.prompt ? String(body.prompt) : '';

    if (!workspaceId && !projectId) {
      return NextResponse.json(
        { success: false, error: 'Workspace ou projet requis pour generer un objectif' },
        { status: 400 }
      );
    }

    let finalWorkspaceId = workspaceId;
    if (projectId) {
      const project = await Project.findById(projectId).select('workspace owner members');
      if (!project) {
        return NextResponse.json({ success: false, error: 'Projet introuvable' }, { status: 404 });
      }

      finalWorkspaceId = project.workspace.toString();
      const isProjectMember =
        project.owner.toString() === auth.userId ||
        project.members.some((member) => member.user.toString() === auth.userId);

      if (!isProjectMember && auth.role !== 'admin') {
        return NextResponse.json({ success: false, error: 'Acces refuse' }, { status: 403 });
      }
    }

    if (!finalWorkspaceId) {
      return NextResponse.json({ success: false, error: 'Workspace introuvable' }, { status: 400 });
    }

    const workspaceAccess = await ensureWorkspaceAccess(finalWorkspaceId, auth.userId, auth.role);
    if (!workspaceAccess.ok) {
      return workspaceAccess.error;
    }

    const draft = await generateObjectiveDraft({
      workspaceId: finalWorkspaceId,
      projectId,
      title,
      description,
      prompt,
    });

    return NextResponse.json({
      success: true,
      data: draft,
    });
  } catch (error) {
    console.error('Error generating AI objective draft:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la generation IA de l objectif' },
      { status: 500 }
    );
  }
}
