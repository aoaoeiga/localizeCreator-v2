import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY || '';

if (!apiKey) {
  console.warn('OpenAI API key is missing');
}

export const openai = apiKey ? new OpenAI({ apiKey }) : null;

export interface GenerationResult {
  translatedText: string;
  hashtags: string[];
  optimalPostTime: string;
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

Please provide:
1. A natural Japanese translation that maintains the original tone and intent while being culturally appropriate for Japanese audiences
2. 5-10 relevant Japanese hashtags (include both Japanese and English hashtags if appropriate)
3. The optimal posting time for Japanese social media (consider time zones and engagement patterns)

Format your response as JSON:
{
  "translatedText": "Japanese translation here",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "optimalPostTime": "Best time to post (e.g., '平日 20:00-22:00 JST')"
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional content localization expert for the Japanese market. Always respond with valid JSON.',
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
      translatedText: result.translatedText || '',
      hashtags: Array.isArray(result.hashtags) ? result.hashtags : [],
      optimalPostTime: result.optimalPostTime || '平日 20:00-22:00 JST',
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate localized content');
  }
}

