import Workspace from '@/models/Workspace';
import Project from '@/models/Project';
import Objective from '@/models/Objective';
import Task from '@/models/Task';
import Idea from '@/models/Idea';

interface BuildAIContextParams {
  workspaceId: string;
  projectId?: string | null;
  objectiveId?: string | null;
  taskId?: string | null;
  ideaId?: string | null;
  route?: string;
}

export async function buildAIContext({
  workspaceId,
  projectId,
  objectiveId,
  taskId,
  ideaId,
  route,
}: BuildAIContextParams) {
  const workspacePromise = Workspace.findById(workspaceId)
    .select('name description useCase aiProfile settings.defaultProjectColor')
    .lean();

  const projectPromise = projectId
    ? Project.findById(projectId)
        .select('name description status tasksCount completedTasksCount color')
        .lean()
    : null;

  const objectivePromise = objectiveId
    ? Objective.findById(objectiveId)
        .select('title description progress priority status targetDate checkpoints')
        .lean()
    : null;

  const taskPromise = taskId
    ? Task.findById(taskId)
        .select('title description status priority dueDate tags')
        .lean()
    : null;

  const ideaPromise = ideaId
    ? Idea.findById(ideaId)
        .select('title content status tags')
        .lean()
    : null;

  const recentTasksPromise = Task.find(
    projectId
      ? { project: projectId }
      : {
          $or: [{ workspace: workspaceId }, { project: { $exists: false }, workspace: workspaceId }],
        }
  )
    .select('title status priority dueDate objectiveTitle')
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  const recentObjectivesPromise = Objective.find(
    projectId
      ? { project: projectId }
      : {
          $or: [{ workspace: workspaceId }, { project: { $exists: false }, workspace: workspaceId }],
        }
  )
    .select('title progress priority status targetDate')
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  const projectOverviewPromise = Project.find({ workspace: workspaceId })
    .select('name status tasksCount completedTasksCount')
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  const projectStatusesPromise = Project.find({ workspace: workspaceId }).select('status').lean();

  const [
    workspace,
    project,
    objective,
    task,
    idea,
    recentTasks,
    recentObjectives,
    projectOverview,
    projectStatuses,
  ] = await Promise.all([
    workspacePromise,
    projectPromise,
    objectivePromise,
    taskPromise,
    ideaPromise,
    recentTasksPromise,
    recentObjectivesPromise,
    projectOverviewPromise,
    projectStatusesPromise,
  ]);

  const projectCounts = projectStatuses.reduce(
    (counts, item) => {
      counts.total += 1;
      if (item.status === 'active') counts.active += 1;
      if (item.status === 'paused') counts.paused += 1;
      if (item.status === 'archived') counts.archived += 1;
      return counts;
    },
    { total: 0, active: 0, paused: 0, archived: 0 }
  );

  return {
    route,
    workspace: workspace
      ? {
          name: workspace.name,
          description: workspace.description,
          useCase: workspace.useCase,
          aiProfile: workspace.aiProfile || null,
        }
      : null,
    project: project
      ? {
          name: project.name,
          description: project.description,
          status: project.status,
          tasksCount: project.tasksCount,
          completedTasksCount: project.completedTasksCount,
          color: project.color,
        }
      : null,
    objective: objective
      ? {
          title: objective.title,
          description: objective.description,
          progress: objective.progress,
          priority: objective.priority,
          status: objective.status,
          targetDate: objective.targetDate,
          checkpointCount: objective.checkpoints?.length || 0,
        }
      : null,
    task: task
      ? {
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
          tags: task.tags,
        }
      : null,
    idea: idea
      ? {
          title: idea.title,
          content: idea.content,
          status: idea.status,
          tags: idea.tags,
        }
      : null,
    recentTasks: recentTasks.map((item) => ({
      title: item.title,
      status: item.status,
      priority: item.priority,
      dueDate: item.dueDate,
      objectiveTitle: item.objectiveTitle,
    })),
    recentObjectives: recentObjectives.map((item) => ({
      title: item.title,
      progress: item.progress,
      priority: item.priority,
      status: item.status,
      targetDate: item.targetDate,
    })),
    recentProjects: projectOverview.map((item) => ({
      name: item.name,
      status: item.status,
      tasksCount: item.tasksCount,
      completedTasksCount: item.completedTasksCount,
    })),
    projectCounts,
  };
}
