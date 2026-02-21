import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import Project from '@/models/Project';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const workspace = await Workspace.findById(id)
      .populate('owner', 'firstName lastName email avatar role')
      .populate('members.user', 'firstName lastName email avatar role');

    if (!workspace) {
      return NextResponse.json({ success: false, error: 'Workspace introuvable' }, { status: 404 });
    }

    const projects = await Project.find({ workspace: workspace._id })
      .select('name color status tasksCount completedTasksCount createdAt members')
      .sort({ updatedAt: -1 });

    const totalTasks = projects.reduce((sum, p: any) => sum + (p.tasksCount || 0), 0);
    const completedTasks = projects.reduce((sum, p: any) => sum + (p.completedTasksCount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        workspace,
        projects,
        stats: {
          totalMembers: workspace.members?.length || 0,
          totalProjects: projects.length,
          activeProjects: projects.filter((p: any) => p.status === 'active').length,
          totalTasks,
          completedTasks,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
