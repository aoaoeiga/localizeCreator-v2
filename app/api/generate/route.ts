import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { generateLocalizedContent } from '@/lib/openai';
import { createServerClient } from '@/lib/supabase';
import { authOptions } from '@/lib/auth-options';

// Extract video ID from YouTube URL
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Extract video ID from TikTok URL
function extractTikTokVideoId(url: string): string | null {
  const patterns = [
    /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
    /vm\.tiktok\.com\/([\w]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Extract video ID from Instagram URL
function extractInstagramVideoId(url: string): string | null {
  const pattern = /instagram\.com\/(?:p|reel|tv)\/([\w-]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

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

    const { platform, videoUrl, subtitles } = await request.json();

    if (!platform || !videoUrl || !subtitles) {
      return NextResponse.json(
        { error: 'Platform, video URL, and subtitles are required' },
        { status: 400 }
      );
    }

    if (typeof subtitles !== 'string' || subtitles.trim().length === 0) {
      return NextResponse.json(
        { error: 'Subtitles text is required' },
        { status: 400 }
      );
    }

    // Validate URL
    try {
      new URL(videoUrl);
    } catch {
      return NextResponse.json(
        { error: 'Invalid video URL format' },
        { status: 400 }
      );
    }

    // Extract video information based on platform
    let videoId: string | null = null;
    if (platform === 'youtube') {
      videoId = extractYouTubeVideoId(videoUrl);
    } else if (platform === 'tiktok') {
      videoId = extractTikTokVideoId(videoUrl);
    } else if (platform === 'instagram') {
      videoId = extractInstagramVideoId(videoUrl);
    }

    // Generate content using OpenAI
    const result = await generateLocalizedContent({
      subtitles: subtitles.trim(),
      platform,
      videoUrl,
    });

    // Save to database
    const supabase = createServerClient();
    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        user_id: userId,
        original_text: subtitles,
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
        videoId,
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
