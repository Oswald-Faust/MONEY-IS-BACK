import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import EmailTemplate from '@/models/EmailTemplate';
import { extractTemplateVariables, seedDefaultEmailTemplates } from '@/lib/mail';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  
  await seedDefaultEmailTemplates();

  const templates = await EmailTemplate.find().sort({ updatedAt: -1 });
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    await dbConnect();

    if (data?.action === 'resetDefaults') {
      await seedDefaultEmailTemplates({ forceUpdate: true });
      const templates = await EmailTemplate.find().sort({ updatedAt: -1 });
      return NextResponse.json({ success: true, templates });
    }

    const normalized = {
      ...data,
      name: String(data.name || '').trim(),
      subject: String(data.subject || ''),
      body: String(data.body || ''),
      type: data.type || 'automation',
      automationKey: data.automationKey ? String(data.automationKey).trim() : undefined,
    };

    if (!normalized.name || !normalized.subject || !normalized.body) {
      return NextResponse.json({ error: 'Nom, sujet et contenu requis' }, { status: 400 });
    }

    normalized.variables = extractTemplateVariables(normalized.subject, normalized.body);
    
    let template;
    if (data._id) {
      template = await EmailTemplate.findByIdAndUpdate(data._id, normalized, { new: true });
    } else {
      template = await EmailTemplate.create(normalized);
    }

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error('API Error:', error);
    const maybeMongoError = error as { code?: number };
    if (maybeMongoError.code === 11000) {
      return NextResponse.json({ error: 'automationKey déjà utilisé' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID missing' }, { status: 400 });

  await dbConnect();
  await EmailTemplate.findByIdAndDelete(id);
  
  return NextResponse.json({ success: true });
}
