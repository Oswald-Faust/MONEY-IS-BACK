import mongoose from 'mongoose';
import Objective, { type IObjective } from '@/models/Objective';
import Project from '@/models/Project';
import Task, { type ITask, type TaskPriority, type TaskStatus } from '@/models/Task';

type CheckpointInput = {
  id?: string;
  title?: string;
  completed?: boolean;
  priority?: TaskPriority;
  dueDate?: Date | string | null;
  assignee?: mongoose.Types.ObjectId | string | null;
  assignees?: Array<mongoose.Types.ObjectId | string>;
  task?: mongoose.Types.ObjectId | string | null;
};

type CheckpointSnapshot = {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: Date;
  assignee?: string | null;
  assignees: string[];
  task?: string | null;
};

type ProjectCountState = {
  project?: mongoose.Types.ObjectId | string | null;
  status?: TaskStatus;
};

type PopulatedObjectiveProject = {
  name?: string;
  color?: string;
  workspace?: mongoose.Types.ObjectId | string;
};

const DEFAULT_CHECKPOINT_PRIORITY: TaskPriority = 'less_important';

function toObjectIdString(
  value: mongoose.Types.ObjectId | string | { _id?: mongoose.Types.ObjectId | string } | null | undefined
): string | null {
  if (!value) return null;

  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof mongoose.Types.ObjectId) {
    return value.toString();
  }

  if (typeof value === 'object' && '_id' in value) {
    return toObjectIdString(value._id ?? null);
  }

  return null;
}

function uniqueObjectIds(
  values: Array<mongoose.Types.ObjectId | string | { _id?: mongoose.Types.ObjectId | string } | null | undefined>
): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => toObjectIdString(value))
        .filter((value): value is string => Boolean(value))
    )
  );
}

