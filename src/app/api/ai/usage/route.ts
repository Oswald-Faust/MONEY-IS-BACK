import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import { ensureWorkspaceAccess } from '@/lib/ai/access';
import { getAIUsage } from '@/lib/ai/quota';

/**
 * GET /api/ai/usage?workspaceId=xxx&month=2026-04
 * Retourne la consommation IA mensuelle du workspace.
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const month = searchParams.get('month') ?? undefined; // format "YYYY-MM"

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId requis' }, { status: 400 });
    }

    const access = await ensureWorkspaceAccess(workspaceId, auth.userId, auth.role);
    if (!access.ok) {
      return access.error;
    }

    const usage = await getAIUsage(workspaceId, month);

    return NextResponse.json({ success: true, data: usage });
  } catch (error) {
    console.error('AI usage error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'usage IA' },
      { status: 500 }
    );
  }
}
