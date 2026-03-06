import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY && process.env.NODE_ENV === 'production') {
  console.error('CRITICAL: STRIPE_SECRET_KEY is missing in production!');
}

export const stripe = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-01-27.acacia' as any,
      typescript: true,
    })
  : null;

export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      'Stripe não está configurado. Define a variável STRIPE_SECRET_KEY no ficheiro .env'
    );
  }
  return stripe;
}
