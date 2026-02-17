import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import User from '@/models/User';
import Workspace from '@/models/Workspace';
import { verifyAuth } from '@/lib/auth';

// GET /api/conversations - Récupérer les conversations de groupe de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    const query: Record<string, unknown> = {
      'members.user': auth.userId,
    };

    if (workspaceId) {
      query.workspace = workspaceId;
    }

    const conversations = await Conversation.find(query)
      .populate('members.user', 'firstName lastName email avatar profileColor')
      .populate('creator', 'firstName lastName email avatar profileColor')
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: auth.userId },
          readBy: { $ne: auth.userId },
          deletedForEveryone: { $ne: true },
        });

        return {
          ...conv,
          unreadCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: conversationsWithUnread,
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des conversations' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Créer une nouvelle conversation de groupe
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { name, workspaceId, memberIds } = body;

    if (!name || !workspaceId || !memberIds || memberIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Le nom, le workspace et au moins un membre sont requis' },
        { status: 400 }
      );
    }

    // Verify the workspace exists and the user is a member
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace non trouvé' },
        { status: 404 }
      );
    }

    const isWorkspaceMember = workspace.members.some(
      (m: { user: { toString: () => string } }) => m.user.toString() === auth.userId
    );
    if (!isWorkspaceMember) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'êtes pas membre de ce workspace' },
        { status: 403 }
      );
    }

    // Verify all member IDs are valid workspace members
    const allMemberIds = [...new Set([auth.userId, ...memberIds])];
    const workspaceMemberIds = workspace.members.map(
      (m: { user: { toString: () => string } }) => m.user.toString()
    );

    for (const memberId of allMemberIds) {
      if (!workspaceMemberIds.includes(memberId)) {
        return NextResponse.json(
          { success: false, error: `L'utilisateur ${memberId} n'est pas membre du workspace` },
          { status: 400 }
        );
      }
    }

    // Build members array: creator is admin, others are members
    const members = allMemberIds.map((id: string) => ({
      user: id,
      role: id === auth.userId ? 'admin' : 'member',
      joinedAt: new Date(),
    }));

    const conversation = await Conversation.create({
      name,
      type: 'group',
      workspace: workspaceId,
      creator: auth.userId,
      members,
    });

    // Populate for the response
    const populated = await Conversation.findById(conversation._id)
      .populate('members.user', 'firstName lastName email avatar profileColor')
      .populate('creator', 'firstName lastName email avatar profileColor')
      .lean();

    return NextResponse.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la conversation' },
      { status: 500 }
    );
  }
}
