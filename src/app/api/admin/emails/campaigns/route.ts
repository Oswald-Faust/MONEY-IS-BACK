import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import EmailCampaign from '@/models/EmailCampaign';
import { dispatchEmailCampaign, resolveCampaignRecipients } from '@/lib/mail';

async function requireAdmin(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success || auth.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { auth };
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if ('error' in admin) return admin.error;

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 50), 1), 100);

  const campaigns = await EmailCampaign.find()
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

  return NextResponse.json({ success: true, items: campaigns });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if ('error' in admin) return admin.error;

  try {
    await dbConnect();
    const body = await request.json();
    const action = body?.action || 'save';

    if (action === 'previewAudience') {
      const audience = body.audience;
      if (!audience?.type) {
        return NextResponse.json({ error: 'Audience type missing' }, { status: 400 });
      }

      const recipients = await resolveCampaignRecipients(audience);
      return NextResponse.json({
        success: true,
        count: recipients.length,
        sample: recipients.slice(0, 10),
      });
    }

    if (action === 'send') {
      const campaignId = body.campaignId;
      if (!campaignId) {
        return NextResponse.json({ error: 'campaignId missing' }, { status: 400 });
      }

      const result = await dispatchEmailCampaign(campaignId, admin.auth.userId);
      if (!result.success) {
        return NextResponse.json(result, { status: 400 });
      }

      return NextResponse.json(result);
    }

    const payload = body.campaign || body;
    const audience = payload.audience || { type: 'all_users' };

    if (!payload.name || !payload.subject || !payload.body) {
      return NextResponse.json({ error: 'name, subject and body are required' }, { status: 400 });
    }

    const validAudienceTypes = new Set([
      'all_users',
      'admins',
      'notifications_enabled',
      'recent_users',
      'custom_emails',
    ]);

    if (!validAudienceTypes.has(audience.type)) {
      return NextResponse.json({ error: 'Audience type invalid' }, { status: 400 });
    }

    const resolvedRecipients = await resolveCampaignRecipients(audience);
    const campaignData = {
      name: String(payload.name).trim(),
      description: payload.description ? String(payload.description).trim() : '',
      subject: String(payload.subject),
      body: String(payload.body),
      templateId: payload.templateId || undefined,
      status: 'draft' as const,
      audience: {
        type: audience.type,
        customEmails: Array.isArray(audience.customEmails) ? audience.customEmails : [],
        daysSinceSignup: Number.isFinite(audience.daysSinceSignup) ? Number(audience.daysSinceSignup) : 30,
        lastResolvedCount: resolvedRecipients.length,
      },
      createdBy: admin.auth.userId,
    };

    let campaign;
    if (payload._id) {
      campaign = await EmailCampaign.findByIdAndUpdate(
        payload._id,
        {
          $set: campaignData,
        },
        { new: true }
      );
    } else {
      campaign = await EmailCampaign.create(campaignData);
    }

    return NextResponse.json({
      success: true,
      item: campaign,
      audiencePreviewCount: resolvedRecipients.length,
    });
  } catch (error) {
    console.error('Email campaigns API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const admin = await requireAdmin(request);
  if ('error' in admin) return admin.error;

  await dbConnect();
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID missing' }, { status: 400 });
  }

  await EmailCampaign.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
