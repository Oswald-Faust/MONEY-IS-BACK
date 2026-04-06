import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import WhatsAppLink from '@/models/WhatsAppLink';
import { ensureWorkspaceAccess } from '@/lib/ai/access';
import { normalizePhoneNumber, normalizeWhatsAppUserId, trimToUndefined } from '@/lib/whatsapp/normalize';
import {
  isWhatsAppConfigured,
  isWhatsAppInitTemplateConfigured,
  sendWhatsAppInitializationMessage,
} from '@/lib/whatsapp/client';
import {
  generateVerificationCode,
  getVerificationExpiryDate,
} from '@/lib/whatsapp/verification';

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
          initTemplateConfigured: isWhatsAppInitTemplateConfigured(),
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
        status: 'disabled',
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

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const workspaceId = String(body.workspaceId || '').trim();
    const action = String(body.action || '').trim();

    if (!workspaceId || action !== 'resend_verification') {
      return NextResponse.json(
        { success: false, error: 'workspaceId et action=resend_verification requis' },
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
    });

    if (!link) {
      return NextResponse.json(
        { success: false, error: 'Aucun numéro WhatsApp à vérifier pour ce workspace' },
        { status: 404 }
      );
    }

    link.status = 'pending_verification';
    link.verificationCode = generateVerificationCode();
    link.verificationExpiresAt = getVerificationExpiryDate();
    link.initializationLastError = undefined;

    let initializationStatus: 'sent' | 'failed' | 'not_configured' = 'not_configured';
    let initializationError: string | null = null;

    if (isWhatsAppConfigured()) {
      try {
        await sendWhatsAppInitializationMessage({
          to: link.waUserId || link.phone,
          workspaceName: workspaceAccess.workspace.name,
          verificationCode: link.verificationCode,
        });
        link.initializationMessageSentAt = new Date();
        initializationStatus = 'sent';
      } catch (error) {
        initializationError = error instanceof Error ? error.message : 'Erreur Meta WhatsApp';
        link.initializationLastError = initializationError;
        initializationStatus = 'failed';
      }
    }

    await link.save();

    return NextResponse.json({
      success: initializationStatus !== 'failed',
      data: {
        link,
        initializationStatus,
        initializationError,
      },
      message:
        initializationStatus === 'sent'
          ? 'Message de vérification renvoyé'
          : initializationStatus === 'failed'
            ? 'Le lien est en attente, mais le message de vérification n’a pas pu être envoyé'
            : 'Le lien est en attente de vérification',
    });
  } catch (error) {
    console.error('Resend WhatsApp verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du renvoi de la vérification WhatsApp' },
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

    let link = await WhatsAppLink.findOne({
      workspace: workspaceId,
      user: auth.userId,
    });

    const samePhone = link?.phone === phone;
    const sameWaUserId = (link?.waUserId || '') === (waUserId || '');
    const keepVerified = Boolean(link && samePhone && sameWaUserId && link.status === 'verified');

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
    link.label = label;
    link.isActive = true;

    if (!keepVerified) {
      link.status = 'pending_verification';
      link.verificationCode = generateVerificationCode();
      link.verificationExpiresAt = getVerificationExpiryDate();
      link.verifiedAt = undefined;
      link.optInConfirmedAt = undefined;
      link.initializationLastError = undefined;
    }

    let initializationStatus: 'already_verified' | 'sent' | 'failed' | 'not_configured' =
      keepVerified ? 'already_verified' : 'not_configured';
    let initializationError: string | null = null;

    if (!keepVerified && isWhatsAppConfigured()) {
      try {
        await sendWhatsAppInitializationMessage({
          to: waUserId || phone,
          workspaceName: workspaceAccess.workspace.name,
          verificationCode: link.verificationCode || generateVerificationCode(),
        });
        link.initializationMessageSentAt = new Date();
        initializationStatus = 'sent';
      } catch (error) {
        initializationError = error instanceof Error ? error.message : 'Erreur Meta WhatsApp';
        link.initializationLastError = initializationError;
        link.status = 'failed';
        initializationStatus = 'failed';
      }
    }

    await link.save();

    return NextResponse.json({
      success: initializationStatus !== 'failed',
      data: {
        link,
        initializationStatus,
        initializationError,
      },
      message:
        initializationStatus === 'already_verified'
          ? 'Numéro WhatsApp déjà vérifié'
          : initializationStatus === 'sent'
            ? 'Message de vérification envoyé sur WhatsApp'
            : initializationStatus === 'failed'
              ? 'Le numéro a été enregistré, mais le message de vérification n’a pas pu être envoyé'
              : 'Le numéro est enregistré en attente de vérification',
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
