import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import { ensureWorkspaceAccess } from '@/lib/ai/access';
import WhatsAppLink from '@/models/WhatsAppLink';
import { processWhatsAppMessage } from '@/lib/whatsapp/orchestrator';
import { normalizePhoneNumber, normalizeWhatsAppUserId } from '@/lib/whatsapp/normalize';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const workspaceId = String(body.workspaceId || '').trim();
    const text = String(body.text || '').trim();
    const phone = normalizePhoneNumber(String(body.phone || ''));
    const waUserId = normalizeWhatsAppUserId(String(body.waUserId || phone));
    const source =
      body.source === 'audio' || body.source === 'test' ? body.source : 'text';

    if (!workspaceId || !text || !phone) {
      return NextResponse.json(
        { success: false, error: 'workspaceId, phone et text requis' },
        { status: 400 }
      );
    }

    const workspaceAccess = await ensureWorkspaceAccess(workspaceId, auth.userId, auth.role);
    if (!workspaceAccess.ok) {
      return workspaceAccess.error;
    }

    const link = await WhatsAppLink.findOneAndUpdate(
      {
        workspace: workspaceId,
        user: auth.userId,
      },
      {
        workspace: workspaceId,
        user: auth.userId,
        phone,
        waUserId,
        label: 'Lien WhatsApp de test',
        isActive: true,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    const result = await processWhatsAppMessage({
      workspaceId,
      userId: auth.userId,
      phone,
      waUserId,
      text,
      profileName: body.profileName ? String(body.profileName) : undefined,
      source,
      linkId: link._id.toString(),
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('WhatsApp test route error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du test WhatsApp' },
      { status: 500 }
    );
  }
}
