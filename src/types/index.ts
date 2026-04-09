export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  authProvider?: 'password' | 'google';
  avatar?: string;
  bio?: string;
  profileColor?: string;
  role: 'user' | 'admin' | 'moderator' | 'support';
  preferences: {
    theme: 'dark' | 'light';
    notifications: boolean;
    language: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  workspace: string;
  owner: string | User;
  members: ProjectMember[];
  securePassword?: string;
  status: 'active' | 'archived' | 'paused';
  tasksCount: number;
  completedTasksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  user: string | User;
  role: 'admin' | 'editor' | 'visitor';
  joinedAt: string;
}

export type TaskPriority = 'important' | 'less_important' | 'waiting';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskSource = 'manual' | 'objective_checkpoint';

export interface Task {
  _id: string;
  title: string;
  description?: string;
  workspace?: string;
  project?: string | Project | null;
  projectName?: string;
  projectColor?: string;
  objective?: string | { _id: string; title: string };
  objectiveTitle?: string;
  objectiveCheckpointId?: string;
  source?: TaskSource;
  assignee?: string | User;
  assignees?: (string | User)[];
  creator: string | User;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  startDate?: string;
  estimatedTime?: number;
  timeSpent?: number;
  tags: string[];
  subtasks: Subtask[];
  attachments: Attachment[];
  comments: Comment[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  user: string | User;
  content: string;
  createdAt: string;
}

export interface Routine {
  _id: string;
  title: string;
  description?: string;
  project: string;
  projectColor?: string;
  creator: string;
  assignee?: string | User;
  days: RoutineDays;
  time?: string;
  duration?: number;
  isActive: boolean;
  color: string;
  completedDates: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutineDays {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: WorkspaceMember[];
  useCase: 'personal' | 'work' | 'school' | 'agency' | 'startup' | 'other';
  settings: {
    defaultProjectColor: string;
    allowInvitations: boolean;
    icon: string;
    image?: string;
    theme: 'dark' | 'light' | 'system';
  };
  subscriptionPlan: 'starter' | 'pro' | 'team' | 'business' | 'enterprise';
  subscriptionStatus?: string;
  subscriptionInterval?: 'month' | 'year';
  subscriptionEnd?: string;
  stripeCustomerId?: string;
  aiProfile?: WorkspaceAIProfile;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceAIProfile {
  businessSummary?: string;
  primaryGoals?: string[];
  teamSummary?: string;
  preferredTone?: 'coach' | 'direct' | 'friendly' | 'executive';
  onboardingCompleted?: boolean;
  whatsappEnabled?: boolean;
  whatsappAutoReply?: boolean;
  whatsappLeadQualif?: boolean;
  whatsappScheduling?: boolean;
}

export interface WorkspaceMember {
  user: string | User;
  role: 'admin' | 'editor' | 'visitor';
  joinedAt: string;
}

export interface Objective {
  _id: string;
  title: string;
  description?: string;
  workspace?: string;
  project?: string | Project | null;
  projectName?: string;
  projectColor?: string;
  creator: string | User;
  assignee?: string | User;
  assignees?: (string | User)[];
  targetDate?: string;
  progress: number;
  checkpoints: ObjectiveCheckpoint[];
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface ObjectiveCheckpoint {
  id: string;
  title: string;
  completed: boolean;
  priority?: TaskPriority;
  dueDate?: string;
  assignee?: string | User;
  assignees?: (string | User)[];
  task?: string;
}

export interface KeyResult {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
}

export interface Idea {
  _id: string;
  title: string;
  content: string;
  project?: string;
  creator: string | User;
  assignee?: string | User;
  assignees?: (string | User)[];
  attachments: Attachment[];
  tags: string[];
  status: 'raw' | 'standby' | 'in_progress' | 'implemented' | 'archived';
  votes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface SecureId {
  _id: string;
  title: string;
  link?: string;
  username?: string;
  password?: string;
  notes?: string;
  category?: string;
  project?: string;
  owner: string;
  sharedWith: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DriveFile {
  _id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  project?: string;
  folderId?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriveFolder {
  _id: string;
  name: string;
  project?: string;
  parentId?: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessageAttachment {
  type: 'task' | 'objective' | 'file' | 'folder' | 'idea';
  id: string;
  name: string;
}

export interface Message {
  _id: string;
  sender: string | User;
  recipient?: string;
  conversation?: string;
  content: string;
  attachments: MessageAttachment[];
  read: boolean;
  readBy?: string[];
  deletedForSender?: boolean;
  deletedForRecipient?: boolean;
  deletedForEveryone?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Contact extends User {
  lastMessage?: Message;
  unreadCount: number;
}

export interface ConversationMember {
  user: string | User;
  role: 'admin' | 'member';
  joinedAt: string;
}

export interface Conversation {
  _id: string;
  name: string;
  type: 'group';
  workspace: string;
  creator: string;
  members: ConversationMember[];
  avatar?: string;
  lastMessage?: {
    content: string;
    sender: string | User;
    createdAt: string;
  };
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIConversation {
  _id: string;
  title: string;
  workspace: string;
  creator: string;
  source: 'panel' | 'page' | 'onboarding' | 'whatsapp';
  archived?: boolean;
  lastMessage?: {
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    provider?: 'openai' | 'gemini';
  };
  context?: {
    route?: string;
    project?: string;
    objective?: string;
    task?: string;
    idea?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AIChatMessage {
  _id: string;
  conversation: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: 'openai' | 'gemini';
  model?: string;
  status?: 'completed' | 'error';
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type AISuggestedActionKind =
  | 'open_objective_generator'
  | 'open_task_modal'
  | 'open_objectives'
  | 'open_tasks'
  | 'open_projects'
  | 'open_project';

export interface AISuggestedAction {
  label: string;
  kind: AISuggestedActionKind;
  projectId?: string;
}

export interface AIExecutedAction {
  kind: 'create_project';
  status: 'created' | 'already_exists' | 'failed';
  project?: Project;
  error?: string;
}
