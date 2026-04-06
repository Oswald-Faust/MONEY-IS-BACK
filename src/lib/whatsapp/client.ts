const GRAPH_API_VERSION = process.env.WHATSAPP_GRAPH_API_VERSION || 'v23.0';

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} manquant`);
  }

  return value;
}

function getGraphApiBase() {
  return `https://graph.facebook.com/${GRAPH_API_VERSION}`;
}

function toWhatsAppRecipient(value: string) {
  return value.replace(/[^\d]/g, '');
}

async function parseGraphResponse(response: Response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error?.message || 'Erreur WhatsApp Cloud API');
  }

  return data;
}

export function isWhatsAppConfigured() {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_VERIFY_TOKEN
  );
}

export function isWhatsAppInitTemplateConfigured() {
  return Boolean(process.env.WHATSAPP_INIT_TEMPLATE_NAME);
}

export async function sendWhatsAppTextMessage({
  to,
  body,
}: {
  to: string;
  body: string;
}) {
  const accessToken = getRequiredEnv('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = getRequiredEnv('WHATSAPP_PHONE_NUMBER_ID');

  const response = await fetch(`${getGraphApiBase()}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toWhatsAppRecipient(to),
      type: 'text',
      text: {
        preview_url: false,
        body,
      },
    }),
  });

  return parseGraphResponse(response);
}

export async function sendWhatsAppTemplateMessage({
  to,
  name,
  languageCode = 'fr',
  bodyParams = [],
}: {
  to: string;
  name: string;
  languageCode?: string;
  bodyParams?: string[];
}) {
  const accessToken = getRequiredEnv('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = getRequiredEnv('WHATSAPP_PHONE_NUMBER_ID');

  const components =
    bodyParams.length > 0
      ? [
          {
            type: 'body',
            parameters: bodyParams.map((value) => ({
              type: 'text',
              text: value,
            })),
          },
        ]
      : undefined;

  const response = await fetch(`${getGraphApiBase()}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toWhatsAppRecipient(to),
      type: 'template',
      template: {
        name,
        language: {
          code: languageCode,
        },
        components,
      },
    }),
  });

  return parseGraphResponse(response);
}

export async function sendWhatsAppInitializationMessage({
  to,
  workspaceName,
  verificationCode,
}: {
  to: string;
  workspaceName: string;
  verificationCode: string;
}) {
  const templateName = process.env.WHATSAPP_INIT_TEMPLATE_NAME;
  const templateLanguage = process.env.WHATSAPP_INIT_TEMPLATE_LANGUAGE || 'fr';

  if (templateName) {
    return sendWhatsAppTemplateMessage({
      to,
      name: templateName,
      languageCode: templateLanguage,
      bodyParams: [workspaceName, verificationCode],
    });
  }

  return sendWhatsAppTextMessage({
    to,
    body: `Bonjour, c'est Edwin.\n\nPour connecter ce numéro au workspace "${workspaceName}", répondez avec le code ${verificationCode}.`,
  });
}

export async function sendWhatsAppReplyButtons({
  to,
  body,
  buttons,
}: {
  to: string;
  body: string;
  buttons: Array<{ id: string; title: string }>;
}) {
  const accessToken = getRequiredEnv('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = getRequiredEnv('WHATSAPP_PHONE_NUMBER_ID');
  const normalizedButtons = buttons.slice(0, 3).map((button, index) => ({
    type: 'reply' as const,
    reply: {
      id: button.id.slice(0, 256) || `btn_${index + 1}`,
      title: button.title.slice(0, 20),
    },
  }));

  const response = await fetch(`${getGraphApiBase()}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: toWhatsAppRecipient(to),
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: body,
        },
        action: {
          buttons: normalizedButtons,
        },
      },
    }),
  });

  return parseGraphResponse(response);
}

export async function fetchWhatsAppMedia(mediaId: string) {
  const accessToken = getRequiredEnv('WHATSAPP_ACCESS_TOKEN');
  const metadataResponse = await fetch(`${getGraphApiBase()}/${mediaId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const metadata = await parseGraphResponse(metadataResponse);
  const mediaUrl = metadata?.url;
  if (!mediaUrl) {
    throw new Error('URL média WhatsApp introuvable');
  }

  const fileResponse = await fetch(mediaUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!fileResponse.ok) {
    throw new Error('Impossible de télécharger le média WhatsApp');
  }

  const arrayBuffer = await fileResponse.arrayBuffer();
  return {
    buffer: Buffer.from(arrayBuffer),
    mimeType: fileResponse.headers.get('content-type') || metadata?.mime_type || 'application/octet-stream',
    sha256: metadata?.sha256 as string | undefined,
  };
}
