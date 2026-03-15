import { NextRequest, NextResponse } from 'next/server';

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
    const body = await request.json();

    // L infrastructure webhook est prete, mais l activation reelle depend
    // d un provider WhatsApp, d un access token et d une strategie de mapping
    // numero -> workspace/utilisateur.
    if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
      return NextResponse.json({
        success: true,
        message: 'Webhook WhatsApp recu mais integration non activee',
        data: {
          configured: false,
          received: body?.entry?.length || 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook WhatsApp recu',
      data: {
        configured: true,
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
