import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/Conversation';
import Message from '@/models/Message';
import { verifyAuth } from '@/lib/auth';

// GET /api/conversations/[id]/messages - Récupérer les messages d'une conversation de groupe
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

    // Verify user is a member of the conversation
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }

    const isMember = conversation.members.some(
      (m: { user: { toString: () => string } }) => m.user.toString() === auth.userId
    );
    if (!isMember) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'êtes pas membre de cette conversation' },
        { status: 403 }
      );
    }

    const messages = await Message.find({
      conversation: id,
      deletedForEveryone: { $ne: true },
    })
      .populate('sender', 'firstName lastName email avatar profileColor')
      .sort({ createdAt: 1 })
      .lean();

    // Mark all messages as read by this user
    await Message.updateMany(
      {
        conversation: id,
        sender: { $ne: auth.userId },
        readBy: { $ne: auth.userId },
      },
      {
        $addToSet: { readBy: auth.userId },
      }
    );

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

// POST /api/conversations/[id]/messages - Envoyer un message dans une conversation de groupe
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

    // Verify user is a member
    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation non trouvée' },
        { status: 404 }
      );
    }

    const isMember = conversation.members.some(
      (m: { user: { toString: () => string } }) => m.user.toString() === auth.userId
    );
    if (!isMember) {
      return NextResponse.json(
        { success: false, error: 'Vous n\'êtes pas membre de cette conversation' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content, attachments } = body;

    if (!content && (!attachments || attachments.length === 0)) {
      return NextResponse.json(
        { success: false, error: 'Le contenu ou des pièces jointes sont requis' },
        { status: 400 }
      );
    }

    const newMsg = await Message.create({
      sender: auth.userId,
      conversation: id,
      content,
      attachments: attachments || [],
      readBy: auth.userId ? [auth.userId] : [],
    });

    // Update last message on conversation
    await Conversation.findByIdAndUpdate(id, {
      lastMessage: {
        content: content || 'Pièce jointe',
        sender: auth.userId,
        createdAt: new Date(),
      },
    });

    // Populate sender for the response
    const populated = await Message.findById(newMsg._id)
      .populate('sender', 'firstName lastName email avatar profileColor')
      .lean();

    return NextResponse.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    console.error('Error sending group message:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
