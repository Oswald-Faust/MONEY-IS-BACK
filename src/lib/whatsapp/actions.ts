import mongoose from 'mongoose';
import Idea from '@/models/Idea';
import Objective from '@/models/Objective';
import Task from '@/models/Task';
import Project from '@/models/Project';
import {
  applyTaskProjectCountTransition,
  deriveObjectiveProgress,
  getNextTaskOrder,
  normalizeObjectiveCheckpoints,
  syncObjectiveCheckpointTasks,
} from '@/lib/objective-task-link';

type CreateTaskInput = {
  workspaceId: string;
  creatorId: string;
  title: string;
  description?: string;
  projectId?: string;
  assigneeId: string;
  dueDate: string;
  priority?: 'important' | 'less_important' | 'waiting';
  tags?: string[];
};

type CreateObjectiveInput = {
  workspaceId: string;
  creatorId: string;
  title: string;
  description?: string;
  projectId?: string;
  assigneeId: string;
  dueDate: string;
  priority?: 'low' | 'medium' | 'high';
  checkpoints?: string[];
};

type CreateIdeaInput = {
  workspaceId: string;
  creatorId: string;
  title: string;
  content: string;
  projectId?: string;
  assigneeId?: string;
  tags?: string[];
};

async function getProjectPresentation(projectId?: string) {
  if (!projectId) {
    return {
      projectName: undefined,
      projectColor: undefined,
      workspaceId: undefined,
    };
  }

  const project = await Project.findById(projectId).select('name color workspace');
  if (!project) {
    throw new Error('Projet introuvable pour l’action WhatsApp');
  }

  return {
    projectName: project.name,
    projectColor: project.color,
    workspaceId: project.workspace.toString(),
  };
}

export async function createTaskFromWhatsApp(input: CreateTaskInput) {
  const projectPresentation = await getProjectPresentation(input.projectId);
  const workspaceId = projectPresentation.workspaceId || input.workspaceId;

  const task = await Task.create({
    title: input.title.trim(),
    description: input.description,
    workspace: workspaceId,
    project: input.projectId || undefined,
    projectName: projectPresentation.projectName,
    projectColor: projectPresentation.projectColor,
    creator: input.creatorId,
    assignee: new mongoose.Types.ObjectId(input.assigneeId),
    assignees: [new mongoose.Types.ObjectId(input.assigneeId)],
    priority: input.priority || 'less_important',
    status: 'todo',
    dueDate: new Date(input.dueDate),
    tags: input.tags || [],
    subtasks: [],
    attachments: [],
    comments: [],
    order: await getNextTaskOrder(input.projectId || null, workspaceId),
    source: 'manual',
  });

  await applyTaskProjectCountTransition(null, {
    project: task.project,
    status: task.status,
  });

  await task.populate('project', 'name color');
  await task.populate('assignee', 'firstName lastName avatar');
  await task.populate('assignees', 'firstName lastName avatar');
  await task.populate('creator', 'firstName lastName avatar');

  return task;
}

export async function createObjectiveFromWhatsApp(input: CreateObjectiveInput) {
  const projectPresentation = await getProjectPresentation(input.projectId);
  const workspaceId = projectPresentation.workspaceId || input.workspaceId;
  const normalizedCheckpoints = normalizeObjectiveCheckpoints(
    (input.checkpoints || []).map((title) => ({ title })),
    [input.assigneeId]
  );
  const progressState = deriveObjectiveProgress(normalizedCheckpoints);

  const objective = await Objective.create({
    title: input.title.trim(),
    description: input.description,
    project: input.projectId || undefined,
    workspace: workspaceId,
    creator: input.creatorId,
    priority: input.priority || 'medium',
    status: normalizedCheckpoints.length > 0 ? progressState.status : 'not_started',
    targetDate: new Date(input.dueDate),
    checkpoints: normalizedCheckpoints,
    assignee: new mongoose.Types.ObjectId(input.assigneeId),
    assignees: [new mongoose.Types.ObjectId(input.assigneeId)],
    progress: normalizedCheckpoints.length > 0 ? progressState.progress : 0,
  });

  await syncObjectiveCheckpointTasks(objective, []);
  await objective.populate('project', 'name color');
  await objective.populate('creator', 'firstName lastName avatar');
  await objective.populate('assignee', 'firstName lastName avatar');
  await objective.populate('assignees', 'firstName lastName avatar');
  await objective.populate('checkpoints.assignee', 'firstName lastName avatar');
  await objective.populate('checkpoints.assignees', 'firstName lastName avatar');

  return objective;
}

export async function createIdeaFromWhatsApp(input: CreateIdeaInput) {
  const projectPresentation = await getProjectPresentation(input.projectId);
  const workspaceId = projectPresentation.workspaceId || input.workspaceId;
  const assignees = input.assigneeId ? [new mongoose.Types.ObjectId(input.assigneeId)] : [];

  const idea = await Idea.create({
    title: input.title.trim(),
    content: input.content.trim(),
    project: input.projectId || undefined,
    workspace: workspaceId,
    creator: input.creatorId,
    status: 'raw',
    tags: input.tags || [],
    attachments: [],
    votes: [],
    comments: [],
    assignee: assignees[0],
    assignees,
  });

  await idea.populate('creator', 'firstName lastName avatar');
  await idea.populate('assignee', 'firstName lastName avatar');
  await idea.populate('assignees', 'firstName lastName avatar');
  await idea.populate('project', 'name color');

  return idea;
}