function parseDate(value: Date | string | null | undefined): Date | undefined {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

export function normalizeObjectiveCheckpoints(
  checkpoints: CheckpointInput[] = [],
  defaultAssignees: Array<mongoose.Types.ObjectId | string> = []
) {
  const fallbackAssignees = uniqueObjectIds(defaultAssignees);

  return checkpoints
    .map((checkpoint) => {
      const checkpointAssignees = uniqueObjectIds(
        checkpoint.assignees && checkpoint.assignees.length > 0
          ? checkpoint.assignees
          : checkpoint.assignee
            ? [checkpoint.assignee]
            : fallbackAssignees
      );

      const taskId = toObjectIdString(checkpoint.task);

      return {
        id: checkpoint.id?.trim() || new mongoose.Types.ObjectId().toString(),
        title: checkpoint.title?.trim() || '',
        completed: Boolean(checkpoint.completed),
        priority: checkpoint.priority || DEFAULT_CHECKPOINT_PRIORITY,
        dueDate: parseDate(checkpoint.dueDate),
        assignee: checkpointAssignees[0],
        assignees: checkpointAssignees,
        task: taskId || undefined,
      };
    })
    .filter((checkpoint) => checkpoint.title.length > 0);
}

export function snapshotObjectiveCheckpoints(objective: IObjective): CheckpointSnapshot[] {
  return objective.checkpoints.map((checkpoint) => {
    const assignees = uniqueObjectIds(
      checkpoint.assignees?.length ? checkpoint.assignees : checkpoint.assignee ? [checkpoint.assignee] : []
    );

    return {
      id: checkpoint.id,
      title: checkpoint.title,
      completed: checkpoint.completed,
      priority: checkpoint.priority || DEFAULT_CHECKPOINT_PRIORITY,
      dueDate: checkpoint.dueDate ? new Date(checkpoint.dueDate) : undefined,
      assignee: assignees[0] || null,
      assignees,
      task: toObjectIdString(checkpoint.task),
    };
  });
}

export function deriveObjectiveProgress(checkpoints: Array<{ completed: boolean }>) {
  if (checkpoints.length === 0) {
    return {
      progress: 0,
      status: 'not_started' as const,
    };
  }

  const completedCount = checkpoints.filter((checkpoint) => checkpoint.completed).length;
  const progress = Math.round((completedCount / checkpoints.length) * 100);

  if (progress === 100) {
    return {
      progress,
      status: 'completed' as const,
    };
  }

  if (progress > 0) {
    return {
      progress,
      status: 'in_progress' as const,
    };
  }

  return {
    progress,
    status: 'not_started' as const,
  };
}

export async function applyTaskProjectCountTransition(previous: ProjectCountState | null, next: ProjectCountState | null) {
  const previousProjectId = toObjectIdString(previous?.project ?? null);
  const nextProjectId = toObjectIdString(next?.project ?? null);
  const previousDone = previous?.status === 'done';
  const nextDone = next?.status === 'done';

  if (previousProjectId && previousProjectId === nextProjectId) {
    if (previousDone === nextDone) {
      return;
    }

    await Project.findByIdAndUpdate(previousProjectId, {
      $inc: { completedTasksCount: nextDone ? 1 : -1 },
    });
    return;
  }

  if (previousProjectId) {
    const previousUpdate: Record<string, number> = { tasksCount: -1 };
    if (previousDone) {
      previousUpdate.completedTasksCount = -1;
    }

    await Project.findByIdAndUpdate(previousProjectId, {
      $inc: previousUpdate,
    });
  }

  if (nextProjectId) {
    const nextUpdate: Record<string, number> = { tasksCount: 1 };
    if (nextDone) {
      nextUpdate.completedTasksCount = 1;
    }

    await Project.findByIdAndUpdate(nextProjectId, {
      $inc: nextUpdate,
    });
  }
}

async function resolveObjectiveContext(objective: IObjective) {
  const projectId = toObjectIdString(objective.project);
  let workspaceId = toObjectIdString(objective.workspace);
  let projectName: string | undefined;
  let projectColor: string | undefined;

  const populatedProject =
    objective.project && typeof objective.project === 'object' && 'name' in objective.project
      ? (objective.project as PopulatedObjectiveProject)
      : null;

  if (populatedProject) {
    projectName = populatedProject.name;
    projectColor = populatedProject.color;
    workspaceId = workspaceId || toObjectIdString(populatedProject.workspace);
  }

  if (projectId && (!projectName || !projectColor || !workspaceId)) {
    const project = await Project.findById(projectId).select('name color workspace');
    if (!project) {
      throw new Error('Projet non trouve');
    }

    projectName = project.name;
    projectColor = project.color;
    workspaceId = workspaceId || toObjectIdString(project.workspace);
  }

  if (!workspaceId) {
    throw new Error('Workspace requis pour synchroniser les checkpoints');
  }

  return {
    projectId,
    projectName,
    projectColor,
    workspaceId,
  };
}

export async function getNextTaskOrder(projectId: string | null, workspaceId: string) {
  const scope = projectId
    ? { project: projectId }
    : {
        workspace: workspaceId,
        $or: [{ project: { $exists: false } }, { project: null }],
      };

  const latestTask = await Task.findOne(scope).sort({ order: -1 }).select('order');
  return latestTask ? latestTask.order + 1 : 0;
}

function toTaskAssignees(checkpoint: {
  assignees?: Array<mongoose.Types.ObjectId | string>;
  assignee?: mongoose.Types.ObjectId | string | null;
}) {
  const assignees = uniqueObjectIds(
    checkpoint.assignees?.length ? checkpoint.assignees : checkpoint.assignee ? [checkpoint.assignee] : []
  );

  return {
    assignee: assignees[0],
    assignees,
  };
}

async function buildCheckpointTaskPayload(
  objective: IObjective,
  checkpoint: {
    id: string;
    title: string;
    completed: boolean;
    priority?: TaskPriority;
    dueDate?: Date;
    assignee?: mongoose.Types.ObjectId | string | null;
    assignees?: Array<mongoose.Types.ObjectId | string>;
  }
) {
  const context = await resolveObjectiveContext(objective);
  const assigneeInfo = toTaskAssignees(checkpoint);

  return {
    title: checkpoint.title,
    workspace: context.workspaceId,
    project: context.projectId || undefined,
    projectName: context.projectName,
    projectColor: context.projectColor,
    objective: objective._id,
    objectiveCheckpointId: checkpoint.id,
    source: 'objective_checkpoint' as const,
    priority: checkpoint.priority || DEFAULT_CHECKPOINT_PRIORITY,
    status: checkpoint.completed ? ('done' as const) : ('todo' as const),
    dueDate: checkpoint.dueDate,
    assignee: assigneeInfo.assignee,
    assignees: assigneeInfo.assignees,
    creator: objective.creator,
  };
}

export async function syncObjectiveCheckpointTasks(
  objective: IObjective,
  previousCheckpoints: CheckpointSnapshot[] = []
) {
  const previousCheckpointMap = new Map(previousCheckpoints.map((checkpoint) => [checkpoint.id, checkpoint]));
  const currentCheckpointIds = new Set(objective.checkpoints.map((checkpoint) => checkpoint.id));

  for (const previousCheckpoint of previousCheckpoints) {
    if (currentCheckpointIds.has(previousCheckpoint.id)) {
      continue;
    }

    const linkedTasks = previousCheckpoint.task
      ? await Task.find({ _id: previousCheckpoint.task })
      : await Task.find({
          objective: objective._id,
          objectiveCheckpointId: previousCheckpoint.id,
        });

    for (const linkedTask of linkedTasks) {
      await applyTaskProjectCountTransition(
        { project: linkedTask.project, status: linkedTask.status },
        null
      );
      await linkedTask.deleteOne();
    }
  }

  for (const checkpoint of objective.checkpoints) {
    const previousCheckpoint = previousCheckpointMap.get(checkpoint.id);
    const existingTaskId = toObjectIdString(checkpoint.task) || previousCheckpoint?.task || null;
    let linkedTask =
      existingTaskId ? await Task.findById(existingTaskId) : await Task.findOne({
        objective: objective._id,
        objectiveCheckpointId: checkpoint.id,
      });

    const taskPayload = await buildCheckpointTaskPayload(objective, checkpoint);

    if (linkedTask) {
      const previousState = {
        project: linkedTask.project,
        status: linkedTask.status,
      };

      linkedTask.title = taskPayload.title;
      linkedTask.workspace = new mongoose.Types.ObjectId(taskPayload.workspace);
      linkedTask.project = taskPayload.project ? new mongoose.Types.ObjectId(taskPayload.project) : undefined;
      linkedTask.projectName = taskPayload.projectName;
      linkedTask.projectColor = taskPayload.projectColor;
      linkedTask.objective = new mongoose.Types.ObjectId(objective._id);
      linkedTask.objectiveCheckpointId = taskPayload.objectiveCheckpointId;
      linkedTask.source = taskPayload.source;
      linkedTask.priority = taskPayload.priority;
      linkedTask.status = taskPayload.status;
      linkedTask.dueDate = taskPayload.dueDate;
      linkedTask.assignee = taskPayload.assignee ? new mongoose.Types.ObjectId(taskPayload.assignee) : undefined;
      linkedTask.assignees = taskPayload.assignees.map((assignee) => new mongoose.Types.ObjectId(assignee));

      await linkedTask.save();
      await applyTaskProjectCountTransition(previousState, {
        project: linkedTask.project,
        status: linkedTask.status,
      });
    } else {
      const order = await getNextTaskOrder(taskPayload.project || null, taskPayload.workspace);
      linkedTask = await Task.create({
        ...taskPayload,
        description: `Checkpoint de l'objectif "${objective.title}"`,
        tags: [],
        subtasks: [],
        attachments: [],
        comments: [],
        order,
      });

      await applyTaskProjectCountTransition(null, {
        project: linkedTask.project,
        status: linkedTask.status,
      });
    }

    checkpoint.task = linkedTask._id;
    checkpoint.priority = linkedTask.priority;
    checkpoint.completed = linkedTask.status === 'done';
    checkpoint.dueDate = linkedTask.dueDate;
    checkpoint.assignee = linkedTask.assignee;
    checkpoint.assignees = linkedTask.assignees;
  }

  const progressState = deriveObjectiveProgress(objective.checkpoints);
  objective.progress = progressState.progress;
  objective.status = progressState.status;
  objective.markModified('checkpoints');
  await objective.save();

  return objective;
}

export async function deleteObjectiveLinkedTasks(objectiveId: mongoose.Types.ObjectId | string) {
  const linkedTasks = await Task.find({ objective: objectiveId });

  for (const linkedTask of linkedTasks) {
    await applyTaskProjectCountTransition(
      { project: linkedTask.project, status: linkedTask.status },
      null
    );
    await linkedTask.deleteOne();
  }
}

export async function syncObjectiveCheckpointFromTask(task: ITask) {
  if (!task.objective || !task.objectiveCheckpointId) {
    return null;
  }

  const objective = await Objective.findById(task.objective);
  if (!objective) {
    return null;
  }

  const checkpoint = objective.checkpoints.find(
    (item) => item.id === task.objectiveCheckpointId
  );

  if (!checkpoint) {
    return null;
  }

  checkpoint.title = task.title;
  checkpoint.completed = task.status === 'done';
  checkpoint.priority = task.priority;
  checkpoint.dueDate = task.dueDate;
  checkpoint.assignee = task.assignee;
  checkpoint.assignees = task.assignees;
  checkpoint.task = task._id;

  const progressState = deriveObjectiveProgress(objective.checkpoints);
  objective.progress = progressState.progress;
  objective.status = progressState.status;
  objective.markModified('checkpoints');
  await objective.save();

  return objective;
}
