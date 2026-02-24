import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import dbConnect from '@/lib/mongodb';
import Workspace from '@/models/Workspace';
import Stripe from 'stripe';
import { sendPaymentNotification } from '@/lib/mail';

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
      
      const sub = subscription as any;
      const update: any = {
        subscriptionId: subscriptionId,
        subscriptionPlan: planId,
        subscriptionStatus: subscription.status,
        subscriptionPriceId: typeof subscription.items.data[0].price.id === 'string' ? subscription.items.data[0].price.id : subscription.items.data[0].price,
        subscriptionInterval: subscription.items.data[0].plan.interval,
        subscriptionEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
      };

      console.log('Updating workspace with:', update);
      
      const updatedWorkspace = await Workspace.findByIdAndUpdate(workspaceId, update, { new: true });
      console.log('Updated workspace result:', updatedWorkspace?.subscriptionPlan);

      // Send payment confirmation email
      if (session.customer_details?.email) {
        const amount = session.amount_total ? `${(session.amount_total / 100).toFixed(2)} ${session.currency?.toUpperCase()}` : 'N/A';
        sendPaymentNotification(session.customer_details.email, planId || 'pro', amount).catch(err => {
          console.error('Error sending payment notification email:', err);
        });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);

      const sub = subscription as any;
      const update: any = {
        subscriptionStatus: subscription.status,
        subscriptionEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : undefined,
      };

      // Also sync plan if it's in metadata (handles plan changes via Stripe)
      if (subscription.metadata?.planId) {
        update.subscriptionPlan = subscription.metadata.planId;
      }
      
      if (subscription.items.data[0]?.plan?.interval) {
        update.subscriptionInterval = subscription.items.data[0].plan.interval;
      }

      await Workspace.findOneAndUpdate({ subscriptionId: subscription.id }, update);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`Subscription deleted: ${subscription.id}`);

      await Workspace.findOneAndUpdate({ subscriptionId: subscription.id }, {
        subscriptionStatus: 'canceled',
        subscriptionPlan: 'starter',
        subscriptionEnd: null,
      });
      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
