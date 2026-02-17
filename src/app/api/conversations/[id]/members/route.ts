import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Workspace from '@/models/Workspace';
import { verifyAuth } from '@/lib/auth';

// POST /api/conversations/[id]/members - Ajouter des membres à la conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    const { id } = await params;

    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }

    // Only admins can add members
    const adminEntry = conversation.members.find(
      (m: { user: { toString: () => string }; role: string }) =>
        m.user.toString() === auth.userId && m.role === 'admin'
    );
    if (!adminEntry) {
      return NextResponse.json(
        { success: false, error: 'Seuls les administrateurs peuvent ajouter des membres' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { memberIds } = body;

    if (!memberIds || memberIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Au moins un membre est requis' },
        { status: 400 }
      );
    }

    // Verify new members are workspace members
    const workspace = await Workspace.findById(conversation.workspace);
    if (!workspace) {
      return NextResponse.json(
        { success: false, error: 'Workspace non trouvé' },
        { status: 404 }
      );
    }

    const workspaceMemberIds = workspace.members.map(
      (m: { user: { toString: () => string } }) => m.user.toString()
    );
    const existingMemberIds = conversation.members.map(
      (m: { user: { toString: () => string } }) => m.user.toString()
    );

    const newMembers = [];
    for (const memberId of memberIds) {
      if (!workspaceMemberIds.includes(memberId)) {
        return NextResponse.json(
          { success: false, error: `L'utilisateur ${memberId} n'est pas membre du workspace` },
          { status: 400 }
        );
      }
      if (!existingMemberIds.includes(memberId)) {
        newMembers.push({
          user: memberId,
          role: 'member' as const,
          joinedAt: new Date(),
        });
      }
    }

    if (newMembers.length > 0) {
      conversation.members.push(...(newMembers as typeof conversation.members));
      await conversation.save();
    }

    const updated = await Conversation.findById(id)
      .populate('members.user', 'firstName lastName email avatar profileColor')
      .populate('creator', 'firstName lastName email avatar profileColor')
      .lean();

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error adding members:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'ajout des membres' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id]/members - Retirer un membre de la conversation
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);
    const { id } = await params;

    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'L\'ID du membre est requis' },
        { status: 400 }
      );
    }

    // User can remove themselves, or admins can remove others
    const isAdmin = conversation.members.some(
      (m: { user: { toString: () => string }; role: string }) =>
        m.user.toString() === auth.userId && m.role === 'admin'
    );
    const isSelf = memberId === auth.userId;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    // Cannot remove the creator
    if (memberId === conversation.creator.toString()) {
      return NextResponse.json(
        { success: false, error: 'Impossible de retirer le créateur de la conversation' },
        { status: 400 }
      );
    }

    conversation.members = conversation.members.filter(
      (m: { user: { toString: () => string } }) => m.user.toString() !== memberId
    );
    await conversation.save();

    const updated = await Conversation.findById(id)
      .populate('members.user', 'firstName lastName email avatar profileColor')
      .populate('creator', 'firstName lastName email avatar profileColor')
      .lean();

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du retrait du membre' },
      { status: 500 }
    );
  }
}
