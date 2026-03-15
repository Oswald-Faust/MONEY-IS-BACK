import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import Objective, { type IObjective } from '@/models/Objective';
import Project from '@/models/Project';
import Workspace from '@/models/Workspace';
import { verifyAuth } from '@/lib/auth';
import {
  deleteObjectiveLinkedTasks,
  deriveObjectiveProgress,
  normalizeObjectiveCheckpoints,
  snapshotObjectiveCheckpoints,
  syncObjectiveCheckpointTasks,
} from '@/lib/objective-task-link';

type ObjectiveResponseDocument = {
  toObject(): Record<string, unknown>;
  project?: unknown;
};

function getObjectiveProjectPreview(project: unknown) {
  if (!project || typeof project !== 'object') {
    return null;
  }

  return {
    name: 'name' in project && typeof project.name === 'string' ? project.name : undefined,
    color: 'color' in project && typeof project.color === 'string' ? project.color : undefined,
  };
}

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

function formatObjectiveResponse(objective: ObjectiveResponseDocument) {
  const projectPreview = getObjectiveProjectPreview(objective.project);

  return {
    ...objective.toObject(),
    projectName: projectPreview?.name,
    projectColor: projectPreview?.color,
  };
}

function normalizeAssigneeIds(values: unknown[]) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => {
          if (typeof value === 'string' && value.trim()) {
            return [value.trim()];
          }

          if (value instanceof mongoose.Types.ObjectId) {
            return [value.toString()];
          }

          return [];
        })
    )
  );
}

function toObjectiveCheckpointDocuments(
  checkpoints: ReturnType<typeof normalizeObjectiveCheckpoints>
): IObjective['checkpoints'] {
  return checkpoints.map((checkpoint) => ({
    ...checkpoint,
    assignee: checkpoint.assignee ? new mongoose.Types.ObjectId(checkpoint.assignee) : undefined,
    assignees: checkpoint.assignees.map((assigneeId) => new mongoose.Types.ObjectId(assigneeId)),
    task: checkpoint.task ? new mongoose.Types.ObjectId(checkpoint.task) : undefined,
  })) as IObjective['checkpoints'];
}

