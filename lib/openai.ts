import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || '';

if (!apiKey) {
  console.warn('OpenAI API key is missing');
}

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export interface GenerationResult {
  translatedTitle: string;
  translatedDescription: string;
  hashtags: string[];
  optimalPostTime: string;
  culturalAdvice: string;
}

export async function generateLocalizedContent(
  originalText: string
): Promise<GenerationResult> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured');
  }

  const prompt = `You are a content localization expert specializing in adapting content for the Japanese market. 

Original content:
${originalText}

Please provide a comprehensive localization for Japanese audiences. Format your response as JSON with the following structure:
{
  "translatedTitle": "Japanese title (catchy and culturally appropriate)",
  "translatedDescription": "Japanese description (natural and engaging)",
  "hashtags": ["hashtag1", "hashtag2", ...], // Top 10 relevant hashtags (mix of Japanese and English if appropriate)
  "optimalPostTime": "Best time to post (e.g., '平日 20:00-22:00 JST')",
  "culturalAdvice": "Cultural adaptation advice and tips for Japanese audience"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional content localization expert for the Japanese market. Always respond with valid JSON only, no additional text.',
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

    const result = JSON.parse(content) as GenerationResult;
    
    return {
      translatedTitle: result.translatedTitle || '',
      translatedDescription: result.translatedDescription || '',
      hashtags: Array.isArray(result.hashtags) ? result.hashtags.slice(0, 10) : [],
      optimalPostTime: result.optimalPostTime || '平日 20:00-22:00 JST',
      culturalAdvice: result.culturalAdvice || '',
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate localized content');
  }
}

