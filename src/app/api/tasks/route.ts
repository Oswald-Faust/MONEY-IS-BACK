import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Task from '@/models/Task';
import Project from '@/models/Project';
import User from '@/models/User';
import Workspace from '@/models/Workspace';
import { verifyAuth } from '@/lib/auth';
import { sendActionNotification } from '@/lib/mail';
import {
  applyTaskProjectCountTransition,
  getNextTaskOrder,
  syncObjectiveCheckpointFromTask,
} from '@/lib/objective-task-link';

type TaskResponseDocument = {
  toObject(): Record<string, unknown>;
  project?: {
    name?: string;
    color?: string;
  } | null;
  projectName?: string;
  projectColor?: string;
  objective?: {
    title?: string;
  } | null;
};

function canAccessProject(project: { owner: { toString(): string }; members: Array<{ user: { toString(): string } }> }, userId: string) {
  return (
    project.owner.toString() === userId ||
    project.members.some((member) => member.user.toString() === userId)
  );
}

function canAccessWorkspace(
  workspace: { owner: { toString(): string }; members: Array<{ user: { toString(): string } }> },
  userId: string
) {
  return (
    workspace.owner.toString() === userId ||
    workspace.members.some((member) => member.user.toString() === userId)
  );
}

function formatTaskResponse(task: TaskResponseDocument) {
  return {
    ...task.toObject(),
    projectName: task.project?.name || task.projectName,
    projectColor: task.project?.color || task.projectColor,
    objectiveTitle: task.objective?.title,
  };
}

async function populateTask(id: string) {
  return Task.findById(id)
    .populate('project', 'name color')
    .populate('objective', 'title')
    .populate('assignee', 'firstName lastName avatar')
    .populate('assignees', 'firstName lastName avatar')
    .populate('creator', 'firstName lastName avatar')
    .populate('comments.user', 'firstName lastName avatar');
}