async function populateObjective(id: string) {
  return Objective.findById(id)
    .populate('project', 'name color')
    .populate('creator', 'firstName lastName avatar')
    .populate('assignee', 'firstName lastName avatar')
    .populate('assignees', 'firstName lastName avatar')
    .populate('checkpoints.assignee', 'firstName lastName avatar')
    .populate('checkpoints.assignees', 'firstName lastName avatar');
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
      const objective = await populateObjective(id);

      if (!objective) {
        return NextResponse.json({ success: false, error: 'Objectif non trouvé' }, { status: 404 });
      }

      if (objective.project) {
        const projectAccess = await ensureProjectAccess(
          typeof objective.project === 'object' && '_id' in objective.project
            ? objective.project._id.toString()
            : String(objective.project),
          auth.userId,
          auth.role
        );

        if (!projectAccess.ok) {
          return projectAccess.error;
        }
      } else if (objective.workspace) {
        const workspaceAccess = await ensureWorkspaceAccess(String(objective.workspace), auth.userId, auth.role);
        if (!workspaceAccess.ok) {
          return workspaceAccess.error;
        }
      } else {
        return NextResponse.json({ success: false, error: 'Objectif orphelin' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: formatObjectiveResponse(objective),
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

    const objectives = await Objective.find(query)
      .populate('project', 'name color')
      .populate('creator', 'firstName lastName avatar')
      .populate('assignee', 'firstName lastName avatar')
      .populate('assignees', 'firstName lastName avatar')
      .populate('checkpoints.assignee', 'firstName lastName avatar')
      .populate('checkpoints.assignees', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: objectives.map((objective) => formatObjectiveResponse(objective)),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la récupération des objectifs';
    console.error('Get objectives error:', error);
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
      priority = 'medium',
      status = 'not_started',
      targetDate,
      assignee,
      assignees,
      checkpoints = [],
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

    let finalWorkspaceId = providedWorkspaceId;

    if (normalizedProjectId) {
      const projectAccess = await ensureProjectAccess(normalizedProjectId, auth.userId, auth.role);
      if (!projectAccess.ok) {
        return projectAccess.error;
      }

      finalWorkspaceId = projectAccess.project.workspace.toString();
    } else if (providedWorkspaceId) {
      const workspaceAccess = await ensureWorkspaceAccess(providedWorkspaceId, auth.userId, auth.role);
      if (!workspaceAccess.ok) {
        return workspaceAccess.error;
      }
    }

    const finalAssignees = normalizeAssigneeIds(
      Array.isArray(assignees) && assignees.length > 0 ? assignees : assignee ? [assignee] : []
    );

    const normalizedCheckpoints = normalizeObjectiveCheckpoints(checkpoints, finalAssignees);
    const progressState = deriveObjectiveProgress(normalizedCheckpoints);

    const objective = await Objective.create({
      title: title.trim(),
      description,
      project: normalizedProjectId,
      workspace: finalWorkspaceId,
      creator: auth.userId,
      priority,
      status: normalizedCheckpoints.length > 0 ? progressState.status : status,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      checkpoints: normalizedCheckpoints,
      assignee: finalAssignees[0],
      assignees: finalAssignees,
      progress: normalizedCheckpoints.length > 0 ? progressState.progress : 0,
    });

    await syncObjectiveCheckpointTasks(objective, []);

    const populatedObjective = await populateObjective(objective._id.toString());
    if (!populatedObjective) {
      throw new Error('Objectif introuvable après création');
    }

    return NextResponse.json({
      success: true,
      data: formatObjectiveResponse(populatedObjective),
      message: 'Objectif créé avec succès',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la création de l\'objectif';
    console.error('Create objective error:', error);
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
      return NextResponse.json({ success: false, error: 'ID de l\'objectif requis' }, { status: 400 });
    }

    const objective = await Objective.findById(id);
    if (!objective) {
      return NextResponse.json({ success: false, error: 'Objectif non trouvé' }, { status: 404 });
    }

    if (objective.project) {
      const projectAccess = await ensureProjectAccess(String(objective.project), auth.userId, auth.role);
      if (!projectAccess.ok) {
        return projectAccess.error;
      }
    } else if (objective.workspace) {
      const workspaceAccess = await ensureWorkspaceAccess(String(objective.workspace), auth.userId, auth.role);
      if (!workspaceAccess.ok) {
        return workspaceAccess.error;
      }
    }

    const body = await request.json();
    const previousCheckpoints = snapshotObjectiveCheckpoints(objective);

    const requestedProjectId =
      body.project === '' ? null : body.project !== undefined ? String(body.project) : objective.project?.toString() || null;
    const requestedWorkspaceId =
      body.workspace !== undefined ? String(body.workspace || '') || null : objective.workspace?.toString() || null;

    const finalProjectId = requestedProjectId;
    let finalWorkspaceId = requestedWorkspaceId;

    if (finalProjectId) {
      const projectAccess = await ensureProjectAccess(finalProjectId, auth.userId, auth.role);
      if (!projectAccess.ok) {
        return projectAccess.error;
      }

      finalWorkspaceId = projectAccess.project.workspace.toString();
    } else if (finalWorkspaceId) {
      const workspaceAccess = await ensureWorkspaceAccess(finalWorkspaceId, auth.userId, auth.role);
      if (!workspaceAccess.ok) {
        return workspaceAccess.error;
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Projet ou Workspace requis' },
        { status: 400 }
      );
    }

    const currentObjectiveAssignees = [
      ...(objective.assignees || []),
      ...(objective.assignee ? [objective.assignee] : []),
    ];
    const requestedObjectiveAssignees =
      body.assignees !== undefined
        ? body.assignees
        : Object.prototype.hasOwnProperty.call(body, 'assignee')
          ? body.assignee
            ? [body.assignee]
            : []
          : currentObjectiveAssignees;
    const nextObjectiveAssignees = normalizeAssigneeIds(
      Array.isArray(requestedObjectiveAssignees) ? requestedObjectiveAssignees : []
    );

    if (body.title !== undefined) objective.title = body.title.trim();
    if (body.description !== undefined) objective.description = body.description;
    if (body.priority !== undefined) objective.priority = body.priority;
    if (body.targetDate !== undefined) {
      objective.targetDate = body.targetDate ? new Date(body.targetDate) : undefined;
    }

    objective.project = finalProjectId ? new mongoose.Types.ObjectId(finalProjectId) : undefined;
    objective.workspace = new mongoose.Types.ObjectId(finalWorkspaceId);
    objective.assignees = nextObjectiveAssignees.map((assigneeId) => new mongoose.Types.ObjectId(String(assigneeId)));
    objective.assignee = nextObjectiveAssignees[0]
      ? new mongoose.Types.ObjectId(String(nextObjectiveAssignees[0]))
      : undefined;

    if (body.checkpoints !== undefined) {
      objective.checkpoints = toObjectiveCheckpointDocuments(
        normalizeObjectiveCheckpoints(body.checkpoints, nextObjectiveAssignees)
      );
    }

    await objective.save();
    await syncObjectiveCheckpointTasks(objective, previousCheckpoints);

    const populatedObjective = await populateObjective(id);
    if (!populatedObjective) {
      return NextResponse.json({ success: false, error: 'Objectif non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: formatObjectiveResponse(populatedObjective),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour';
    console.error('Update objective error:', error);
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
      return NextResponse.json({ success: false, error: 'ID de l\'objectif requis' }, { status: 400 });
    }

    const objective = await Objective.findById(id);
    if (!objective) {
      return NextResponse.json({ success: false, error: 'Objectif non trouvé' }, { status: 404 });
    }

    if (objective.project) {
      const projectAccess = await ensureProjectAccess(String(objective.project), auth.userId, auth.role);
      if (!projectAccess.ok) {
        return projectAccess.error;
      }
    } else if (objective.workspace) {
      const workspaceAccess = await ensureWorkspaceAccess(String(objective.workspace), auth.userId, auth.role);
      if (!workspaceAccess.ok) {
        return workspaceAccess.error;
      }
    }

    await deleteObjectiveLinkedTasks(objective._id);
    await objective.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Objectif supprimé',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
    console.error('Delete objective error:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
