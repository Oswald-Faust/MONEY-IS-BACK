import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { verifyAuth } from '@/lib/auth';

// GET /api/messages - Récupérer les messages entre l'utilisateur actuel et un autre utilisateur
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const otherUserId = searchParams.get('userId');

    if (!otherUserId) {
      return NextResponse.json({ success: false, error: 'ID de l\'autre utilisateur requis' }, { status: 400 });
    }

    const messages = await Message.find({
      $or: [
        { sender: auth.userId, recipient: otherUserId },
        { sender: otherUserId, recipient: auth.userId },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des messages' },
      { status: 500 }
    );
  }
}

// POST /api/messages - Envoyer un nouveau message
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { recipientId, content, attachments } = body;

    if (!recipientId || (!content && (!attachments || attachments.length === 0))) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 });
    }

    const newMessage = await Message.create({
      sender: auth.userId,
      recipient: recipientId,
      content,
      attachments: attachments || [],
    });

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
