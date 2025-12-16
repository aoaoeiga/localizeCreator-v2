import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { generateLocalizedContent } from '@/lib/openai';
import { createServerClient } from '@/lib/supabase';
import { authOptions } from '@/lib/auth-options';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

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

    // Generate content
    const result = await generateLocalizedContent(originalText);

    // Save to database
    const supabase = createServerClient();
    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        original_text: originalText,
        translated_title: result.translatedTitle,
        translated_description: result.translatedDescription,
        hashtags: result.hashtags,
        optimal_post_time: result.optimalPostTime,
        cultural_advice: result.culturalAdvice,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Continue even if DB save fails
    }

    return NextResponse.json({
      success: true,
      data: {
        id: generation?.id,
        translatedTitle: result.translatedTitle,
        translatedDescription: result.translatedDescription,
        hashtags: result.hashtags,
        optimalPostTime: result.optimalPostTime,
        culturalAdvice: result.culturalAdvice,
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

