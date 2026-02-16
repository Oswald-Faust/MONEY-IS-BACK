import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import Workspace from '@/models/Workspace';
import dbConnect from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { workspaceId, planId, billingCycle } = await req.json();

    if (!workspaceId || !planId || !billingCycle) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
    }

    await dbConnect();
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      return NextResponse.json({ error: 'Workspace non trouvé' }, { status: 404 });
    }

    // Check if user is owner
    if (workspace.owner.toString() !== auth.userId) {
       return NextResponse.json({ error: 'Seul le propriétaire peut gérer l\'abonnement' }, { status: 403 });
    }

    // Define price configuration ad-hoc (no need to create in Stripe Dashboard)
    const priceConfigs: Record<string, { name: string; monthly: { amount: number; interval: 'month' | 'year' }; yearly: { amount: number; interval: 'month' | 'year' } }> = {
      starter: {
        name: 'Plan Gratuit',
        monthly: { amount: 0, interval: 'month' },
        yearly: { amount: 0, interval: 'year' },
      },
      pro: {
        name: 'Plan Pro',
        monthly: { amount: 999, interval: 'month' }, // 9.99€
        yearly: { amount: 8990, interval: 'year' },  // 8.99€/mois (89.90€/an)
      },
      team: {
        name: 'Plan Team',
        monthly: { amount: 2999, interval: 'month' }, // 29.99€
        yearly: { amount: 24990, interval: 'year' },  // 24.99€/mois (249.90€/an)
      }
    };

    const config = priceConfigs[planId as string];
    if (!config && planId !== 'enterprise' && planId !== 'starter') {
       return NextResponse.json({ error: 'Plan non configuré' }, { status: 400 });
    }

    const priceData = config[billingCycle as 'monthly' | 'yearly'];

    // Create or get Stripe Customer
    let stripeCustomerId = workspace.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: auth.email!,
        metadata: {
          workspaceId: workspaceId,
        },
      });
      stripeCustomerId = customer.id;
      workspace.stripeCustomerId = stripeCustomerId;
      await workspace.save();
    }

    // Create Checkout Session with price_data (Ad-hoc)
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: config.name,
              description: `Abonnement MONEY IS BACK - ${planId} (${billingCycle})`,
            },
            unit_amount: priceData.amount,
            recurring: {
              interval: priceData.interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      payment_method_collection: 'always', // Force card collection
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?success=true&planId=${planId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/upgrade?canceled=true`,
      metadata: {
        workspaceId,
        planId,
      },
      subscription_data: {
        metadata: {
            workspaceId,
            planId,
        }
      }
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur Stripe';
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
