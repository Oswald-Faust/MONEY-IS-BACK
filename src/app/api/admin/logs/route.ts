import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SystemLog from '@/models/SystemLog';
import { verifyAuth } from '@/lib/auth';
import '@/models/User'; // Import user model to ensure it's registered

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const logs = await SystemLog.find()
      .populate('user', 'firstName lastName email details status ip createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
