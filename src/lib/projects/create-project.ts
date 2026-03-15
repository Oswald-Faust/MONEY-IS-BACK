import Project, { IProject } from '@/models/Project';
import Workspace, { IWorkspace } from '@/models/Workspace';
import GlobalSettings from '@/models/GlobalSettings';
import { PLAN_LIMITS } from '@/lib/limits';

interface CreateProjectInput {
  userId: string;
  role?: string;
  workspaceId: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  securePassword?: string;
}

interface CreateProjectResult {
  workspace: IWorkspace;
  project: IProject;
}

function isWorkspaceMember(workspace: IWorkspace, userId: string) {
  return (
    workspace.owner.toString() === userId ||
    workspace.members.some((member) => member.user.toString() === userId)
  );
}

export async function createProjectForWorkspace({
  userId,
  role,
  workspaceId,
  name,
  description,
  color,
  icon,
  securePassword,
}: CreateProjectInput): Promise<CreateProjectResult> {
  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new Error('Nom du projet requis');
  }

  if (role !== 'admin') {
    const settings = await GlobalSettings.findOne();
    if (settings && settings.permissions.createProject === false) {
      throw new Error(
        'La création de projet est temporairement désactivée pour les utilisateurs standard.'
      );
    }
  }

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    throw new Error('Workspace non trouvé');
  }

  if (!isWorkspaceMember(workspace, userId) && role !== 'admin') {
    throw new Error('Accès refusé');
  }

  const projectCount = await Project.countDocuments({ workspace: workspaceId });
  const limit = PLAN_LIMITS[workspace.subscriptionPlan as keyof typeof PLAN_LIMITS]?.maxProjects || 0;

  if (projectCount >= limit) {
    throw new Error(
      `Limite de projets atteinte pour le plan ${workspace.subscriptionPlan}. Veuillez passer au plan supérieur.`
    );
  }

  const project = await Project.create({
    name: normalizedName,
    description,
    color: color || workspace.settings?.defaultProjectColor || '#6366f1',
    icon: icon || 'folder',
    workspace: workspaceId,
    owner: userId,
    members: [{ user: userId, role: 'admin', joinedAt: new Date() }],
    status: 'active',
    securePassword: securePassword || undefined,
    tasksCount: 0,
    completedTasksCount: 0,
  });

  await project.populate('owner', 'firstName lastName avatar');

  return {
    workspace,
    project,
  };
}
