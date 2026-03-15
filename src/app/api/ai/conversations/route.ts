import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import AIConversation from '@/models/AIConversation';
import { ensureWorkspaceAccess } from '@/lib/ai/access';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorise' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'Workspace ID requis' }, { status: 400 });
    }

    const access = await ensureWorkspaceAccess(workspaceId, auth.userId, auth.role);
    if (!access.ok) {
      return access.error;
    }

    const conversations = await AIConversation.find({
      workspace: workspaceId,
      creator: auth.userId,
      archived: { $ne: true },
    })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('Error fetching AI conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la recuperation des conversations IA' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorise' }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, title, source = 'page', context } = body;

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'Workspace ID requis' }, { status: 400 });
    }

    const access = await ensureWorkspaceAccess(String(workspaceId), auth.userId, auth.role);
    if (!access.ok) {
      return access.error;
    }

    const conversation = await AIConversation.create({
      title: title?.trim() || 'Nouvelle conversation IA',
      workspace: workspaceId,
      creator: auth.userId,
      source,
      context: context || {},
    });

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error creating AI conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la creation de la conversation IA' },
      { status: 500 }
    );
  }
}
