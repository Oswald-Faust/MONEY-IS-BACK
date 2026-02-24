import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { sendEmail } from '@/lib/mail';

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { to } = await request.json();
    
    if (!to) {
      return NextResponse.json({ error: 'Destinataire manquant' }, { status: 400 });
    }

    const result = await sendEmail({
      to,
      subject: 'Edwin - Test de configuration SMTP',
      category: 'test',
      metadata: { source: 'admin-email-test' },
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #6366f1;">Test de connexion réussi !</h2>
          <p>Ceci est un e-mail de test envoyé depuis votre Dashboard Admin Edwin.</p>
          <p>Si vous recevez ce message, cela signifie que votre configuration SMTP fonctionne correctement.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">© 2026 Edwin Inc.</p>
        </div>
      `
    });

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
