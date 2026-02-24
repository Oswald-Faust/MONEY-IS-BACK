import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import EmailSendLog from '@/models/EmailSendLog';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const { searchParams } = new URL(request.url);
  const page = Math.max(Number(searchParams.get('page') || 1), 1);
  const limit = Math.min(Math.max(Number(searchParams.get('limit') || 20), 1), 100);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const q = (searchParams.get('q') || '').trim();

  const query: Record<string, unknown> = {};

  if (status && status !== 'all') query.status = status;
  if (category && category !== 'all') query.category = category;
  if (q) {
    query.$or = [
      { to: { $regex: q, $options: 'i' } },
      { subject: { $regex: q, $options: 'i' } },
      { templateName: { $regex: q, $options: 'i' } },
      { campaignName: { $regex: q, $options: 'i' } },
    ];
  }

  const [total, items] = await Promise.all([
    EmailSendLog.countDocuments(query),
    EmailSendLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);

  return NextResponse.json({
    success: true,
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  });
}
