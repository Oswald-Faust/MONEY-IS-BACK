import type { ProcessWhatsAppMessageInput, ProcessWhatsAppMessageResult } from '@/lib/whatsapp/orchestrator';
import Workspace from '@/models/Workspace';
import WhatsAppLink from '@/models/WhatsAppLink';
import { processWhatsAppMessage } from '@/lib/whatsapp/orchestrator';
import {
  buildVerificationConfirmedMessage,
  buildVerificationReminderMessage,
  doesMessageConfirmVerification,
  generateVerificationCode,
  getVerificationExpiryDate,
} from '@/lib/whatsapp/verification';

export async function processInboundWhatsAppForLink({
  linkId,
  workspaceId,
  userId,
  phone,
  waUserId,
  text,
  profileName,
  externalMessageId,
  source,
}: ProcessWhatsAppMessageInput): Promise<ProcessWhatsAppMessageResult> {
  const link = await WhatsAppLink.findById(linkId);
  if (!link) {
    return processWhatsAppMessage({
      workspaceId,
      userId,
      phone,
      waUserId,
      text,
      profileName,
      externalMessageId,
      source,
    });
  }

  if (link.status === 'pending_verification') {
    const workspace = await Workspace.findById(workspaceId).select('name');
    const workspaceName = workspace?.name || 'Edwin';
    const isExpired =
      !link.verificationExpiresAt || link.verificationExpiresAt.getTime() < Date.now();

    if (doesMessageConfirmVerification(text, link)) {
      link.status = 'verified';
      link.isActive = true;
      link.verifiedAt = new Date();
      link.optInConfirmedAt = new Date();
      link.initializationLastError = undefined;
      link.lastInboundAt = new Date();
      if (waUserId && !link.waUserId) {
        link.waUserId = waUserId;
      }
      await link.save();

      return {
        success: true,
        reply: buildVerificationConfirmedMessage(workspaceName),
      };
    }

    if (isExpired) {
      link.verificationCode = generateVerificationCode();
      link.verificationExpiresAt = getVerificationExpiryDate();
      await link.save();
    }

    return {
      success: true,
      reply: buildVerificationReminderMessage({
        workspaceName,
        verificationCode: link.verificationCode || '',
        expired: isExpired,
      }),
      quickReplies: link.verificationCode
        ? [
            {
              id: link.verificationCode,
              title: link.verificationCode,
            },
          ]
        : [],
    };
  }

  if (link.status === 'disabled' || link.status === 'failed') {
    return {
      success: false,
      reply: 'Cette connexion WhatsApp est désactivée. Relancez la connexion depuis Edwin.',
    };
  }

  return processWhatsAppMessage({
    workspaceId,
    userId,
    phone,
    waUserId,
    text,
    profileName,
    externalMessageId,
    source,
    linkId,
  });
}