async function ensureWorkspaceAccess(workspaceId: string, userId: string, role?: string) {
  const workspace = await Workspace.findById(workspaceId).select('owner members');
  if (!workspace) {
    return {
      ok: false as const,
      error: NextResponse.json({ success: false, error: 'Workspace non trouvé' }, { status: 404 }),
    };
  }

  if (role !== 'admin' && !canAccessWorkspace(workspace, userId)) {
    return {
      ok: false as const,
      error: NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    workspace,
  };
}

async function ensureProjectAccess(projectId: string, userId: string, role?: string) {
  const project = await Project.findById(projectId).select('owner members workspace name color');
  if (!project) {
    return {
      ok: false as const,
      error: NextResponse.json({ success: false, error: 'Projet non trouvé' }, { status: 404 }),
    };
  }

  if (role !== 'admin' && !canAccessProject(project, userId)) {
    return {
      ok: false as const,
      error: NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    project,
  };
}

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const projectId = searchParams.get('project');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const workspaceId = searchParams.get('workspace');

    if (id) {
      const task = await populateTask(id);

      if (!task) {
        return NextResponse.json({ success: false, error: 'Tâche non trouvée' }, { status: 404 });
      }

      if (task.project) {
        const projectAccess = await ensureProjectAccess(
          typeof task.project === 'object' && '_id' in task.project
            ? task.project._id.toString()
            : String(task.project),
          auth.userId,
          auth.role
        );

        if (!projectAccess.ok) {
          return projectAccess.error;
        }
      } else if (task.workspace) {
        const workspaceAccess = await ensureWorkspaceAccess(String(task.workspace), auth.userId, auth.role);
        if (!workspaceAccess.ok) {
          return workspaceAccess.error;
        }
      } else {
        return NextResponse.json({ success: false, error: 'Tâche orpheline' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: formatTaskResponse(task),
      });
    }

    const query: Record<string, unknown> = {};

    if (projectId) {
      const projectAccess = await ensureProjectAccess(projectId, auth.userId, auth.role);
      if (!projectAccess.ok) {
        return projectAccess.error;
      }

      query.project = projectId;
    } else if (workspaceId) {
      const workspaceAccess = await ensureWorkspaceAccess(workspaceId, auth.userId, auth.role);
      if (!workspaceAccess.ok) {
        return workspaceAccess.error;
      }

      const projectQuery =
        auth.role === 'admin'
          ? { workspace: workspaceId }
          : {
              workspace: workspaceId,
              $or: [{ owner: auth.userId }, { 'members.user': auth.userId }],
            };

      const accessibleProjects = await Project.find(projectQuery).select('_id');
      const accessibleProjectIds = accessibleProjects.map((project) => project._id);

      query.$or = [
        { project: { $in: accessibleProjectIds } },
        {
          workspace: workspaceId,
          $or: [{ project: { $exists: false } }, { project: null }],
        },
      ];
    } else {
      return NextResponse.json(
        { success: false, error: 'Workspace ID ou Project ID requis' },
        { status: 400 }
      );
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const tasks = await Task.find(query)
      .populate('project', 'name color')
      .populate('objective', 'title')
      .populate('assignee', 'firstName lastName avatar')
      .populate('assignees', 'firstName lastName avatar')
      .populate('creator', 'firstName lastName avatar')
      .sort({ priority: -1, order: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: tasks.map((task) => formatTaskResponse(task)),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la récupération des tâches';
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const normalizedProjectId = body.project || undefined;
    const providedWorkspaceId = body.workspace || undefined;
    const {
      title,
      description,
      priority = 'less_important',
      status = 'todo',
      dueDate,
      assignee,
      assignees,
      tags = [],
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'Le titre est requis' }, { status: 400 });
    }

    if (!normalizedProjectId && !providedWorkspaceId) {
      return NextResponse.json(
        { success: false, error: 'Projet ou Workspace requis' },
        { status: 400 }
      );
    }

    let projectName: string | undefined;
    let projectColor: string | undefined;
    let workspaceId = providedWorkspaceId;

    if (normalizedProjectId) {
      const projectAccess = await ensureProjectAccess(normalizedProjectId, auth.userId, auth.role);
      if (!projectAccess.ok) {
        return projectAccess.error;
      }

      projectName = projectAccess.project.name;
      projectColor = projectAccess.project.color;
      workspaceId = projectAccess.project.workspace.toString();
    } else if (providedWorkspaceId) {
      const workspaceAccess = await ensureWorkspaceAccess(providedWorkspaceId, auth.userId, auth.role);
      if (!workspaceAccess.ok) {
        return workspaceAccess.error;
      }
    }

    const finalAssignees = Array.from(
      new Set((assignees && assignees.length > 0 ? assignees : assignee ? [assignee] : []).filter(Boolean))
    );

    const task = await Task.create({
      title: title.trim(),
      description,
      workspace: workspaceId,
      project: normalizedProjectId,
      projectName,
      projectColor,
      creator: auth.userId,
      assignee: finalAssignees[0],
      assignees: finalAssignees,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      tags,
      subtasks: [],
      attachments: [],
      comments: [],
      order: await getNextTaskOrder(normalizedProjectId || null, String(workspaceId)),
      source: 'manual',
    });

    await applyTaskProjectCountTransition(null, {
      project: task.project,
      status: task.status,
    });

    if (normalizedProjectId) {
      const workspace = await Workspace.findById(workspaceId).populate('owner');
      if (
        workspace &&
        workspace.owner &&
        typeof workspace.owner === 'object' &&
        'email' in workspace.owner &&
        workspace.owner.email &&
        workspace.owner._id.toString() !== auth.userId
      ) {
        const owner = workspace.owner as { _id: mongoose.Types.ObjectId; email?: string };
        const creator = await User.findById(auth.userId);
        const actorName = creator ? `${creator.firstName} ${creator.lastName}` : 'Un membre';

        sendActionNotification(
          owner.email,
          actorName,
          `vient de créer la tâche "${title}"`,
          workspace.name
        ).catch((error) => console.error('Error sending action notification:', error));
      }
    }

    const populatedTask = await populateTask(task._id.toString());
    if (!populatedTask) {
      throw new Error('Tâche introuvable après création');
    }

    return NextResponse.json({
      success: true,
      data: formatTaskResponse(populatedTask),
      message: 'Tâche créée avec succès',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la création de la tâche';
    console.error('Create task error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
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

    if (task.project) {
      const projectAccess = await ensureProjectAccess(String(task.project), auth.userId, auth.role);
      if (!projectAccess.ok) {
        return projectAccess.error;
      }
    } else if (task.workspace) {
      const workspaceAccess = await ensureWorkspaceAccess(String(task.workspace), auth.userId, auth.role);
      if (!workspaceAccess.ok) {
        return workspaceAccess.error;
      }
    }

    const body = await request.json();

    if (task.source === 'objective_checkpoint' && body.project !== undefined && String(body.project || '') !== String(task.project || '')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cette tâche est liée à un objectif. Modifiez le projet depuis l\'objectif.',
        },
        { status: 400 }
      );
    }

    const previousState = {
      project: task.project,
      status: task.status,
    };

    if (body.title !== undefined) task.title = body.title.trim();
    if (body.description !== undefined) task.description = body.description;
    if (body.priority !== undefined) task.priority = body.priority;
    if (body.status !== undefined) task.status = body.status;
    if (body.dueDate !== undefined) {
      task.dueDate = body.dueDate ? new Date(body.dueDate) : undefined;
    }

    if (Object.prototype.hasOwnProperty.call(body, 'assignees') || Object.prototype.hasOwnProperty.call(body, 'assignee')) {
      const finalAssignees = Array.from(
        new Set(
          (
            body.assignees !== undefined
              ? body.assignees
              : body.assignee
                ? [body.assignee]
                : []
          ).filter(Boolean)
        )
      );

      task.assignees = finalAssignees.map((assigneeId) => new mongoose.Types.ObjectId(String(assigneeId)));
      task.assignee = finalAssignees[0]
        ? new mongoose.Types.ObjectId(String(finalAssignees[0]))
        : undefined;
    }

    if (body.tags !== undefined) task.tags = body.tags;

    if (body.project !== undefined && task.source !== 'objective_checkpoint') {
      const nextProjectId = body.project || undefined;
      const nextWorkspaceId = body.workspace || undefined;

      if (nextProjectId) {
        const projectAccess = await ensureProjectAccess(String(nextProjectId), auth.userId, auth.role);
        if (!projectAccess.ok) {
          return projectAccess.error;
        }

        task.project = projectAccess.project._id;
        task.workspace = projectAccess.project.workspace;
        task.projectName = projectAccess.project.name;
        task.projectColor = projectAccess.project.color;
      } else if (nextWorkspaceId) {
        const workspaceAccess = await ensureWorkspaceAccess(String(nextWorkspaceId), auth.userId, auth.role);
        if (!workspaceAccess.ok) {
          return workspaceAccess.error;
        }

        task.project = undefined;
        task.projectName = undefined;
        task.projectColor = undefined;
        task.workspace = workspaceAccess.workspace._id;
      }
    } else if (body.workspace !== undefined && !task.project) {
      const workspaceAccess = await ensureWorkspaceAccess(String(body.workspace), auth.userId, auth.role);
      if (!workspaceAccess.ok) {
        return workspaceAccess.error;
      }

      task.workspace = workspaceAccess.workspace._id;
    }

    if (!task.workspace && task.project) {
      const projectAccess = await ensureProjectAccess(String(task.project), auth.userId, auth.role);
      if (!projectAccess.ok) {
        return projectAccess.error;
      }

      task.workspace = projectAccess.project.workspace;
      task.projectName = task.projectName || projectAccess.project.name;
      task.projectColor = task.projectColor || projectAccess.project.color;
    }

    await task.save();
    await applyTaskProjectCountTransition(previousState, {
      project: task.project,
      status: task.status,
    });

    if (task.source === 'objective_checkpoint') {
      await syncObjectiveCheckpointFromTask(task);
    }

    const populatedTask = await populateTask(id);
    if (!populatedTask) {
      return NextResponse.json({ success: false, error: 'Tâche non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: formatTaskResponse(populatedTask),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
    console.error('Update task error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
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

    if (task.project) {
      const projectAccess = await ensureProjectAccess(String(task.project), auth.userId, auth.role);
      if (!projectAccess.ok) {
        return projectAccess.error;
      }
    } else if (task.workspace) {
      const workspaceAccess = await ensureWorkspaceAccess(String(task.workspace), auth.userId, auth.role);
      if (!workspaceAccess.ok) {
        return workspaceAccess.error;
      }
    }

    if (task.source === 'objective_checkpoint') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cette tâche est liée à un objectif. Supprimez le checkpoint depuis l\'objectif.',
        },
        { status: 400 }
      );
    }

    await applyTaskProjectCountTransition(
      { project: task.project, status: task.status },
      null
    );

    await task.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Tâche supprimée avec succès',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
    console.error('Delete task error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
