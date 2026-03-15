import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { verifyAuth } from '@/lib/auth';
import { generateSearchInsight } from '@/lib/ai';
import { ensureWorkspaceAccess } from '@/lib/ai/access';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const auth = await verifyAuth(request);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const workspaceId = searchParams.get('workspaceId');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ success: true, data: { reply: '' } });
    }

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'Workspace ID requis' }, { status: 400 });
    }

    const access = await ensureWorkspaceAccess(workspaceId, auth.userId, auth.role);
    if (!access.ok) {
      return access.error;
    }

    const insight = await generateSearchInsight({ workspaceId, query: query.trim() });

    return NextResponse.json({
      success: true,
      data: {
        reply: insight.reply,
        provider: insight.provider,
        model: insight.model,
      },
    });
  } catch (error: any) {
    console.error('AI Search error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur lors de la recherche IA' },
      { status: 500 }
    );
  }
}
