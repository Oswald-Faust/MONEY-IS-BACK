import { buildAIContext } from './context';

type AIProvider = 'openai' | 'gemini';

interface AITextResult {
  text: string;
  provider: AIProvider;
  model: string;
}

interface ObjectiveGenerationInput {
  workspaceId: string;
  projectId?: string | null;
  title?: string;
  description?: string;
  prompt?: string;
}

interface AssistantReplyInput {
  workspaceId: string;
  route?: string;
  projectId?: string | null;
  objectiveId?: string | null;
  taskId?: string | null;
  ideaId?: string | null;
  prompt: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
}

export type AssistantSuggestedActionKind =
  | 'open_objective_generator'
  | 'open_task_modal'
  | 'open_objectives'
  | 'open_tasks'
  | 'open_projects'
  | 'open_project';

export interface AssistantSuggestedAction {
  label: string;
  kind: AssistantSuggestedActionKind;
  projectId?: string;
}

export interface AssistantRequestedAction {
  kind: 'create_project';
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

interface ObjectiveDraftCheckpoint {
  title: string;
  priority: 'important' | 'less_important' | 'waiting';
  dueDate?: string;
}

export interface ObjectiveDraftResult {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  targetDate?: string;
  checkpoints: ObjectiveDraftCheckpoint[];
  followUpQuestions: string[];
  provider: AIProvider;
  model: string;
}

export interface AssistantReplyResult {
  reply: string;
  summary?: string;
  suggestedTitle?: string;
  suggestedActions: AssistantSuggestedAction[];
  requestedAction?: AssistantRequestedAction;
  provider: AIProvider;
  model: string;
}

function extractJson(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('Réponse IA vide');
  }

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed);
  }

  const fenced = trimmed.match(/```json\s*([\s\S]*?)```/i) || trimmed.match(/```\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return JSON.parse(fenced[1].trim());
  }

  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }

  throw new Error('Impossible de parser la réponse IA en JSON');
}

async function callOpenAI({
  system,
  prompt,
  temperature = 0.6,
  jsonMode = false,
}: {
  system: string;
  prompt: string;
  temperature?: number;
  jsonMode?: boolean;
}): Promise<AITextResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY manquant');
  }

  const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      response_format: jsonMode ? { type: 'json_object' } : undefined,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Erreur OpenAI');
  }

  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('Réponse OpenAI vide');
  }

  return {
    text,
    provider: 'openai',
    model,
  };
}

async function callGemini({
  system,
  prompt,
  temperature = 0.6,
  jsonMode = false,
}: {
  system: string;
  prompt: string;
  temperature?: number;
  jsonMode?: boolean;
}): Promise<AITextResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY manquant');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${system}\n\n${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature,
          responseMimeType: jsonMode ? 'application/json' : 'text/plain',
        },
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Erreur Gemini');
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Réponse Gemini vide');
  }

  return {
    text,
    provider: 'gemini',
    model,
  };
}

async function runAI({
  system,
  prompt,
  temperature = 0.6,
  jsonMode = false,
}: {
  system: string;
  prompt: string;
  temperature?: number;
  jsonMode?: boolean;
}) {
  try {
    return await callOpenAI({ system, prompt, temperature, jsonMode });
  } catch (openAiError) {
    console.error('OpenAI failed, fallback Gemini:', openAiError);
    return await callGemini({ system, prompt, temperature, jsonMode });
  }
}

export async function generateStructuredAI<T>({
  system,
  prompt,
  temperature = 0.4,
}: {
  system: string;
  prompt: string;
  temperature?: number;
}): Promise<{ data: T; provider: AIProvider; model: string }> {
  const result = await runAI({
    system,
    prompt,
    jsonMode: true,
    temperature,
  });

  return {
    data: extractJson(result.text) as T,
    provider: result.provider,
    model: result.model,
  };
}

export async function generateObjectiveDraft({
  workspaceId,
  projectId,
  title,
  description,
  prompt,
}: ObjectiveGenerationInput): Promise<ObjectiveDraftResult> {
  const context = await buildAIContext({
    workspaceId,
    projectId,
    route: projectId ? '/projects/[id]/objectives' : '/objectives',
  });

  const system = [
    'Tu es Edwin AI, un assistant produit integre a une plateforme de gestion de projet.',
    'Ta mission est d aider des entrepreneurs tres occupes qui ne veulent pas apprendre des outils complexes.',
    'Tu rediges en francais, de maniere claire, concrete et actionnable.',
    'Tu dois retourner uniquement un JSON valide.',
  ].join(' ');

  const userPrompt = `
Contexte plateforme:
${JSON.stringify(context, null, 2)}

Demande utilisateur:
${JSON.stringify(
    {
      title: title || '',
      description: description || '',
      prompt: prompt || '',
    },
    null,
    2
  )}

Retourne uniquement un JSON avec la structure suivante:
{
  "title": "string",
  "description": "string",
  "priority": "low|medium|high",
  "targetDate": "YYYY-MM-DD ou chaine vide",
  "checkpoints": [
    {
      "title": "string",
      "priority": "important|less_important|waiting",
      "dueDate": "YYYY-MM-DD ou chaine vide"
    }
  ],
  "followUpQuestions": ["string"]
}

Contraintes:
- 3 a 7 checkpoints maximum.
- Pas de jargon inutile.
- La description doit etre utile telle quelle dans un objectif Edwin.
- Si la date n est pas claire, laisse "targetDate" vide.
- Les checkpoints doivent etre orientes execution.
`;

  const result = await runAI({
    system,
    prompt: userPrompt,
    jsonMode: true,
    temperature: 0.4,
  });

  const parsed = extractJson(result.text) as Omit<ObjectiveDraftResult, 'provider' | 'model'>;

  return {
    title: parsed.title || title || 'Nouvel objectif',
    description: parsed.description || description || '',
    priority: parsed.priority || 'medium',
    targetDate: parsed.targetDate || undefined,
    checkpoints: Array.isArray(parsed.checkpoints) ? parsed.checkpoints.slice(0, 7) : [],
    followUpQuestions: Array.isArray(parsed.followUpQuestions) ? parsed.followUpQuestions.slice(0, 4) : [],
    provider: result.provider,
    model: result.model,
  };
}

export interface SearchInsightResult {
  reply: string;
  provider: AIProvider;
  model: string;
}

export async function generateSearchInsight({
  workspaceId,
  query,
}: {
  workspaceId: string;
  query: string;
}): Promise<SearchInsightResult> {
  const context = await buildAIContext({ workspaceId });

  const system = [
    'Tu es Edwin AI, un assistant de recherche integre a Edwin.',
    'L utilisateur fait une recherche dans son workspace.',
    'Reponds de facon concise (1-3 phrases max), directe, en francais.',
    'Tu retournes uniquement un JSON valide.',
  ].join(' ');

  const userPrompt = `
Contexte workspace:
${JSON.stringify(context, null, 2)}

Requête de l'utilisateur: "${query}"

Sur la base du contexte workspace disponible, donne une réponse intelligente et utile à cette recherche/question.
Mentionne des éléments concrets présents dans le workspace si pertinent.

Retourne uniquement: { "reply": "string" }
`;

  const result = await runAI({ system, prompt: userPrompt, jsonMode: true, temperature: 0.3 });
  const parsed = extractJson(result.text);

  return {
    reply: typeof parsed.reply === 'string' ? parsed.reply : 'Je n\'ai pas trouvé de résultats correspondants.',
    provider: result.provider,
    model: result.model,
  };
}

export async function generateAssistantReply({
  workspaceId,
  route,
  projectId,
  objectiveId,
  taskId,
  ideaId,
  prompt,
  conversationHistory = [],
}: AssistantReplyInput): Promise<AssistantReplyResult> {
  const context = await buildAIContext({
    workspaceId,
    route,
    projectId,
    objectiveId,
    taskId,
    ideaId,
  });

  const compactHistory = conversationHistory.slice(-8);

  const system = [
    'Tu es Edwin AI, un assistant operationnel integre a Edwin.',
    'Tu aides des entrepreneurs qui ont peu de temps et veulent des reponses directes.',
    'Tu dois etre utile, concret, orienter vers l action.',
    'Quand tu proposes une marche a suivre, fais court et priorise.',
    'Tu retournes uniquement un JSON valide.',
    'Tu reponds en francais sauf si l utilisateur utilise clairement une autre langue.',
  ].join(' ');

  const userPrompt = `
Contexte plateforme:
${JSON.stringify(context, null, 2)}

Historique recent:
${JSON.stringify(compactHistory, null, 2)}

Message utilisateur:
${prompt}

Retourne uniquement un JSON avec la structure:
{
  "reply": "string",
  "summary": "string court optionnel",
  "suggestedTitle": "string optionnel pour renommer la conversation",
  "suggestedActions": [
    {
      "label": "string",
      "kind": "open_objective_generator|open_task_modal|open_objectives|open_tasks|open_projects|open_project"
    }
  ],
  "requestedAction": {
    "kind": "create_project",
    "name": "string",
    "description": "string optionnel",
    "color": "#RRGGBB optionnel",
    "icon": "string optionnel"
  }
}

Contraintes:
- "reply" doit etre exploitable immediatement.
- 0 a 3 suggestedActions maximum.
- Ne promets pas qu un projet est cree dans "reply". Si l utilisateur demande une creation de projet et que le nom est clair, utilise "requestedAction".
- N ajoute "requestedAction" que pour une vraie demande explicite de creation de projet.
- Si le nom du projet n est pas clair, pose une question de clarification et laisse "requestedAction" vide.
- Utilise uniquement une couleur hexadecimale valide si tu proposes "color".
`;

  const result = await runAI({
    system,
    prompt: userPrompt,
    jsonMode: true,
    temperature: 0.6,
  });

  const parsed = extractJson(result.text) as Omit<AssistantReplyResult, 'provider' | 'model'>;

  return {
    reply: parsed.reply || 'Je n ai pas pu formuler une reponse utile.',
    summary: parsed.summary || undefined,
    suggestedTitle: parsed.suggestedTitle || undefined,
    suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions.slice(0, 3) : [],
    requestedAction:
      parsed.requestedAction &&
      parsed.requestedAction.kind === 'create_project' &&
      typeof parsed.requestedAction.name === 'string' &&
      parsed.requestedAction.name.trim()
        ? {
            kind: 'create_project',
            name: parsed.requestedAction.name.trim().slice(0, 100),
            description:
              typeof parsed.requestedAction.description === 'string'
                ? parsed.requestedAction.description.trim().slice(0, 500)
                : undefined,
            color:
              typeof parsed.requestedAction.color === 'string' &&
              /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(parsed.requestedAction.color.trim())
                ? parsed.requestedAction.color.trim()
                : undefined,
            icon:
              typeof parsed.requestedAction.icon === 'string'
                ? parsed.requestedAction.icon.trim().slice(0, 40)
                : undefined,
          }
        : undefined,
    provider: result.provider,
    model: result.model,
  };
}
