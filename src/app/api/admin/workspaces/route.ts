import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import Project from '@/models/Project';
import { verifyAuth } from '@/lib/auth';
import { PLAN_LIMITS } from '@/lib/limits';

const ALLOWED_PLANS = Object.keys(PLAN_LIMITS);
const ALLOWED_STATUSES = ['active', 'inactive', 'trialing', 'past_due', 'canceled', 'unpaid'];
const ALLOWED_INTERVALS = ['month', 'year'];

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || (auth as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const search = searchParams.get('search') || '';

    await dbConnect();

    const query: any = {};
    if (userId) {
      query.$or = [
        { owner: userId },
        { 'members.user': userId }
      ];
    }
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const workspaces = await Workspace.find(query)
      .sort({ createdAt: -1 })
      .populate('owner', 'firstName lastName email avatar');

    // For each workspace, get project and task counts
    const workspacesWithStats = await Promise.all(workspaces.map(async (ws) => {
      const projectsCount = await Project.countDocuments({ workspace: ws._id });
      return {
        ...ws.toObject(),
        projectsCount
      };
    }));

    return NextResponse.json({
      success: true,
      data: workspacesWithStats
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      workspaceId,
      subscriptionPlan,
      subscriptionStatus,
      subscriptionInterval,
      subscriptionEnd,
    } = body as {
      workspaceId?: string;
      subscriptionPlan?: string;
      subscriptionStatus?: string;
      subscriptionInterval?: string | null;
      subscriptionEnd?: string | null;
    };

    if (!workspaceId) {
      return NextResponse.json({ success: false, error: 'workspaceId requis' }, { status: 400 });
    }

    if (!subscriptionPlan && !subscriptionStatus && subscriptionInterval === undefined && subscriptionEnd === undefined) {
      return NextResponse.json(
        { success: false, error: 'Aucune modification fournie' },
        { status: 400 }
      );
    }

    await dbConnect();

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return NextResponse.json({ success: false, error: 'Workspace introuvable' }, { status: 404 });
    }

    if (subscriptionPlan !== undefined) {
      const normalizedPlan = subscriptionPlan === 'free' ? 'starter' : subscriptionPlan;
      if (!ALLOWED_PLANS.includes(normalizedPlan)) {
        return NextResponse.json(
          { success: false, error: `Plan invalide. Plans autorisés: ${ALLOWED_PLANS.join(', ')}` },
          { status: 400 }
        );
      }

      workspace.subscriptionPlan = normalizedPlan as any;
    }

    if (subscriptionStatus !== undefined) {
      if (!ALLOWED_STATUSES.includes(subscriptionStatus)) {
        return NextResponse.json(
          { success: false, error: `Statut invalide. Statuts autorisés: ${ALLOWED_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }

      workspace.subscriptionStatus = subscriptionStatus;
    }

    if (subscriptionInterval !== undefined) {
      if (subscriptionInterval === null || subscriptionInterval === '') {
        workspace.subscriptionInterval = undefined;
      } else {
        if (!ALLOWED_INTERVALS.includes(subscriptionInterval)) {
          return NextResponse.json(
            { success: false, error: `Intervalle invalide. Valeurs: ${ALLOWED_INTERVALS.join(', ')}` },
            { status: 400 }
          );
        }
        workspace.subscriptionInterval = subscriptionInterval as any;
      }
    }

    if (subscriptionEnd !== undefined) {
      if (!subscriptionEnd) {
        workspace.subscriptionEnd = undefined;
      } else {
        const parsed = new Date(subscriptionEnd);
        if (Number.isNaN(parsed.getTime())) {
          return NextResponse.json(
            { success: false, error: 'Date de fin invalide' },
            { status: 400 }
          );
        }
        workspace.subscriptionEnd = parsed;
      }
    }

    await workspace.save();

    const updated = await Workspace.findById(workspaceId)
      .populate('owner', 'firstName lastName email avatar');

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Abonnement workspace mis à jour',
    });
  } catch (error: any) {
    console.error('Admin workspace patch error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
