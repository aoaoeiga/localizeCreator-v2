import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { generateLocalizedContent } from '@/lib/openai';
import { createServerClient } from '@/lib/supabase';
import { authOptions } from '@/lib/auth-options';
import { getYouTubeTranscript } from '@/lib/youtube';

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
    // Check OpenAI API key first
    if (!process.env.OPENAI_API_KEY) {
      console.error('[Generate API] OpenAI API key is not configured');
      return NextResponse.json(
        { 
          error: 'OpenAI API key is not configured',
          details: 'Please configure OPENAI_API_KEY environment variable'
        },
        { status: 500 }
      );
    }

    // Check authentication
    let session;
    try {
      session = await getServerSession(authOptions);
    } catch (authError: any) {
      console.error('[Generate API] Authentication error:', authError);
      return NextResponse.json(
        { 
          error: 'Authentication failed',
          details: authError.message || 'Failed to verify session'
        },
        { status: 401 }
      );
    }

    if (!session?.user) {
      console.error('[Generate API] Unauthorized: No session or user');
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          details: 'Please sign in to generate content'
        },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    if (!userId) {
      console.error('[Generate API] User ID not found in session:', session.user);
      return NextResponse.json(
        { 
          error: 'User ID not found',
          details: 'User session is invalid. Please sign in again.'
        },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError: any) {
      console.error('[Generate API] JSON parse error:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          details: 'Request body must be valid JSON'
        },
        { status: 400 }
      );
    }

    const { platform, videoUrl } = requestBody;

    // Validate platform
    if (!platform) {
      console.error('[Generate API] Missing platform');
      return NextResponse.json(
        { 
          error: 'Platform is required',
          details: 'Please select a platform (YouTube, TikTok, or Instagram)'
        },
        { status: 400 }
      );
    }

    if (!['youtube', 'tiktok', 'instagram'].includes(platform)) {
      console.error('[Generate API] Invalid platform:', platform);
      return NextResponse.json(
        { 
          error: 'Invalid platform',
          details: `Platform must be one of: youtube, tiktok, instagram. Received: ${platform}`
        },
        { status: 400 }
      );
    }

    // Validate video URL
    if (!videoUrl) {
      console.error('[Generate API] Missing video URL');
      return NextResponse.json(
        { 
          error: 'Video URL is required',
          details: 'Please provide a valid video URL'
        },
        { status: 400 }
      );
    }

    if (typeof videoUrl !== 'string') {
      console.error('[Generate API] Invalid video URL type:', typeof videoUrl);
      return NextResponse.json(
        { 
          error: 'Invalid video URL type',
          details: 'Video URL must be a string'
        },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(videoUrl);
    } catch (urlError: any) {
      console.error('[Generate API] Invalid URL format:', videoUrl, urlError);
      return NextResponse.json(
        { 
          error: 'Invalid video URL format',
          details: `The provided URL is not valid: ${urlError.message}`
        },
        { status: 400 }
      );
    }

    // Extract video information based on platform
    let videoId: string | null = null;
    try {
      if (platform === 'youtube') {
        videoId = extractYouTubeVideoId(videoUrl);
      } else if (platform === 'tiktok') {
        videoId = extractTikTokVideoId(videoUrl);
      } else if (platform === 'instagram') {
        videoId = extractInstagramVideoId(videoUrl);
      }
    } catch (extractError: any) {
      console.error('[Generate API] Error extracting video ID:', extractError);
      // Continue even if extraction fails - it's not critical
    }

    // Fetch subtitles automatically
    let subtitles = '';
    try {
      if (platform === 'youtube') {
        // For YouTube, try to fetch transcript automatically
        try {
          subtitles = await getYouTubeTranscript(videoUrl);
        } catch (transcriptError: any) {
          console.error('[Generate API] Failed to fetch YouTube transcript:', transcriptError);
          return NextResponse.json(
            { 
              error: 'Failed to fetch video transcript',
              details: transcriptError.message || 'Could not retrieve subtitles for this video. Please ensure the video has captions enabled.'
            },
            { status: 400 }
          );
        }
      } else {
        // For TikTok and Instagram, we would need their APIs or manual input
        // For now, return an error asking for manual subtitle input
        return NextResponse.json(
          { 
            error: 'Automatic transcript not available',
            details: `Automatic transcript fetching is currently only available for YouTube videos. For ${platform === 'tiktok' ? 'TikTok' : 'Instagram'}, please provide subtitles manually.`
          },
          { status: 400 }
        );
      }
    } catch (subtitleError: any) {
      console.error('[Generate API] Error fetching subtitles:', subtitleError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch subtitles',
          details: subtitleError.message || 'An error occurred while fetching video subtitles'
        },
        { status: 500 }
      );
    }

    if (!subtitles || subtitles.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'No subtitles found',
          details: 'The video does not have any available subtitles'
        },
        { status: 400 }
      );
    }

    // Generate content using OpenAI
    let result;
    try {
      result = await generateLocalizedContent({
        subtitles: subtitles.trim(),
        platform,
        videoUrl,
      });
    } catch (openaiError: any) {
      console.error('[Generate API] OpenAI generation error:', {
        error: openaiError,
        message: openaiError.message,
        stack: openaiError.stack,
        platform,
        subtitlesLength: subtitles.length,
      });
      
      // Provide more specific error messages
      if (openaiError.message?.includes('API key')) {
        return NextResponse.json(
          { 
            error: 'OpenAI API key error',
            details: 'OpenAI API key is invalid or not configured properly'
          },
          { status: 500 }
        );
      }
      
      if (openaiError.message?.includes('rate limit')) {
        return NextResponse.json(
          { 
            error: 'OpenAI rate limit exceeded',
            details: 'Please try again in a few moments'
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to generate localized content',
          details: openaiError.message || 'An error occurred while generating content'
        },
        { status: 500 }
      );
    }

    // Save to database
    const supabase = createServerClient();
    let generation;
    try {
      const { data, error: dbError } = await supabase
        .from('generations')
        .insert({
          user_id: userId,
          original_text: subtitles.trim(),
          translated_title: result.translatedTitle,
          translated_description: result.translatedDescription,
          hashtags: result.hashtags,
          optimal_post_time: result.optimalPostTime,
          cultural_advice: result.culturalAdvice,
        })
        .select()
        .single();

      if (dbError) {
        console.error('[Generate API] Database error:', {
          error: dbError,
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          userId,
        });
        // Continue even if DB save fails - return the result anyway
      } else {
        generation = data;
      }
    } catch (dbError: any) {
      console.error('[Generate API] Database exception:', {
        error: dbError,
        message: dbError.message,
        stack: dbError.stack,
        userId,
      });
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
        transcript: result.transcript,
      },
    });
  } catch (error: any) {
    console.error('[Generate API] Unexpected error:', {
      error,
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' 
          ? error.message || 'An unexpected error occurred'
          : 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    );
  }
}
