import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import Stripe from 'stripe';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook Error: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  await dbConnect();

  const session = event.data.object as Stripe.Checkout.Session;

  console.log(`Processing Stripe event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const workspaceId = session.metadata?.workspaceId;
      const planId = session.metadata?.planId;
      const subscriptionId = session.subscription as string;
      
      console.log(`Checkout completed for workspace: ${workspaceId}, plan: ${planId}`);
      
      if (!workspaceId || !subscriptionId) {
        console.error('Missing workspaceId or subscriptionId in metadata');
        break;
      }

      const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription;
      
      const update = {
        subscriptionId: subscriptionId,
        subscriptionPlan: planId,
        subscriptionStatus: subscription.status,
        subscriptionPriceId: subscription.items.data[0].price.id,
        subscriptionInterval: subscription.items.data[0].plan.interval,
        subscriptionEnd: new Date((subscription as any).current_period_end * 1000),
      };

      console.log('Updating workspace with:', update);
      
      const updatedWorkspace = await Workspace.findByIdAndUpdate(workspaceId, update, { new: true });
      console.log('Updated workspace result:', updatedWorkspace?.subscriptionPlan);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);

      const update = {
        subscriptionStatus: subscription.status,
        subscriptionEnd: new Date((subscription as any).current_period_end * 1000),
      };

      await Workspace.findOneAndUpdate({ subscriptionId: subscription.id }, update);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription deleted: ${subscription.id}`);

      await Workspace.findOneAndUpdate({ subscriptionId: subscription.id }, {
        subscriptionStatus: 'canceled',
        subscriptionPlan: 'starter',
      });
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
