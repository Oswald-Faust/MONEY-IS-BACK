import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import { verifyAuth } from '@/lib/auth';

// GET /api/conversations/[id] - Récupérer une conversation
export async function GET(
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

    const conversation = await Conversation.findById(id)
      .populate('members.user', 'firstName lastName email avatar profileColor')
      .populate('creator', 'firstName lastName email avatar profileColor')
      .lean();

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }

    // Verify user is a member
    const isMember = conversation.members.some(
      (m: { user: { _id?: { toString: () => string }; toString: () => string } }) => {
        const userId = m.user._id ? m.user._id.toString() : m.user.toString();
        return userId === auth.userId;
      }
    );

    if (!isMember) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'êtes pas membre de cette conversation' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la conversation' },
      { status: 500 }
    );
  }
}

// PATCH /api/conversations/[id] - Modifier une conversation (nom, avatar)
export async function PATCH(
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

    // Verify user is an admin of the conversation
    const memberEntry = conversation.members.find(
      (m: { user: { toString: () => string }; role: string }) => m.user.toString() === auth.userId
    );

    if (!memberEntry || memberEntry.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Seuls les administrateurs peuvent modifier la conversation' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, avatar } = body;

    if (name) conversation.name = name;
    if (avatar !== undefined) conversation.avatar = avatar;

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
    console.error('Error updating conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la conversation' },
      { status: 500 }
    );
  }
}

// DELETE /api/conversations/[id] - Supprimer une conversation
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

    // Only creator can delete
    if (conversation.creator.toString() !== auth.userId) {
      return NextResponse.json(
        { success: false, error: 'Seul le créateur peut supprimer la conversation' },
        { status: 403 }
      );
    }

    await Conversation.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Conversation supprimée',
    });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la conversation' },
      { status: 500 }
    );
  }
}
