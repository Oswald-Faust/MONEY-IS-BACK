import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Workspace from '@/models/Workspace';
import Project from '@/models/Project';
import Task from '@/models/Task';
import SystemLog from '@/models/SystemLog';
import { verifyAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || (auth as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const user = await User.findById(id).select('-password');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get Workspaces
    const workspaces = await Workspace.find({
      $or: [
        { owner: id },
        { 'members.user': id }
      ]
    }).populate('owner', 'firstName lastName email avatar');

    // Get Projects counts & details
    const projects = await Project.find({
      $or: [
        { owner: id },
        { 'members.user': id }
      ]
    }).populate('workspace', 'name');

    // Get Tasks stats
    const tasksCount = await Task.countDocuments({ owner: id });
    const completedTasksCount = await Task.countDocuments({ owner: id, status: 'done' });

    // Get Recent Logs
    const recentLogs = await SystemLog.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      data: {
        user,
        workspaces,
        projects,
        stats: {
          totalWorkspaces: workspaces.length,
          totalProjects: projects.length,
          totalTasks: tasksCount,
          completedTasks: completedTasksCount,
          productivity: tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0
        },
        recentLogs
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
