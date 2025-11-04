import Stripe from 'stripe';

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeSingleton) return stripeSingleton;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_MISCONFIGURED');
  }
  const configuredVersion = process.env.STRIPE_API_VERSION as Stripe.LatestApiVersion | undefined;
  const fallbackVersion = '2023-10-16';
  stripeSingleton = new Stripe(key, { apiVersion: (configuredVersion ?? fallbackVersion) as Stripe.LatestApiVersion });
  return stripeSingleton;
}





