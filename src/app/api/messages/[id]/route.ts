import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import { verifyAuth } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();
    const auth = await verifyAuth(request);

    if (!auth.success) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }
    
    // Parse body for options
    let body = {};
    try {
        body = await request.json();
    } catch {
        // Body is optional
    }
    const { deleteForEveryone } = body as { deleteForEveryone?: boolean };

    const message = await Message.findById(id);

    if (!message) {
      return NextResponse.json({ success: false, error: 'Message non trouvé' }, { status: 404 });
    }

    const isSender = message.sender.toString() === auth.userId;
    const isRecipient = message.recipient.toString() === auth.userId;

    if (!isSender && !isRecipient) {
        return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 403 });
    }

    if (deleteForEveryone) {
        if (!isSender) {
            return NextResponse.json(
                { success: false, error: 'Seul l\'expéditeur peut supprimer pour tout le monde' }, 
                { status: 403 }
            );
        }
        
        // Soft delete for everyone - replace content
        message.deletedForEveryone = true;
        message.content = 'Ce message a été supprimé';
        message.attachments = [];
        await message.save();
    } else {
        // Delete for me only
        if (isSender) {
            message.deletedForSender = true;
        }
        if (isRecipient) {
            message.deletedForRecipient = true;
        }
        await message.save();
    }

    return NextResponse.json({ success: true, data: message });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du message' },
      { status: 500 }
    );
  }
}
