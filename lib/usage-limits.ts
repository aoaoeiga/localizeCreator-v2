import { createServerClient } from './supabase';
import type { SubscriptionPlan } from './db.types';

const FREE_TIER_LIMIT = 10;
const PREMIUM_TIER_LIMIT = 1000;

export function getUsageLimit(plan: SubscriptionPlan): number {
  return plan === 'premium' ? PREMIUM_TIER_LIMIT : FREE_TIER_LIMIT;
}

export async function checkUsageLimit(
  userId: string,
  plan: SubscriptionPlan
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const supabase = createServerClient();
  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Get or create usage tracking
  const { data: usage, error } = await supabase
    .from('usage_tracking')
    .select('generation_count')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .single();

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "not found" error
    console.error('Error checking usage:', error);
    return { allowed: false, current: 0, limit: getUsageLimit(plan) };
  }

  const current = usage?.generation_count || 0;
  const limit = getUsageLimit(plan);

  return {
    allowed: current < limit,
    current,
    limit,
  };
}

export async function incrementUsage(userId: string): Promise<void> {
  const supabase = createServerClient();
  const now = new Date();
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Try to update existing record
  const { data: existing } = await supabase
    .from('usage_tracking')
    .select('id, generation_count')
    .eq('user_id', userId)
    .eq('month_year', monthYear)
    .single();

  if (existing) {
    await supabase
      .from('usage_tracking')
      .update({
        generation_count: existing.generation_count + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    // Create new record
    await supabase.from('usage_tracking').insert({
      user_id: userId,
      generation_count: 1,
      month_year: monthYear,
    });
  }
}

