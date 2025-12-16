import { NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { checkUsageLimit, getUsageLimit } from '@/lib/usage-limits';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const subscriptionPlan = (session.user as any).subscriptionPlan || 'free';

    if (!userId) {
      return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
    }

    const usage = await checkUsageLimit(userId, subscriptionPlan);

    return NextResponse.json({
      current: usage.current,
      limit: usage.limit,
      remaining: Math.max(0, usage.limit - usage.current),
      plan: subscriptionPlan,
    });
  } catch (error: any) {
    console.error('Usage check error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check usage' },
      { status: 500 }
    );
  }
}

