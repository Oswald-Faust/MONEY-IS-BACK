import mongoose from 'mongoose';
import AIConversation from '@/models/AIConversation';
import AIMessage from '@/models/AIMessage';
import Project from '@/models/Project';
import User from '@/models/User';
import Workspace from '@/models/Workspace';
import WhatsAppLink from '@/models/WhatsAppLink';
import WhatsAppPendingAction from '@/models/WhatsAppPendingAction';
import { createIdeaFromWhatsApp, createObjectiveFromWhatsApp, createTaskFromWhatsApp } from '@/lib/whatsapp/actions';
import { generateStructuredAI } from '@/lib/ai';
import { normalizePhoneNumber, normalizeWhatsAppUserId, trimToUndefined } from '@/lib/whatsapp/normalize';

type PendingIntent = 'task' | 'objective' | 'idea';

type PendingPayload = {
  title?: string;
  description?: string;
  projectName?: string;
  projectId?: string;
  assigneeName?: string;
  assigneeId?: string;
  dueDate?: string;
  priority?: string;
  checkpoints?: string[];
  tags?: string[];
};

type WhatsAppAIResponse = {
  reply?: string;
  intent?: PendingIntent | 'unknown';
  shouldCreate?: boolean;
  payload?: PendingPayload;
  missingFields?: string[];
};

type WorkspacePerson = {
  _id: string;
  fullName: string;
  email: string;
};

type WorkspaceProject = {
  _id: string;
  name: string;
  color?: string;
  status?: string;
};

export type ProcessWhatsAppMessageInput = {
  workspaceId: string;
  userId: string;
  phone: string;
  waUserId?: string;
  text: string;
  profileName?: string;
  externalMessageId?: string;
  source: 'text' | 'audio' | 'test';
  linkId?: string;
};

export type ProcessWhatsAppMessageResult = {
  success: boolean;
  duplicate?: boolean;
  reply?: string;
  quickReplies?: Array<{ id: string; title: string }>;
  createdEntity?: {
    kind: PendingIntent;
    id: string;
    title: string;
  };
  pending?: {
    kind: PendingIntent;
    missingFields: string[];
  };
  conversationId?: string;
  userMessageId?: string;
  assistantMessageId?: string;
};

