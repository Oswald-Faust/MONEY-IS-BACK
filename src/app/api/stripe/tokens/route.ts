import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import Workspace from '@/models/Workspace';
import dbConnect from '@/lib/mongodb';

export const TOKEN_PACKS = {
  starter_pack: {
    id: 'starter_pack',
    label: 'Pack Starter',
    tokens: 200_000,
    amount: 299,        // 2,99 €
    description: '200 000 tokens IA (~40-60 échanges)',
  },
  standard_pack: {
    id: 'standard_pack',
    label: 'Pack Standard',
    tokens: 1_000_000,
    amount: 999,        // 9,99 €
    description: '1 000 000 tokens IA (~200-300 échanges)',
  },
  pro_pack: {
    id: 'pro_pack',
    label: 'Pack Pro',
    tokens: 5_000_000,
    amount: 3499,       // 34,99 €
    description: '5 000 000 tokens IA (~1 000-1 500 échanges)',
  },
} as const;

export type TokenPackId = keyof typeof TOKEN_PACKS;

/**
 * POST /api/stripe/tokens
 * Crée une session Stripe Checkout one-time pour l'achat de tokens IA.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAuth(req);
    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { workspaceId, packId } = await req.json();

    if (!workspaceId || !packId) {
      return NextResponse.json({ error: 'workspaceId et packId requis' }, { status: 400 });
    }

    const pack = TOKEN_PACKS[packId as TokenPackId];
    if (!pack) {
      return NextResponse.json({ error: 'Pack de tokens invalide' }, { status: 400 });
    }

    await dbConnect();
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: 'Workspace introuvable' }, { status: 404 });
    }

    // Seul le propriétaire peut acheter des tokens
    if (workspace.owner.toString() !== auth.userId && auth.role !== 'admin') {
      return NextResponse.json({ error: 'Seul le propriétaire peut acheter des tokens' }, { status: 403 });
    }

    // Créer ou récupérer le customer Stripe
    let stripeCustomerId = workspace.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: auth.email!,
        metadata: { workspaceId },
      });
      stripeCustomerId = customer.id;
      workspace.stripeCustomerId = stripeCustomerId;
      await workspace.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Edwin IA — ${pack.label}`,
              description: pack.description,
            },
            unit_amount: pack.amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=ai&token_success=true&pack=${packId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=ai&token_canceled=true`,
      metadata: {
        type: 'token_pack',
        workspaceId,
        packId,
        tokens: String(pack.tokens),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erreur Stripe';
    console.error('Token pack checkout error:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
