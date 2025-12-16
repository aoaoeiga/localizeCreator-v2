import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';
import { generateLocalizedContent } from '@/lib/openai';
import { checkUsageLimit, incrementUsage } from '@/lib/usage-limits';
import { createServerClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
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

    const { originalText } = await request.json();

    if (!originalText || typeof originalText !== 'string' || originalText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Original text is required' },
        { status: 400 }
      );
    }

    // Check usage limit
    const usage = await checkUsageLimit(userId, subscriptionPlan);
    if (!usage.allowed) {
      return NextResponse.json(
        {
          error: 'Usage limit exceeded',
          current: usage.current,
          limit: usage.limit,
        },
        { status: 403 }
      );
    }

    // Generate content
    const result = await generateLocalizedContent(originalText);

    // Save to database
    const supabase = createServerClient();
    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        original_text: originalText,
        translated_text: result.translatedText,
        hashtags: result.hashtags,
        optimal_post_time: result.optimalPostTime,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB save fails
    }

    // Increment usage
    await incrementUsage(userId);

    return NextResponse.json({
      success: true,
      data: {
        id: generation?.id,
        translatedText: result.translatedText,
        hashtags: result.hashtags,
        optimalPostTime: result.optimalPostTime,
      },
    });
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate content' },
      { status: 500 }
    );
  }
}

