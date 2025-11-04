import { Request, Response } from 'express';
import { markOrderPaidByPaymentIntent } from '../services/order.service';
import { getStripe } from '../utils/stripe';

export async function stripeWebhook(req: Request, res: Response) {
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: { code: 'CONFIG_ERROR', message: 'Stripe webhook not configured', traceId: res.locals.traceId || '' } });
  }
  const stripe = getStripe();
  const sig = req.headers['stripe-signature'] as string;
  let event: any;
  try {
    event = stripe.webhooks.constructEvent((req as any).rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (_err) {
    return res.status(400).send('Webhook Error');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const pi = session.payment_intent as string | null;
        if (pi) await markOrderPaidByPaymentIntent(pi, event.id);
        break;
      }
      case 'payment_intent.succeeded': {
        const pi = event.data.object.id as string;
        await markOrderPaidByPaymentIntent(pi, event.id);
        break;
      }
    }
  } catch (_e) {
    // log nếu có logger
  }

  res.json({ received: true });
}


