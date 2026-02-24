import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import EmailConfig from '@/models/EmailConfig';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  let config = await EmailConfig.findOne();
  
  if (!config) {
    config = await EmailConfig.create({});
  }

  return NextResponse.json(config);
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (!auth.success || auth.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    await dbConnect();
    
    let config = await EmailConfig.findOne();
  if (config) {
      config.smtp = { ...config.smtp, ...(data.smtp || {}) };
      config.automations = {
        ...config.automations,
        ...(data.automations || {}),
      };
      await config.save();
    } else {
      config = await EmailConfig.create(data);
    }

    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
