import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import User from '@/models/User';
import { verifyAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const projectId = searchParams.get('project');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const workspaceId = searchParams.get('workspace');

    if (id) {
      const task = await Task.findById(id)
        .populate('project', 'name color')
        .populate('assignee', 'firstName lastName avatar')
        .populate('creator', 'firstName lastName avatar')
        .populate('comments.user', 'firstName lastName avatar');

      if (!task) {
        return NextResponse.json({ success: false, error: 'Tâche non trouvée' }, { status: 404 });
      }

      const taskWithProject = {
        ...task.toObject(),
        projectName: (task.project as any)?.name,
        projectColor: (task.project as any)?.color,
      };

      return NextResponse.json({
        success: true,
        data: taskWithProject,
      });
    }

    const query: any = {};
    
    // Filter by project or workspace
    if (projectId) {
      query.project = projectId;
    } else if (workspaceId) {
      // Find all projects in this workspace
      const projects = await Project.find({ workspace: workspaceId }).select('_id');
      const projectIds = projects.map(p => p._id);
      query.project = { $in: projectIds };
    } else {
      return NextResponse.json({ success: false, error: 'Workspace ID ou Project ID requis' }, { status: 400 });
    }
    
    // Filter by priority
    if (priority) {
      query.priority = priority;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name color')
      .populate('assignee', 'firstName lastName avatar')
      .populate('creator', 'firstName lastName avatar')
      .sort({ priority: -1, order: 1, createdAt: -1 });

    // Add project info to tasks
    const tasksWithProject = tasks.map((task) => ({
      ...task.toObject(),
      projectName: (task.project as any)?.name,
      projectColor: (task.project as any)?.color,
    }));

    return NextResponse.json({
      success: true,
      data: tasksWithProject,
    });
  } catch (error: any) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la récupération des tâches' },
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
    const { 
      title, 
      description, 
      project: projectId, 
      priority = 'less_important',
      status = 'todo',
      dueDate,
      assignee,
      tags = [],
    } = body;

    if (!title || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Titre et projet requis' },
        { status: 400 }
      );
    }

    // Get project info for color
    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projet non trouvé' },
        { status: 404 }
      );
    }

    // Get max order for this project
    const maxOrderTask = await Task.findOne({ project: projectId }).sort({ order: -1 });
    const order = maxOrderTask ? maxOrderTask.order + 1 : 0;

    const task = await Task.create({
      title,
      description,
      project: projectId,
      projectName: project.name,
      projectColor: project.color,
      creator: auth.userId,
      assignee,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags,
      subtasks: [],
      attachments: [],
      comments: [],
      order,
    });

    // Update project task count
    await Project.findByIdAndUpdate(projectId, {
      $inc: { tasksCount: 1 },
    });

    await task.populate('project', 'name color');
    await task.populate('creator', 'firstName lastName avatar');

    return NextResponse.json({
      success: true,
      data: task,
      message: 'Tâche créée avec succès',
    });
  } catch (error: any) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la création de la tâche' },
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
      return NextResponse.json({ success: false, error: 'ID de la tâche requis' }, { status: 400 });
    }

    const body = await request.json();
    const task = await Task.findById(id);

    if (!task) {
      return NextResponse.json({ success: false, error: 'Tâche non trouvée' }, { status: 404 });
    }

    // Update status and handle project counts
    if (body.status && body.status !== task.status) {
      const isNowDone = body.status === 'done';
      const wasDone = task.status === 'done';
      
      if (isNowDone && !wasDone) {
        await Project.findByIdAndUpdate(task.project, { $inc: { completedTasksCount: 1 } });
      } else if (!isNowDone && wasDone) {
        await Project.findByIdAndUpdate(task.project, { $inc: { completedTasksCount: -1 } });
      }
    }

    const updatedTask = await Task.findByIdAndUpdate(id, body, { new: true })
      .populate('project', 'name color')
      .populate('creator', 'firstName lastName avatar')
      .populate('comments.user', 'firstName lastName avatar');

    return NextResponse.json({
      success: true,
      data: updatedTask,
    });
  } catch (error: any) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la mise à jour' },
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
      return NextResponse.json({ success: false, error: 'ID de la tâche requis' }, { status: 400 });
    }
    
    const task = await Task.findById(id);
    if (!task) {
      return NextResponse.json({ success: false, error: 'Tâche non trouvée' }, { status: 404 });
    }
    
    // Update project counts
    const updateQuery: any = { $inc: { tasksCount: -1 } };
    if (task.status === 'done') {
      updateQuery.$inc.completedTasksCount = -1;
    }
    
    await Project.findByIdAndUpdate(task.project, updateQuery);
    
    await Task.findByIdAndDelete(id);
    
    return NextResponse.json({
      success: true,
      message: 'Tâche supprimée avec succès'
    });
  } catch (error: any) {
    console.error('Delete task error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}

