import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const plan = searchParams.get('plan');
    const status = searchParams.get('status');

    await dbConnect();

    const query: any = {};
    if (plan && plan !== 'all') query.subscriptionPlan = plan;
    if (status && status !== 'all') query.subscriptionStatus = status;

    const workspaces = await Workspace.find(query)
      .sort({ updatedAt: -1 })
      .populate('owner', 'firstName lastName email avatar');

    // Calculate revenue stats
    const stats = await Workspace.aggregate([
      {
        $group: {
          _id: '$subscriptionPlan',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$subscriptionStatus', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    // Calculate MRR
    const pricing: any = { starter: 0, pro: 29, business: 99, enterprise: 499 };
    const mrr = workspaces.reduce((acc, ws) => {
      if (ws.subscriptionStatus === 'active') {
        return acc + (pricing[ws.subscriptionPlan] || 0);
      }
      return acc;
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        workspaces,
        stats,
        mrr,
        totalActive: workspaces.filter((w: any) => w.subscriptionStatus === 'active').length
      }
    });
  } catch (error: any) {
    console.error('Admin Subscriptions Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
