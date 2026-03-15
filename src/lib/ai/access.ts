import { NextResponse } from 'next/server';
import Workspace from '@/models/Workspace';
import AIConversation from '@/models/AIConversation';

export async function ensureWorkspaceAccess(workspaceId: string, userId: string, role?: string) {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) {
    return {
      ok: false as const,
      error: NextResponse.json({ success: false, error: 'Workspace introuvable' }, { status: 404 }),
    };
  }

  const isMember =
    workspace.owner.toString() === userId ||
    workspace.members.some((member) => member.user.toString() === userId);

  if (!isMember && role !== 'admin') {
    return {
      ok: false as const,
      error: NextResponse.json({ success: false, error: 'Acces refuse' }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    workspace,
  };
}

export async function ensureConversationAccess(conversationId: string, userId: string, role?: string) {
  const conversation = await AIConversation.findById(conversationId);
  if (!conversation) {
    return {
      ok: false as const,
      error: NextResponse.json({ success: false, error: 'Conversation IA introuvable' }, { status: 404 }),
    };
  }

  const workspaceAccess = await ensureWorkspaceAccess(conversation.workspace.toString(), userId, role);
  if (!workspaceAccess.ok) {
    return workspaceAccess;
  }

  if (conversation.creator.toString() !== userId && role !== 'admin') {
    return {
      ok: false as const,
      error: NextResponse.json({ success: false, error: 'Acces refuse' }, { status: 403 }),
    };
  }

  return {
    ok: true as const,
    conversation,
    workspace: workspaceAccess.workspace,
  };
}