function normalizeLabel(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isValidDateInput(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function mergePayload(previous: PendingPayload, next: PendingPayload | undefined): PendingPayload {
  if (!next) return previous;

  return {
    ...previous,
    ...Object.fromEntries(Object.entries(next).filter(([, value]) => value !== undefined)),
    checkpoints:
      next.checkpoints && next.checkpoints.length > 0 ? next.checkpoints : previous.checkpoints,
    tags: next.tags && next.tags.length > 0 ? next.tags : previous.tags,
  };
}

function sanitizeMissingFields(values: string[] | undefined) {
  return Array.from(
    new Set(
      (values || []).filter((value): value is string => typeof value === 'string' && value.length > 0)
    )
  );
}

function formatIsoDate(date: Date) {
  return date.toISOString().split('T')[0];
}

function buildQuickReplies({
  missingFields,
  people,
  projects,
}: {
  missingFields: string[];
  people: WorkspacePerson[];
  projects: WorkspaceProject[];
}) {
  if (missingFields.includes('assignee')) {
    return people.slice(0, 3).map((person) => ({
      id: person.fullName,
      title: person.fullName.slice(0, 20),
    }));
  }

  if (missingFields.includes('project')) {
    return projects.slice(0, 3).map((project) => ({
      id: project.name,
      title: project.name.slice(0, 20),
    }));
  }

  if (missingFields.includes('dueDate')) {
    const today = new Date();
    const dates = [1, 3, 7].map((offset) => {
      const next = new Date(today);
      next.setDate(today.getDate() + offset);
      return formatIsoDate(next);
    });

    return dates.map((date) => ({
      id: date,
      title: date,
    }));
  }

  return [];
}

function sanitizePendingPayload(intent: PendingIntent, payload: PendingPayload, fallbackText: string): PendingPayload {
  const title = trimToUndefined(payload.title) || trimToUndefined(payload.description)?.slice(0, 100);
  const description =
    trimToUndefined(payload.description) ||
    (intent === 'idea' ? fallbackText.trim() : undefined);

  return {
    title,
    description,
    projectName: trimToUndefined(payload.projectName),
    projectId: trimToUndefined(payload.projectId),
    assigneeName: trimToUndefined(payload.assigneeName),
    assigneeId: trimToUndefined(payload.assigneeId),
    dueDate: isValidDateInput(payload.dueDate) ? payload.dueDate : undefined,
    priority: trimToUndefined(payload.priority),
    checkpoints: (payload.checkpoints || [])
      .map((checkpoint) => checkpoint.trim())
      .filter((checkpoint) => checkpoint.length > 0),
    tags: (payload.tags || [])
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0),
  };
}

async function getWorkspaceContext(workspaceId: string, userId: string) {
  const workspace = await Workspace.findById(workspaceId).select('name description aiProfile owner members');
  if (!workspace) {
    throw new Error('Workspace WhatsApp introuvable');
  }

  const memberIds = Array.from(
    new Set([
      workspace.owner.toString(),
      ...workspace.members.map((member) => member.user.toString()),
    ])
  );

  const [users, projects] = await Promise.all([
    User.find({ _id: { $in: memberIds } })
      .select('firstName lastName email')
      .lean(),
    Project.find({
      workspace: workspaceId,
      $or: [{ owner: userId }, { 'members.user': userId }],
    })
      .select('name color status')
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean(),
  ]);

  return {
    workspace,
    people: users.map(
      (user) =>
        ({
          _id: user._id.toString(),
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
        }) satisfies WorkspacePerson
    ),
    projects: projects.map(
      (project) =>
        ({
          _id: project._id.toString(),
          name: project.name,
          color: project.color,
          status: project.status,
        }) satisfies WorkspaceProject
    ),
  };
}

function resolvePersonIdByName(people: WorkspacePerson[], assigneeName?: string) {
  if (!assigneeName) return undefined;

  const normalizedAssignee = normalizeLabel(assigneeName);
  if (!normalizedAssignee) return undefined;

  const exactMatch = people.find((person) => normalizeLabel(person.fullName) === normalizedAssignee);
  if (exactMatch) {
    return exactMatch._id;
  }

  const partialMatch = people.find((person) => normalizeLabel(person.fullName).includes(normalizedAssignee));
  if (partialMatch) {
    return partialMatch._id;
  }

  const emailMatch = people.find((person) => normalizeLabel(person.email).includes(normalizedAssignee));
  return emailMatch?._id;
}

function resolveProjectIdByName(projects: WorkspaceProject[], projectName?: string) {
  if (!projectName) return undefined;

  const normalizedProject = normalizeLabel(projectName);
  if (!normalizedProject) return undefined;

  const exactMatch = projects.find((project) => normalizeLabel(project.name) === normalizedProject);
  if (exactMatch) {
    return exactMatch._id;
  }

  const partialMatch = projects.find((project) => normalizeLabel(project.name).includes(normalizedProject));
  return partialMatch?._id;
}

async function getOrCreateWhatsAppConversation(workspaceId: string, userId: string) {
  let conversation = await AIConversation.findOne({
    workspace: workspaceId,
    creator: userId,
    source: 'whatsapp',
    archived: false,
  }).sort({ updatedAt: -1 });

  if (!conversation) {
    conversation = await AIConversation.create({
      title: 'Assistant WhatsApp',
      workspace: workspaceId,
      creator: userId,
      source: 'whatsapp',
      archived: false,
      context: {
        route: '/whatsapp',
      },
    });
  }

  return conversation;
}

async function buildWhatsAppInstruction({
  workspaceName,
  aiProfile,
  people,
  projects,
  pendingAction,
  text,
}: {
  workspaceName: string;
  aiProfile?: unknown;
  people: WorkspacePerson[];
  projects: WorkspaceProject[];
  pendingAction?: {
    kind: PendingIntent;
    payload: PendingPayload;
    missingFields: string[];
  } | null;
  text: string;
}) {
  const system = [
    'Tu es Edwin WhatsApp Assistant.',
    'Tu transformes des messages WhatsApp courts ou des transcriptions vocales en actions structurées pour Edwin.',
    'Tu retournes uniquement un JSON valide.',
    'Si le message ressemble à une note ou une idée, utilise intent="idea".',
    'Pour une tâche ou un objectif, si la personne assignée ou la date d échéance manquent, laisse shouldCreate=false et pose une question courte.',
    'Si une action est déjà en attente, considère le nouveau message comme une réponse de clarification.',
    'Ne prétends jamais qu une création est déjà faite.',
  ].join(' ');

  const prompt = `
Contexte workspace:
${JSON.stringify(
    {
      workspaceName,
      aiProfile,
      members: people.map((person) => person.fullName),
      projects: projects.map((project) => project.name),
      pendingAction,
    },
    null,
    2
  )}

Message utilisateur:
${text}

Retourne uniquement un JSON avec la structure:
{
  "reply": "string",
  "intent": "task|objective|idea|unknown",
  "shouldCreate": true,
  "payload": {
    "title": "string optionnel",
    "description": "string optionnel",
    "projectName": "string optionnel",
    "assigneeName": "string optionnel",
    "dueDate": "YYYY-MM-DD optionnel",
    "priority": "string optionnel",
    "checkpoints": ["string"],
    "tags": ["string"]
  },
  "missingFields": ["assignee", "dueDate", "project", "title"]
}

Contraintes:
- Réponds en français.
- Si le message est juste une note, capture-la comme une idée exploitable.
- Pour une idée, shouldCreate peut être true sans assignee ni dueDate.
- Pour une tâche ou un objectif, shouldCreate doit être false tant que l assignee ou la date manquent.
- Si le projet n est pas mentionné, il est facultatif.
- Si un champ n est pas certain, laisse-le vide.
`;

  return { system, prompt };
}

async function createEntityFromPayload({
  intent,
  payload,
  workspaceId,
  userId,
}: {
  intent: PendingIntent;
  payload: PendingPayload;
  workspaceId: string;
  userId: string;
}) {
  if (intent === 'task') {
    const task = await createTaskFromWhatsApp({
      workspaceId,
      creatorId: userId,
      title: payload.title || 'Nouvelle tâche WhatsApp',
      description: payload.description,
      projectId: payload.projectId,
      assigneeId: payload.assigneeId!,
      dueDate: payload.dueDate!,
      priority:
        payload.priority === 'important' || payload.priority === 'waiting'
          ? payload.priority
          : 'less_important',
      tags: payload.tags,
    });

    return {
      kind: 'task' as const,
      id: task._id.toString(),
      title: task.title,
    };
  }

  if (intent === 'objective') {
    const objective = await createObjectiveFromWhatsApp({
      workspaceId,
      creatorId: userId,
      title: payload.title || 'Nouvel objectif WhatsApp',
      description: payload.description,
      projectId: payload.projectId,
      assigneeId: payload.assigneeId!,
      dueDate: payload.dueDate!,
      priority:
        payload.priority === 'low' || payload.priority === 'high' ? payload.priority : 'medium',
      checkpoints: payload.checkpoints,
    });

    return {
      kind: 'objective' as const,
      id: objective._id.toString(),
      title: objective.title,
    };
  }

  const idea = await createIdeaFromWhatsApp({
    workspaceId,
    creatorId: userId,
    title: payload.title || 'Nouvelle idée WhatsApp',
    content: payload.description || payload.title || 'Idée ajoutée depuis WhatsApp',
    projectId: payload.projectId,
    assigneeId: payload.assigneeId,
    tags: payload.tags,
  });

  return {
    kind: 'idea' as const,
    id: idea._id.toString(),
    title: idea.title,
  };
}

async function resolveWhatsAppLink(input: {
  workspaceId: string;
  userId: string;
  phone: string;
  waUserId?: string;
  linkId?: string;
}) {
  if (input.linkId) {
    const byId = await WhatsAppLink.findById(input.linkId);
    if (byId) {
      return byId;
    }
  }

  const normalizedPhone = normalizePhoneNumber(input.phone);
  const normalizedWaUserId = input.waUserId ? normalizeWhatsAppUserId(input.waUserId) : undefined;

  let link = await WhatsAppLink.findOne({
    workspace: input.workspaceId,
    $or: [
      { phone: normalizedPhone },
      ...(normalizedWaUserId ? [{ waUserId: normalizedWaUserId }] : []),
    ],
    isActive: true,
  });

  if (!link && process.env.WHATSAPP_DEFAULT_WORKSPACE_ID === input.workspaceId) {
    link = await WhatsAppLink.create({
      workspace: input.workspaceId,
      user: input.userId,
      phone: normalizedPhone,
      waUserId: normalizedWaUserId,
      label: 'Connexion WhatsApp par défaut',
      isActive: true,
    });
  }

  if (!link) {
    throw new Error('Aucun lien WhatsApp trouvé pour ce numéro');
  }

  if (!link.waUserId && normalizedWaUserId) {
    link.waUserId = normalizedWaUserId;
  }
  link.lastInboundAt = new Date();
  await link.save();

  return link;
}

export async function processWhatsAppMessage(
  input: ProcessWhatsAppMessageInput
): Promise<ProcessWhatsAppMessageResult> {
  const text = input.text.trim();
  if (!text) {
    return { success: false, reply: 'Message WhatsApp vide' };
  }

  if (input.externalMessageId) {
    const duplicateMessage = await AIMessage.findOne({
      role: 'user',
      'metadata.whatsappMessageId': input.externalMessageId,
    }).select('_id');

    if (duplicateMessage) {
      return { success: true, duplicate: true };
    }
  }

  const link = await resolveWhatsAppLink({
    workspaceId: input.workspaceId,
    userId: input.userId,
    phone: input.phone,
    waUserId: input.waUserId,
    linkId: input.linkId,
  });

  const conversation = await getOrCreateWhatsAppConversation(input.workspaceId, input.userId);
  const pendingAction = await WhatsAppPendingAction.findOne({
    workspace: input.workspaceId,
    user: input.userId,
    link: link._id,
    status: 'waiting_input',
  }).sort({ updatedAt: -1 });

  const { workspace, people, projects } = await getWorkspaceContext(input.workspaceId, input.userId);
  const instruction = await buildWhatsAppInstruction({
    workspaceName: workspace.name,
    aiProfile: workspace.aiProfile,
    people,
    projects,
    pendingAction: pendingAction
      ? {
          kind: pendingAction.kind,
          payload: pendingAction.payload || {},
          missingFields: pendingAction.missingFields || [],
        }
      : null,
    text,
  });

  const userMessage = await AIMessage.create({
    conversation: conversation._id,
    role: 'user',
    content: text,
    metadata: {
      channel: 'whatsapp',
      whatsappMessageId: input.externalMessageId,
      whatsappPhone: normalizePhoneNumber(input.phone),
      whatsappWaUserId: input.waUserId ? normalizeWhatsAppUserId(input.waUserId) : undefined,
      whatsappSource: input.source,
      whatsappProfileName: input.profileName,
    },
  });

  const aiResult = await generateStructuredAI<WhatsAppAIResponse>({
    system: instruction.system,
    prompt: instruction.prompt,
    temperature: 0.3,
  });

  const intent =
    aiResult.data.intent === 'task' || aiResult.data.intent === 'objective' || aiResult.data.intent === 'idea'
      ? aiResult.data.intent
      : pendingAction?.kind || 'idea';

  const mergedPayload = sanitizePendingPayload(
    intent,
    mergePayload(pendingAction?.payload || {}, aiResult.data.payload),
    text
  );

  const assigneeId = mergedPayload.assigneeId || resolvePersonIdByName(people, mergedPayload.assigneeName);
  const projectId = mergedPayload.projectId || resolveProjectIdByName(projects, mergedPayload.projectName);

  if (assigneeId) {
    mergedPayload.assigneeId = assigneeId;
  }

  if (projectId) {
    mergedPayload.projectId = projectId;
  }

  const missingFields = new Set(sanitizeMissingFields(aiResult.data.missingFields));

  if ((intent === 'task' || intent === 'objective') && !mergedPayload.assigneeId) {
    missingFields.add('assignee');
  }
  if ((intent === 'task' || intent === 'objective') && !mergedPayload.dueDate) {
    missingFields.add('dueDate');
  }
  if (!mergedPayload.title) {
    missingFields.add('title');
  }
  if (mergedPayload.projectName && !mergedPayload.projectId) {
    missingFields.add('project');
  }

  let reply =
    trimToUndefined(aiResult.data.reply) ||
    (missingFields.size > 0
      ? 'J’ai besoin d’une précision avant de l’ajouter dans Edwin.'
      : 'C’est bon, je m’en occupe dans Edwin.');
  let createdEntity: ProcessWhatsAppMessageResult['createdEntity'];
  let quickReplies: ProcessWhatsAppMessageResult['quickReplies'];

  if (missingFields.size > 0) {
    quickReplies = buildQuickReplies({
      missingFields: Array.from(missingFields),
      people,
      projects,
    });
    await WhatsAppPendingAction.findOneAndUpdate(
      {
        workspace: input.workspaceId,
        user: input.userId,
        link: link._id,
        status: 'waiting_input',
      },
      {
        workspace: input.workspaceId,
        user: input.userId,
        link: link._id,
        conversation: conversation._id,
        status: 'waiting_input',
        kind: intent,
        missingFields: Array.from(missingFields),
        payload: mergedPayload,
        lastQuestion: reply,
      },
      { upsert: true, new: true }
    );
  } else {
    createdEntity = await createEntityFromPayload({
      intent,
      payload: mergedPayload,
      workspaceId: input.workspaceId,
      userId: input.userId,
    });

    reply =
      intent === 'task'
        ? `C’est fait. J’ai créé la tâche "${createdEntity.title}" dans Edwin.`
        : intent === 'objective'
          ? `C’est fait. J’ai créé l’objectif "${createdEntity.title}" dans Edwin.`
          : `C’est noté. J’ai ajouté l’idée "${createdEntity.title}" dans Edwin.`;

    if (pendingAction) {
      pendingAction.status = 'completed';
      pendingAction.missingFields = [];
      pendingAction.payload = mergedPayload;
      await pendingAction.save();
    }
  }

  const assistantMessage = await AIMessage.create({
    conversation: conversation._id,
    role: 'assistant',
    content: reply,
    provider: aiResult.provider,
    model: aiResult.model,
    metadata: {
      channel: 'whatsapp',
      pendingAction:
        missingFields.size > 0
          ? {
              kind: intent,
              missingFields: Array.from(missingFields),
            }
          : undefined,
      createdEntity,
    },
  });

  await AIConversation.findByIdAndUpdate(conversation._id, {
    title: createdEntity ? `${createdEntity.kind}: ${createdEntity.title}` : conversation.title,
    lastMessage: {
      role: 'assistant',
      content: reply,
      createdAt: assistantMessage.createdAt,
      provider: aiResult.provider,
    },
    context: {
      ...conversation.context,
      route: '/whatsapp',
      ...(createdEntity?.kind === 'task' ? { task: new mongoose.Types.ObjectId(createdEntity.id) } : {}),
      ...(createdEntity?.kind === 'objective'
        ? { objective: new mongoose.Types.ObjectId(createdEntity.id) }
        : {}),
      ...(createdEntity?.kind === 'idea' ? { idea: new mongoose.Types.ObjectId(createdEntity.id) } : {}),
      ...(mergedPayload.projectId ? { project: new mongoose.Types.ObjectId(mergedPayload.projectId) } : {}),
    },
  });

  return {
    success: true,
    reply,
    quickReplies,
    createdEntity,
    pending:
      missingFields.size > 0
        ? {
            kind: intent,
            missingFields: Array.from(missingFields),
          }
        : undefined,
    conversationId: conversation._id.toString(),
    userMessageId: userMessage._id.toString(),
    assistantMessageId: assistantMessage._id.toString(),
  };
}
