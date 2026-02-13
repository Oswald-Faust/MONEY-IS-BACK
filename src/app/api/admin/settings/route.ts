import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import GlobalSettings from '@/models/GlobalSettings';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    let settings = await GlobalSettings.findOne();

    if (!settings) {
      settings = await GlobalSettings.create({});
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();

    let settings = await GlobalSettings.findOne();

    if (!settings) {
      settings = await GlobalSettings.create({ permissions: body.permissions });
    } else {
      settings.permissions = { ...settings.permissions, ...body.permissions };
      await settings.save();
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
