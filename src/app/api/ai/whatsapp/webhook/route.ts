import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import WhatsAppLink from '@/models/WhatsAppLink';
import {
  fetchWhatsAppMedia,
  isWhatsAppConfigured,
  sendWhatsAppReplyButtons,
  sendWhatsAppTextMessage,
} from '@/lib/whatsapp/client';
import { processWhatsAppMessage } from '@/lib/whatsapp/orchestrator';
import { transcribeAudioBuffer } from '@/lib/ai/audio';
import { normalizePhoneNumber, normalizeWhatsAppUserId } from '@/lib/whatsapp/normalize';

type IncomingWebhookMessage = {
  id: string;
  from: string;
  profileName?: string;
  type: 'text' | 'audio' | 'button' | 'interactive' | 'unknown';
  text?: string;
  audioId?: string;
};

type WebhookContact = {
  wa_id?: string;
  profile?: {
    name?: string;
  };
};

type WebhookMessage = {
  id?: string;
  from?: string;
  type?: string;
  text?: {
    body?: string;
  };
  audio?: {
    id?: string;
  };
  button?: {
    text?: string;
  };
  interactive?: {
    button_reply?: {
      title?: string;
    };
    list_reply?: {
      title?: string;
    };
  };
};

type WebhookChange = {
  value?: {
    messages?: WebhookMessage[];
    contacts?: WebhookContact[];
  };
};

type WebhookEntry = {
  changes?: WebhookChange[];
};

function extractIncomingMessages(body: unknown): IncomingWebhookMessage[] {
  const entries = Array.isArray((body as { entry?: WebhookEntry[] } | null)?.entry)
    ? ((body as { entry: WebhookEntry[] }).entry ?? [])
    : [];
  const parsedMessages: IncomingWebhookMessage[] = [];

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value;
      const messages = Array.isArray(value?.messages) ? value.messages : [];
      const contacts = Array.isArray(value?.contacts) ? value.contacts : [];

      for (const message of messages) {
        if (!message?.id || !message?.from) {
          continue;
        }

        const matchingContact = contacts.find((contact) => contact?.wa_id === message.from);
        const baseMessage = {
          id: message.id,
          from: message.from,
          profileName: matchingContact?.profile?.name,
        };

        if (message.type === 'text') {
          parsedMessages.push({
            ...baseMessage,
            type: 'text',
            text: message.text?.body,
          });
          continue;
        }

        if (message.type === 'audio') {
          parsedMessages.push({
            ...baseMessage,
            type: 'audio',
            audioId: message.audio?.id,
          });
          continue;
        }

        if (message.type === 'button') {
          parsedMessages.push({
            ...baseMessage,
            type: 'button',
            text: message.button?.text,
          });
          continue;
        }

        if (message.type === 'interactive') {
          parsedMessages.push({
            ...baseMessage,
            type: 'interactive',
            text:
              message.interactive?.button_reply?.title ||
              message.interactive?.list_reply?.title ||
              '',
          });
          continue;
        }

        parsedMessages.push({
          ...baseMessage,
          type: 'unknown',
        });
      }
    }
  }

  return parsedMessages;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (
    mode === 'subscribe' &&
    token &&
    process.env.WHATSAPP_VERIFY_TOKEN &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    return new NextResponse(challenge || '', { status: 200 });
  }

  return NextResponse.json({ success: false, error: 'Verification WhatsApp invalide' }, { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    if (!isWhatsAppConfigured()) {
      return NextResponse.json({
        success: true,
        message: 'Webhook WhatsApp reçu mais intégration non activée',
        data: {
          configured: false,
          received: body?.entry?.length || 0,
        },
      });
    }

    const incomingMessages = extractIncomingMessages(body);
    const results = [];

    for (const incoming of incomingMessages) {
      if (!incoming.id || !incoming.from) {
        continue;
      }

      const normalizedWaUserId = normalizeWhatsAppUserId(incoming.from);
      const normalizedPhone = normalizePhoneNumber(incoming.from);
      const linkedAccount = await WhatsAppLink.findOne({
        isActive: true,
        $or: [{ waUserId: normalizedWaUserId }, { phone: normalizedPhone }],
      }).select('workspace user');

      const workspaceId =
        linkedAccount?.workspace?.toString() || process.env.WHATSAPP_DEFAULT_WORKSPACE_ID;
      const userId = linkedAccount?.user?.toString() || process.env.WHATSAPP_DEFAULT_USER_ID;

      if (!workspaceId || !userId) {
        await sendWhatsAppTextMessage({
          to: incoming.from,
          body: 'Votre numéro WhatsApp n’est pas encore relié à un workspace Edwin.',
        });
        continue;
      }

      let text = incoming.text?.trim() || '';

      if (incoming.type === 'audio' && incoming.audioId) {
        try {
          const media = await fetchWhatsAppMedia(incoming.audioId);
          const transcription = await transcribeAudioBuffer({
            buffer: media.buffer,
            filename: `${incoming.audioId}.ogg`,
            mimeType: media.mimeType,
          });
          text = transcription.text;
        } catch (audioError) {
          console.error('WhatsApp audio processing error:', audioError);
          await sendWhatsAppTextMessage({
            to: incoming.from,
            body: 'Je n’ai pas réussi à transcrire ce vocal. Essayez avec un message texte ou un autre vocal.',
          });
          continue;
        }
      }

      if (!text) {
        continue;
      }

      const result = await processWhatsAppMessage({
        workspaceId,
        userId,
        phone: normalizedPhone,
        waUserId: normalizedWaUserId,
        text,
        profileName: incoming.profileName,
        externalMessageId: incoming.id,
        source: incoming.type === 'audio' ? 'audio' : 'text',
        linkId: linkedAccount?._id?.toString(),
      });

      results.push({
        id: incoming.id,
        duplicate: Boolean(result.duplicate),
        createdEntity: result.createdEntity,
        pending: result.pending,
      });

      if (result.reply && !result.duplicate) {
        if (result.quickReplies && result.quickReplies.length > 0) {
          await sendWhatsAppReplyButtons({
            to: incoming.from,
            body: result.reply,
            buttons: result.quickReplies,
          });
        } else {
          await sendWhatsAppTextMessage({
            to: incoming.from,
            body: result.reply,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook WhatsApp reçu',
      data: {
        configured: true,
        processed: results.length,
        results,
      },
    });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors du traitement du webhook WhatsApp' },
      { status: 500 }
    );
  }
}
