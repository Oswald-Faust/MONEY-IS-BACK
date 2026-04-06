import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import AIConversation from '@/models/AIConversation';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ success: false, error: 'Titre requis' }, { status: 400 });
    }

    const conversation = await AIConversation.findOneAndUpdate(
      { _id: id, creator: auth.userId },
      { title: title.trim().slice(0, 140) },
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Error renaming AI conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du renommage de la conversation' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = await params;

    const conversation = await AIConversation.findOneAndUpdate(
      { _id: id, creator: auth.userId },
      { archived: true },
      { new: true }
    );

    if (!conversation) {
      return NextResponse.json({ success: false, error: 'Conversation introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting AI conversation:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la conversation' },
      { status: 500 }
    );
  }
}
