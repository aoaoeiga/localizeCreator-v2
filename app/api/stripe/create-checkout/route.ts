import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { createCheckoutSession } from '@/lib/stripe';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const email = session.user.email;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID or email not found' },
        { status: 400 }
      );
    }

    // Get user's Stripe customer ID if exists
    const supabase = createServerClient();
    const { data: user } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    const checkoutSession = await createCheckoutSession(
      user?.stripe_customer_id || null,
      userId,
      email
    );

    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

