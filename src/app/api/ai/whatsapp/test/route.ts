import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import { ensureWorkspaceAccess } from '@/lib/ai/access';
import WhatsAppLink from '@/models/WhatsAppLink';
import { processInboundWhatsAppForLink } from '@/lib/whatsapp/inbound';
import { normalizePhoneNumber, normalizeWhatsAppUserId } from '@/lib/whatsapp/normalize';
import { generateVerificationCode, getVerificationExpiryDate } from '@/lib/whatsapp/verification';

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

    let link = await WhatsAppLink.findOne({
      workspace: workspaceId,
      user: auth.userId,
    });

    if (!link) {
      link = new WhatsAppLink({
        workspace: workspaceId,
        user: auth.userId,
      });
    }

    link.workspace = workspaceId as never;
    link.user = auth.userId as never;
    link.phone = phone;
    link.waUserId = waUserId;
    link.label = 'Lien WhatsApp de test';
    link.isActive = true;
    if (!link.verificationCode) {
      link.verificationCode = generateVerificationCode();
    }
    if (!link.verificationExpiresAt) {
      link.verificationExpiresAt = getVerificationExpiryDate();
    }
    if (!link.status) {
      link.status = 'pending_verification';
    }
    await link.save();

    const result = await processInboundWhatsAppForLink({
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
      data: {
        ...result,
        link: {
          id: link._id.toString(),
          status: link.status,
          verificationCode: link.verificationCode,
          verificationExpiresAt: link.verificationExpiresAt,
        },
      },
    });
  } catch (error) {
    console.error('WhatsApp test route error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du test WhatsApp' },
      { status: 500 }
    );
  }
}
