import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Message from '@/models/Message';
import { verifyAuth } from '@/lib/auth';

// GET /api/messages/contacts - Récupérer la liste des utilisateurs pour la messagerie
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer tous les utilisateurs sauf l'actuel
    const users = await User.find({ _id: { $ne: auth.userId } })
      .select('firstName lastName email avatar profileColor')
      .lean();

    // Pour chaque utilisateur, on pourrait aussi récupérer le dernier message échangé
    const contactsWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: auth.userId, recipient: user._id },
            { sender: user._id, recipient: auth.userId },
          ],
        })
          .sort({ createdAt: -1 })
          .lean();

        const unreadCount = await Message.countDocuments({
          sender: user._id,
          recipient: auth.userId,
          read: false,
        });

        return {
          ...user,
          lastMessage,
          unreadCount,
        };
      })
    );

    // Trier les contacts par date du dernier message (plus récent en premier)
    contactsWithLastMessage.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0;
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime();
    });

    return NextResponse.json({
      success: true,
      data: contactsWithLastMessage,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des contacts' },
      { status: 500 }
    );
  }
}
