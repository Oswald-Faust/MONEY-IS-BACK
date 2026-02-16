import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { PLAN_LIMITS } from '@/lib/limits';

// GET /api/workspaces - Récupérer les workspaces de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };

    // Récupérer les workspaces où l'utilisateur est propriétaire ou membre
    const rawWorkspaces = await Workspace.find({
      $or: [
        { owner: decoded.userId },
        { 'members.user': decoded.userId }
      ]
    }).sort({ createdAt: -1 });

    const { stripe } = await import('@/lib/stripe');
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('session_id');
    
    // Live sync with Stripe for paid plans if data is missing or stale
    const workspaces = await Promise.all(rawWorkspaces.map(async (ws) => {
      let subId = ws.subscriptionId;
      let customerId = ws.stripeCustomerId;

      // Special case: if session_id is provided, try to find the subscription from session
      if (sessionId && (!subId || ws.subscriptionStatus !== 'active')) {
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          if (session.metadata?.workspaceId === ws._id.toString() && session.subscription) {
            subId = session.subscription as string;
            ws.subscriptionId = subId;
            customerId = session.customer as string;
            ws.stripeCustomerId = customerId;
            if (session.metadata.planId) {
              ws.subscriptionPlan = session.metadata.planId as any;
            }
          }
        } catch (err) {
          console.error('Session sync error:', err);
        }
      }

      // SYNC FALLBACK 1: If customerId is missing, try to find it by owner's email
      if (!customerId && ws.subscriptionPlan !== 'starter') {
         try {
           const owner = await User.findById(ws.owner);
           if (owner?.email) {
             const customerByEmail = await stripe.customers.list({ email: owner.email, limit: 1 });
             if (customerByEmail.data.length > 0) {
               customerId = customerByEmail.data[0].id;
               ws.stripeCustomerId = customerId;
             }
           }
         } catch (err) {
           console.error('Email customer sync error:', err);
         }
      }

      // SYNC FALLBACK 2: If we still don't have a subId but have a customerId, look for ANY subscriptions
      if (!subId && customerId && ws.subscriptionPlan !== 'starter') {
        try {
          const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            limit: 1,
          });
          if (subscriptions.data.length > 0) {
            const activeSub = subscriptions.data[0] as any;
            subId = activeSub.id;
            ws.subscriptionId = subId;
            ws.subscriptionStatus = activeSub.status;
            if (activeSub.current_period_end) {
              ws.subscriptionEnd = new Date(activeSub.current_period_end * 1000);
            }
            ws.subscriptionInterval = activeSub.items.data[0].plan.interval as any;
            if (activeSub.metadata?.planId) {
              ws.subscriptionPlan = activeSub.metadata.planId;
            }
          }
        } catch (err) {
          console.error('Customer sub sync fallback error:', err);
        }
      }

      // If we have a subId, ensure we have the latest info
      if (subId) {
        try {
          const subscription = await stripe.subscriptions.retrieve(subId) as any;
          if (subscription) {
            ws.subscriptionStatus = subscription.status;
            if (subscription.current_period_end) {
              ws.subscriptionEnd = new Date(subscription.current_period_end * 1000);
            }
            ws.subscriptionInterval = subscription.items.data[0].plan.interval;
            // Force sync plan from metadata if available
            if (subscription.metadata?.planId) {
              ws.subscriptionPlan = subscription.metadata.planId;
            }
            await ws.save();
          }
        } catch (err) {
          console.error(`Failed to sync subscription ${subId} for workspace ${ws._id}`, err);
        }
      } else if (ws.isModified()) {
        await ws.save();
      }
      
      return ws.toObject();
    }));

    return NextResponse.json({
      success: true,
      data: workspaces,
    });
  } catch (error) {
    console.error('Error fetching workspaces:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des workspaces' },
      { status: 500 }
    );
  }
}

// POST /api/workspaces - Créer un nouveau workspace
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Vérifier l'authentification
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as { userId: string };
    const userId = decoded.userId;

    const body = await request.json();
    const { name, description, useCase, theme, icon, image, defaultProjectColor, invitedEmails } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Le nom du workspace est requis' },
        { status: 400 }
      );
    }

    // Check workspace limits and inherit plan
    const existingWorkspaces = await Workspace.find({ owner: userId });
    const premiumWs = existingWorkspaces.find(ws => 
      ['team', 'enterprise'].includes(ws.subscriptionPlan) && ws.subscriptionStatus === 'active'
    );
    
    // Determine the current plan based on existing premium workspaces or default to starter
    const currentPlan = premiumWs ? premiumWs.subscriptionPlan : 'starter';
    const limit = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS]?.maxWorkspaces || 1;

    if (existingWorkspaces.length >= limit) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Limite de workspaces atteinte pour le plan ${currentPlan.toUpperCase()}.`,
          currentLimit: limit,
          currentCount: existingWorkspaces.length
        },
        { status: 403 }
      );
    }

    // Créer le workspace
    const workspace = await Workspace.create({
      name,
      description: description || '',
      owner: userId,
      members: [
        {
          user: userId,
          role: 'admin',
          joinedAt: new Date(),
        },
      ],
      useCase: useCase || 'other',
      subscriptionPlan: currentPlan, // Inherit plan
      subscriptionStatus: premiumWs ? 'active' : 'inactive', // Inherit status
      stripeCustomerId: premiumWs?.stripeCustomerId, // Link to same customer if premium
      settings: {
        defaultProjectColor: defaultProjectColor || '#6366f1',
        allowInvitations: true,
        icon: icon || 'Briefcase',
        theme: theme || 'dark',
        image: image || undefined,
      }
    });

    // Mettre à jour l'utilisateur pour ajouter le workspace
    await User.findByIdAndUpdate(userId, {
      $push: { workspaces: workspace._id }
    });

    // Handle Invitations
    if (invitedEmails && Array.isArray(invitedEmails) && invitedEmails.length > 0) {
      const Invitations = (await import('@/models/Invitation')).default;
      const { v4: uuidv4 } = await import('uuid'); // Dynamic import for uuid if needed or use native crypto

      const invitePromises = invitedEmails.map(async (email: string) => {
        // Validate email format if needed
        if (!email || !email.includes('@')) return;

        try {
          // Check if already invited
          const existing = await Invitations.findOne({ 
             email: email.toLowerCase(), 
             workspace: workspace._id,
             status: 'pending'
          });
          
          if (!existing) {
             await Invitations.create({
                email: email.toLowerCase(),
                workspace: workspace._id,
                role: 'editor', // Default role
                token: uuidv4(),
                inviter: userId,
                status: 'pending',
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
             });
          }
        } catch (err) {
          console.error(`Failed to invite ${email}`, err);
        }
      });
      
      await Promise.all(invitePromises);
    }

    return NextResponse.json({
      success: true,
      data: workspace,
      message: 'Workspace créé avec succès'
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du workspace';
    console.error('Error creating workspace:', error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
