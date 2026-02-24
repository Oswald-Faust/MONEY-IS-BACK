import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import EmailCampaign from '@/models/EmailCampaign';
import EmailSendLog from '@/models/EmailSendLog';

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  const now = new Date();
  const since30d = new Date(now);
  since30d.setDate(since30d.getDate() - 30);

  const since7d = startOfDay(new Date(now));
  since7d.setDate(since7d.getDate() - 6);

  const [statusAgg, categoryAgg, dailyAgg, topTemplates, topCampaigns, recentFailures, campaignAgg] = await Promise.all([
    EmailSendLog.aggregate([
      { $match: { createdAt: { $gte: since30d } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    EmailSendLog.aggregate([
      { $match: { createdAt: { $gte: since30d } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
    EmailSendLog.aggregate([
      { $match: { createdAt: { $gte: since7d } } },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
    ]),
    EmailSendLog.aggregate([
      { $match: { createdAt: { $gte: since30d }, templateName: { $exists: true, $ne: null }, status: 'sent' } },
      { $group: { _id: '$templateName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    EmailSendLog.aggregate([
      { $match: { createdAt: { $gte: since30d }, category: 'campaign', campaignName: { $exists: true, $ne: null }, status: 'sent' } },
      { $group: { _id: '$campaignName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    EmailSendLog.find({ status: 'failed' })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('to subject category templateName campaignName errorMessage createdAt')
      .lean(),
    EmailCampaign.aggregate([
      { $match: { createdAt: { $gte: since30d } } },
      {
        $group: {
          _id: null,
          totalCampaigns: { $sum: 1 },
          sentCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] },
          },
          failedCampaigns: {
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const statusCounts: Record<string, number> = { sent: 0, failed: 0, skipped: 0 };
  for (const row of statusAgg as Array<{ _id: string; count: number }>) {
    if (row._id) statusCounts[row._id] = row.count;
  }

  const totalAttempts = Object.values(statusCounts).reduce((sum, n) => sum + n, 0);
  const successRate = totalAttempts > 0 ? (statusCounts.sent / totalAttempts) * 100 : 0;

  const categoryCounts: Record<string, number> = {};
  for (const row of categoryAgg as Array<{ _id: string; count: number }>) {
    if (row._id) categoryCounts[row._id] = row.count;
  }

  const dailyMap = new Map<string, { sent: number; failed: number; skipped: number }>();
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(since7d);
    d.setDate(since7d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dailyMap.set(key, { sent: 0, failed: 0, skipped: 0 });
  }

  for (const row of dailyAgg as Array<{ _id: { day: string; status: string }; count: number }>) {
    const day = row._id?.day;
    const statusKey = row._id?.status;
    if (!day || !statusKey) continue;
    const current = dailyMap.get(day) || { sent: 0, failed: 0, skipped: 0 };
    if (statusKey in current) {
      current[statusKey as keyof typeof current] = row.count;
    }
    dailyMap.set(day, current);
  }

  const campaignSummary = (campaignAgg as Array<{ totalCampaigns: number; sentCampaigns: number; failedCampaigns: number }>)[0] || {
    totalCampaigns: 0,
    sentCampaigns: 0,
    failedCampaigns: 0,
  };

  return NextResponse.json({
    success: true,
    overview: {
      periodDays: 30,
      totalAttempts,
      sent: statusCounts.sent || 0,
      failed: statusCounts.failed || 0,
      skipped: statusCounts.skipped || 0,
      successRate: Number(successRate.toFixed(2)),
      campaignsCreated: campaignSummary.totalCampaigns || 0,
      campaignsSent: campaignSummary.sentCampaigns || 0,
      campaignsFailed: campaignSummary.failedCampaigns || 0,
    },
    categories: categoryCounts,
    daily: [...dailyMap.entries()].map(([date, counts]) => ({ date, ...counts })),
    topTemplates: (topTemplates as Array<{ _id: string; count: number }>).map((row) => ({ name: row._id, count: row.count })),
    topCampaigns: (topCampaigns as Array<{ _id: string; count: number }>).map((row) => ({ name: row._id, count: row.count })),
    recentFailures,
  });
}
