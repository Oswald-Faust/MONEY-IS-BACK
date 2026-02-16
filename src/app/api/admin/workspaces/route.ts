import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import Project from '@/models/Project';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || (auth as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search') || '';

    await dbConnect();

    const query: any = {};
    if (userId) {
      query.$or = [
        { owner: userId },
        { 'members.user': userId }
      ];
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const workspaces = await Workspace.find(query)
      .sort({ createdAt: -1 })
      .populate('owner', 'firstName lastName email avatar');

    // For each workspace, get project and task counts
    const workspacesWithStats = await Promise.all(workspaces.map(async (ws) => {
      const projectsCount = await Project.countDocuments({ workspace: ws._id });
      return {
        ...ws.toObject(),
        projectsCount
      };
    }));

    return NextResponse.json({
      success: true,
      data: workspacesWithStats
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
