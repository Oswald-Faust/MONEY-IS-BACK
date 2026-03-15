import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import AIMessage from '@/models/AIMessage';
import AIConversation from '@/models/AIConversation';
import Project from '@/models/Project';
import { ensureConversationAccess } from '@/lib/ai/access';
import { generateAssistantReply } from '@/lib/ai';
import { createProjectForWorkspace } from '@/lib/projects/create-project';

function normalizeConversationTitle(input?: string) {
  if (!input) return undefined;
  return input.trim().slice(0, 80);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildProjectSuggestedActions(projectId: string) {
  return [
    {
      label: 'Voir le projet',
      kind: 'open_project' as const,
      projectId,
    },
    {
      label: 'Ajouter une tâche au projet',
      kind: 'open_task_modal' as const,
      projectId,
    },
    {
      label: 'Définir un objectif pour ce projet',
      kind: 'open_objective_generator' as const,
      projectId,
    },
  ];
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorise' }, { status: 401 });
    }

    const { id } = await params;
    const access = await ensureConversationAccess(id, auth.userId, auth.role);
    if (!access.ok) {
      return access.error;
    }

    const messages = await AIMessage.find({ conversation: id }).sort({ createdAt: 1 }).lean();

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching AI messages:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recuperation des messages IA' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorise' }, { status: 401 });
    }

    const { id } = await params;
    const access = await ensureConversationAccess(id, auth.userId, auth.role);
    if (!access.ok) {
      return access.error;
    }

    const body = await request.json();
    const content = String(body.content || '').trim();
    const pageContext = body.pageContext || {};

    if (!content) {
      return NextResponse.json({ success: false, error: 'Message requis' }, { status: 400 });
    }

    const userMessage = await AIMessage.create({
      conversation: id,
      role: 'user',
      content,
    });

    const history = await AIMessage.find({ conversation: id })
      .sort({ createdAt: 1 })
      .limit(12)
      .lean();

    const assistantReply = await generateAssistantReply({
      workspaceId: access.workspace._id.toString(),
      route: pageContext.route || access.conversation.context?.route,
      projectId: pageContext.projectId || access.conversation.context?.project?.toString(),
      objectiveId: pageContext.objectiveId || access.conversation.context?.objective?.toString(),
      taskId: pageContext.taskId || access.conversation.context?.task?.toString(),
      ideaId: pageContext.ideaId || access.conversation.context?.idea?.toString(),
      prompt: content,
      conversationHistory: history.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    });

    let executedAction:
      | {
          kind: 'create_project';
          status: 'created' | 'already_exists' | 'failed';
          project?: unknown;
          error?: string;
        }
      | undefined;

    if (assistantReply.requestedAction?.kind === 'create_project') {
      const requestedName = assistantReply.requestedAction.name.trim();
      const existingProjectQuery = {
        workspace: access.workspace._id,
        name: { $regex: new RegExp(`^${escapeRegex(requestedName)}$`, 'i') },
        ...(auth.role === 'admin'
          ? {}
          : {
              $or: [{ owner: auth.userId }, { 'members.user': auth.userId }],
            }),
      };
      const existingProject = await Project.findOne(existingProjectQuery)
        .populate('owner', 'firstName lastName avatar')
        .lean();

      if (existingProject) {
        executedAction = {
          kind: 'create_project',
          status: 'already_exists',
          project: existingProject,
        };
        assistantReply.reply = `Le projet "${existingProject.name}" existe déjà dans votre espace de travail. Je ne l’ai pas recréé.`;
        assistantReply.summary = `Projet existant: ${existingProject.name}`;
        assistantReply.suggestedActions = buildProjectSuggestedActions(String(existingProject._id));
      } else {
        try {
          const { project } = await createProjectForWorkspace({
            userId: auth.userId,
            role: auth.role,
            workspaceId: access.workspace._id.toString(),
            name: assistantReply.requestedAction.name,
            description: assistantReply.requestedAction.description,
            color: assistantReply.requestedAction.color,
            icon: assistantReply.requestedAction.icon,
          });

          executedAction = {
            kind: 'create_project',
            status: 'created',
            project: project.toObject(),
          };
          assistantReply.reply = `Le projet "${project.name}" a été créé avec succès dans votre espace de travail. Vous le verrez maintenant dans Mes Projets.`;
          assistantReply.summary = `Projet créé: ${project.name}`;
          assistantReply.suggestedActions = buildProjectSuggestedActions(project._id.toString());
        } catch (actionError) {
          const message =
            actionError instanceof Error
              ? actionError.message
              : 'Erreur lors de la création du projet';

          executedAction = {
            kind: 'create_project',
            status: 'failed',
            error: message,
          };
          assistantReply.reply = `Je n’ai pas pu créer le projet "${requestedName}". Raison: ${message}.`;
          assistantReply.summary = `Échec création projet: ${requestedName}`;
          assistantReply.suggestedActions = [
            {
              label: 'Voir tous les projets',
              kind: 'open_projects',
            },
          ];
        }
      }
    }

    const assistantMessage = await AIMessage.create({
      conversation: id,
      role: 'assistant',
      content: assistantReply.reply,
      provider: assistantReply.provider,
      model: assistantReply.model,
      metadata: {
        summary: assistantReply.summary,
        suggestedActions: assistantReply.suggestedActions,
        requestedAction: assistantReply.requestedAction,
        executedAction,
      },
    });

    const nextTitle =
      normalizeConversationTitle(assistantReply.suggestedTitle) ||
      access.conversation.title ||
      normalizeConversationTitle(content) ||
      'Conversation IA';

    await AIConversation.findByIdAndUpdate(id, {
      title: nextTitle,
      context: {
        ...access.conversation.context,
        route: pageContext.route || access.conversation.context?.route,
        project:
          (executedAction?.kind === 'create_project' &&
          executedAction.status !== 'failed' &&
          executedAction.project &&
          typeof executedAction.project === 'object' &&
          '_id' in executedAction.project
            ? String(executedAction.project._id)
            : pageContext.projectId) || access.conversation.context?.project,
        objective: pageContext.objectiveId || access.conversation.context?.objective,
        task: pageContext.taskId || access.conversation.context?.task,
        idea: pageContext.ideaId || access.conversation.context?.idea,
      },
      lastMessage: {
        role: 'assistant',
        content: assistantReply.reply,
        createdAt: assistantMessage.createdAt,
        provider: assistantReply.provider,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        conversationId: id,
        userMessage,
        assistantMessage,
      },
    });
  } catch (error) {
    console.error('Error sending AI message:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l envoi du message IA' },
      { status: 500 }
    );
  }
}
