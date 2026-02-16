import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Project from '@/models/Project';
import Task from '@/models/Task';
import Objective from '@/models/Objective';
import Idea from '@/models/Idea';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const workspaceId = searchParams.get('workspaceId');

    if (!query || query.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    await dbConnect();

    // Escape special characters for regex
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedQuery, 'i');

    // Search in parallel
    const [projects, tasks, objectives, ideas] = await Promise.all([
      // Projects
      Project.find({
        workspace: workspaceId,
        $or: [
          { name: searchRegex },
          { description: searchRegex }
        ]
      }).limit(5).lean(),

      // Tasks
      Task.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      })
      .populate('project', 'name color')
      .limit(10).lean(),

      // Objectives
      Objective.find({
        workspace: workspaceId,
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      }).limit(5).lean(),

      // Ideas
      Idea.find({
        workspace: workspaceId,
        $or: [
          { title: searchRegex },
          { content: searchRegex }
        ]
      }).limit(5).lean()
    ]);

    // Format results
    const results: any[] = [];

    projects.forEach((p: any) => {
      results.push({
        type: 'project',
        id: p._id,
        title: p.name,
        subtitle: p.description || 'Projet',
        color: p.color,
        icon: p.icon || 'folder',
        href: `/projects/${p._id}`
      });
    });

    tasks.forEach((t: any) => {
      results.push({
        type: 'task',
        id: t._id,
        title: t.title,
        subtitle: (t.project as any)?.name ? `Dans ${(t.project as any).name}` : 'Tâche',
        color: (t.project as any)?.color || '#6366f1',
        icon: 'check-square',
        href: `/projects/${t.project._id}?taskId=${t._id}`,
        status: t.status,
        priority: t.priority
      });
    });

    objectives.forEach((o: any) => {
      results.push({
        type: 'objective',
        id: o._id,
        title: o.title,
        subtitle: 'Objectif',
        color: '#10b981', // Emerald
        icon: 'target',
        href: '/objectives'
      });
    });

    ideas.forEach((i: any) => {
      results.push({
        type: 'idea',
        id: i._id,
        title: i.title,
        subtitle: 'Idée',
        color: '#f59e0b', // Amber
        icon: 'lightbulb',
        href: '/ideas'
      });
    });

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
