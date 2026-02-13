import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { verifyAuth } from '@/lib/auth';

// PATCH /api/messages/read - Marquer les messages d'un utilisateur comme lus
export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { senderId } = await request.json();

    if (!senderId) {
      return NextResponse.json({ success: false, error: 'ID de l\'expéditeur requis' }, { status: 400 });
    }

    await Message.updateMany(
      { sender: senderId, recipient: auth.userId, read: false },
      { $set: { read: true } }
    );

    return NextResponse.json({
      success: true,
      message: 'Messages marqués comme lus',
    });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour des messages' },
      { status: 500 }
    );
  }
}
