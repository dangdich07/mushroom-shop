import type { Request, Response } from 'express';
import { markOrderPaidByPaymentIntent } from '../services/order.service';
import { getStripe } from '../utils/stripe';

export async function stripeWebhook(req: Request, res: Response) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || !secretKey) {
    return res.status(500).json({
      error: {
        code: 'CONFIG_ERROR',
        message: 'Stripe webhook not configured',
        traceId: res.locals.traceId || '',
      },
    });
  }

  const stripe = getStripe();
  const sig = req.headers['stripe-signature'] as string;

  let event: any;
  try {
    event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      sig,
      webhookSecret,
    );
  } catch (err: any) {
    console.error('❌ Stripe webhook signature error:', err?.message || err);
    return res.status(400).send('Webhook Error');
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const paymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;

        const idemKey = session.metadata?.idemKey || event.id;
        const orderId = session.metadata?.orderId || null;

        if (paymentIntentId) {
          await markOrderPaidByPaymentIntent(paymentIntentId, idemKey, orderId);
        }
        break;
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as any;
        const paymentIntentId = pi.id as string;
        const idemKey = pi.metadata?.idemKey || event.id;
        const orderId = pi.metadata?.orderId || null;

        await markOrderPaidByPaymentIntent(paymentIntentId, idemKey, orderId);
        break;
      }

      default:
        // Các event khác không cần xử lý
        break;
    }
  } catch (e) {
    console.error('[stripeWebhook] handler error', e);
  }

  res.json({ received: true });
}
