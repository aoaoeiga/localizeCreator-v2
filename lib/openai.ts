import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || '';

if (!apiKey) {
  console.warn('OpenAI API key is missing');
}

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export interface TranscriptLine {
  en: string;
  ja: string;
}

export interface GenerationResult {
  translatedTitle: string;
  translatedDescription: string;
  hashtags: string[];
  optimalPostTime: string;
  culturalAdvice: string;
  transcript?: TranscriptLine[];
}

export interface GenerateContentParams {
  subtitles: string;
  platform: string;
  videoUrl?: string;
}

export async function generateLocalizedContent(
  params: GenerateContentParams
): Promise<GenerationResult> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured');
  }

  const { subtitles, platform, videoUrl } = params;

  const platformName = platform === 'youtube' ? 'YouTube' : platform === 'tiktok' ? 'TikTok' : 'Instagram';

  const prompt = `You are a content localization expert specializing in adapting video content for the Japanese market.

Platform: ${platformName}
${videoUrl ? `Video URL: ${videoUrl}` : ''}

Subtitles/Transcript:
${subtitles}

IMPORTANT TRANSLATION STYLE:
1. Transcript translations: Translate ALL subtitle lines to Kansai dialect (関西弁). 
   Example: English "This is very interesting" → 関西弁 "これすごい面白いわ〜"
   Use authentic Kansai dialect expressions like: 〜やで、〜やねん、〜わ、〜へん、ええ、〜したら、〜やったら、etc.

2. All other outputs: Use casual, friendly Japanese WITHOUT honorifics (敬語なし). 
   Write like talking to a close friend. Use casual forms like: 〜だよ、〜だね、〜する、〜するよ、etc.
   - Title: Casual and natural
   - Description: Friendly, no honorifics
   - Cultural advice: Use Kansai-style casual expressions like "〜がええで" or "〜やったら受けるで"

Please provide a comprehensive localization for Japanese audiences. Format your response as JSON with the following structure:
{
  "translatedTitle": "Casual Japanese title (no honorifics, friendly tone, catchy and culturally appropriate for ${platformName})",
  "translatedDescription": "Casual Japanese description (no honorifics, friendly like talking to a friend, optimized for ${platformName} format)",
  "hashtags": ["hashtag1", "hashtag2", ...], // Top 10 relevant hashtags in Japanese (optimized for ${platformName})
  "optimalPostTime": "Best time to post on ${platformName} in time range format (e.g., '7:00 PM - 9:00 PM JST' or '8:00 PM - 10:00 PM JST')",
  "culturalAdvice": "Cultural adaptation advice in casual Japanese with Kansai-style expressions (no honorifics, friendly tone like '〜がええで' or '〜やったら受けるで')",
  "transcript": [
    {"en": "English line 1", "ja": "Kansai dialect translation line 1"},
    {"en": "English line 2", "ja": "Kansai dialect translation line 2"},
    ...
  ] // Line-by-line bilingual transcript. Split the original subtitles into meaningful lines (sentences or phrases). Translate ALL Japanese lines to Kansai dialect (関西弁).
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional content localization expert for the Japanese market. Translate subtitles to Kansai dialect (関西弁). Make all other outputs casual, friendly Japanese without honorifics (敬語なし), like talking to a close friend. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const result = JSON.parse(content) as any;
    
    return {
      translatedTitle: result.translatedTitle || '',
      translatedDescription: result.translatedDescription || '',
      hashtags: Array.isArray(result.hashtags) ? result.hashtags.slice(0, 10) : [],
      optimalPostTime: result.optimalPostTime || '平日 20:00-22:00 JST',
      culturalAdvice: result.culturalAdvice || '',
      transcript: Array.isArray(result.transcript) ? result.transcript : undefined,
    };
  } catch (error: any) {
    console.error('[OpenAI] API error:', {
      error,
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      subtitlesLength: subtitles.length,
      platform,
    });

    // Provide more specific error messages
    if (error.status === 401) {
      throw new Error('OpenAI API key is invalid or expired');
    }
    
    if (error.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again later.');
    }
    
    if (error.status === 500 || error.status === 503) {
      throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
    }

    if (error.message?.includes('JSON')) {
      throw new Error('Failed to parse OpenAI response. The response may be malformed.');
    }

    throw new Error(error.message || 'Failed to generate localized content');
  }
}
