export type SubscriptionPlan = 'free' | 'premium';

export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  subscription_plan: SubscriptionPlan;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Generation {
  id: string;
  user_id: string;
  original_text: string;
  translated_text: string | null;
  hashtags: string[] | null;
  optimal_post_time: string | null;
  created_at: string;
}

export interface UsageTracking {
  id: string;
  user_id: string;
  generation_count: number;
  month_year: string;
  created_at: string;
  updated_at: string;
}

