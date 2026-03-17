import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import WhatsAppLink from '@/models/WhatsAppLink';
import { ensureWorkspaceAccess } from '@/lib/ai/access';
import { normalizePhoneNumber, normalizeWhatsAppUserId, trimToUndefined } from '@/lib/whatsapp/normalize';
import { isWhatsAppConfigured } from '@/lib/whatsapp/client';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: 'workspaceId requis' },
        { status: 400 }
      );
    }

    const workspaceAccess = await ensureWorkspaceAccess(workspaceId, auth.userId, auth.role);
    if (!workspaceAccess.ok) {
      return workspaceAccess.error;
    }

    const isWorkspaceAdmin =
      workspaceAccess.workspace.owner.toString() === auth.userId ||
      workspaceAccess.workspace.members.some(
        (member) => member.user.toString() === auth.userId && member.role === 'admin'
      );

    const links = await WhatsAppLink.find({
      workspace: workspaceId,
      user: auth.userId,
      isActive: true,
    })
      .populate('user', 'firstName lastName email avatar')
      .sort({ updatedAt: -1 });

    const workspaceLinks = isWorkspaceAdmin
      ? await WhatsAppLink.find({
          workspace: workspaceId,
          isActive: true,
        })
          .populate('user', 'firstName lastName email avatar')
          .sort({ updatedAt: -1 })
      : links;

    return NextResponse.json({
      success: true,
      data: {
        links,
        currentLink: links[0] || null,
        workspaceLinks,
        canManageWorkspaceLinks: isWorkspaceAdmin,
        config: {
          metaConfigured: isWhatsAppConfigured(),
          defaultWorkspaceId: process.env.WHATSAPP_DEFAULT_WORKSPACE_ID || null,
          defaultUserId: process.env.WHATSAPP_DEFAULT_USER_ID || null,
          webhookPath: '/api/ai/whatsapp/webhook',
        },
      },
    });
  } catch (error) {
    console.error('Get WhatsApp links error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des liens WhatsApp' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: 'workspaceId requis' },
        { status: 400 }
      );
    }

    const workspaceAccess = await ensureWorkspaceAccess(workspaceId, auth.userId, auth.role);
    if (!workspaceAccess.ok) {
      return workspaceAccess.error;
    }

    await WhatsAppLink.findOneAndUpdate(
      {
        workspace: workspaceId,
        user: auth.userId,
      },
      {
        isActive: false,
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Lien WhatsApp supprimé',
    });
  } catch (error) {
    console.error('Delete WhatsApp link error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du lien WhatsApp' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const workspaceId = String(body.workspaceId || '').trim();
    const phone = normalizePhoneNumber(String(body.phone || ''));
    const waUserId = trimToUndefined(normalizeWhatsAppUserId(String(body.waUserId || '')));
    const label = trimToUndefined(String(body.label || ''));

    if (!workspaceId || !phone) {
      return NextResponse.json(
        { success: false, error: 'workspaceId et phone requis' },
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
        label,
        isActive: true,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    return NextResponse.json({
      success: true,
      data: link,
      message: 'Lien WhatsApp enregistré',
    });
  } catch (error) {
    console.error('Create WhatsApp link error:', error);

    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      Number((error as { code?: unknown }).code) === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Ce numéro ou identifiant WhatsApp est déjà relié à un autre utilisateur de ce workspace',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Erreur lors de l’enregistrement du lien WhatsApp' },
      { status: 500 }
    );
  }
}
