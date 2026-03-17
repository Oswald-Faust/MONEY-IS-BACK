import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import WhatsAppLink from '@/models/WhatsAppLink';
import { ensureWorkspaceAccess } from '@/lib/ai/access';
import {
  isWhatsAppConfigured,
  sendWhatsAppReplyButtons,
  sendWhatsAppTextMessage,
} from '@/lib/whatsapp/client';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const workspaceId = String(body.workspaceId || '').trim();
    const message = String(body.message || '').trim();
    const rawQuickReplies: unknown[] = Array.isArray(body.quickReplies) ? body.quickReplies : [];
    const quickReplies = rawQuickReplies
      .filter(
        (item: unknown): item is { id: string; title: string } =>
          Boolean(
            item &&
              typeof item === 'object' &&
              'id' in item &&
              'title' in item &&
              typeof item.id === 'string' &&
              typeof item.title === 'string' &&
              item.id.trim().length > 0 &&
              item.title.trim().length > 0
          )
      )
      .slice(0, 3);

    if (!workspaceId || !message) {
      return NextResponse.json(
        { success: false, error: 'workspaceId et message requis' },
        { status: 400 }
      );
    }

    if (!isWhatsAppConfigured()) {
      return NextResponse.json(
        { success: false, error: 'L’intégration Meta WhatsApp n’est pas configurée' },
        { status: 400 }
      );
    }

    const workspaceAccess = await ensureWorkspaceAccess(workspaceId, auth.userId, auth.role);
    if (!workspaceAccess.ok) {
      return workspaceAccess.error;
    }

    const link = await WhatsAppLink.findOne({
      workspace: workspaceId,
      user: auth.userId,
      isActive: true,
    }).select('phone waUserId');

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Aucun numéro WhatsApp lié pour ce workspace' },
        { status: 404 }
      );
    }

    const recipient = link.waUserId || link.phone;
    if (!recipient) {
      return NextResponse.json(
        { success: false, error: 'Aucun destinataire WhatsApp disponible' },
        { status: 400 }
      );
    }

    if (quickReplies.length > 0) {
      const data = await sendWhatsAppReplyButtons({
        to: recipient,
        body: message,
        buttons: quickReplies,
      });

      return NextResponse.json({
        success: true,
        data,
        message: 'Message interactif WhatsApp envoyé',
      });
    }

    const data = await sendWhatsAppTextMessage({
      to: recipient,
      body: message,
    });

    return NextResponse.json({
      success: true,
      data,
      message: 'Message WhatsApp envoyé',
    });
  } catch (error) {
    console.error('WhatsApp outbound error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l’envoi du message WhatsApp' },
      { status: 500 }
    );
  }
}
