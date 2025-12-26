// Extract video ID from YouTube URL
export function extractYouTubeVideoId(url: string): string | null {
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

// Validate YouTube URL
export function isValidYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return (
      hostname === 'www.youtube.com' ||
      hostname === 'youtube.com' ||
      hostname === 'youtu.be' ||
      hostname === 'm.youtube.com'
    );
  } catch {
    return false;
  }
}

// Get YouTube transcript using Google YouTube Data API v3
export async function getYouTubeTranscript(url: string): Promise<string> {
  if (!isValidYouTubeUrl(url)) {
    throw new Error('Invalid YouTube URL');
  }

  const videoId = extractYouTubeVideoId(url);
  if (!videoId) {
    throw new Error('Could not extract video ID from URL');
  }

  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error('YouTube API key is not configured');
  }

  try {
    // Step 1: Get captions list
    const captionsListUrl = `https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=${videoId}&key=${apiKey}`;
    const captionsResponse = await fetch(captionsListUrl);
    
    if (!captionsResponse.ok) {
      const errorData = await captionsResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to fetch captions list');
    }

    const captionsData = await captionsResponse.json();
    
    if (!captionsData.items || captionsData.items.length === 0) {
      throw new Error('No captions available for this video');
    }

    // Step 2: Find preferred language (English first, then Japanese, then any)
    const preferredLanguages = ['en', 'ja'];
    let selectedCaption = null;

    // Try to find English or Japanese caption
    for (const lang of preferredLanguages) {
      selectedCaption = captionsData.items.find(
        (item: any) => item.snippet.language === lang
      );
      if (selectedCaption) break;
    }

    // If no preferred language found, use the first available
    if (!selectedCaption) {
      selectedCaption = captionsData.items[0];
    }

    const captionId = selectedCaption.id;

    // Step 3: Download caption
    // Note: captions.download requires OAuth 2.0, but we'll try with API key first
    // If it fails, we'll provide a helpful error message
    const downloadUrl = `https://www.googleapis.com/youtube/v3/captions/${captionId}?key=${apiKey}`;
    const downloadResponse = await fetch(downloadUrl, {
      headers: {
        'Accept': 'text/xml, text/plain, */*',
      },
    });

    if (!downloadResponse.ok) {
      // If download fails, it's likely because OAuth 2.0 is required
      if (downloadResponse.status === 403) {
        throw new Error('Caption download requires OAuth 2.0 authentication. Please configure OAuth 2.0 credentials.');
      }
      const errorData = await downloadResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || 'Failed to download caption');
    }

    // Parse the caption content (usually in XML or SRT format)
    const captionText = await downloadResponse.text();
    
    // Extract text from XML format (if applicable)
    // This is a simple parser - you may need to adjust based on actual format
    let transcript = captionText;
    
    // If it's XML format, extract text content
    if (captionText.includes('<text')) {
      const textMatches = captionText.match(/<text[^>]*>([^<]+)<\/text>/g);
      if (textMatches) {
        transcript = textMatches
          .map((match) => match.replace(/<text[^>]*>([^<]+)<\/text>/, '$1'))
          .join(' ')
          .trim();
      }
    } else {
      // If it's plain text or SRT format, use as is
      transcript = captionText.trim();
    }

    if (!transcript || transcript.length === 0) {
      throw new Error('Empty transcript received');
    }

    return transcript;
  } catch (error: any) {
    console.error('[YouTube] Error fetching transcript:', error);
    throw error;
  }
}
