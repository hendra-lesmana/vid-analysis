import ytdl from 'ytdl-core';

export function extractVideoId(url: string): string | null {
  try {
    return ytdl.getVideoID(url);
  } catch (error) {
    console.error('Error extracting video ID:', error);
    return null;
  }
}

export async function getVideoInfo(url: string) {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const info = await ytdl.getInfo(url);
    const captions = info.player_response.captions;
    
    // Get the first available caption track (usually English)
    const captionTrack = captions?.playerCaptionsTracklistRenderer?.captionTracks?.[0];
    
    if (!captionTrack) {
      throw new Error('No captions available for this video');
    }

    const transcript = await fetch(captionTrack.baseUrl)
      .then(response => response.text())
      .then(xml => {
        // Parse the XML and extract text content
        const textContent = xml
          .replace(/<\/?[^>]+(>|$)/g, '') // Remove XML tags
          .replace(/&amp;/g, '&')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        return textContent;
      });

    return {
      title: info.videoDetails.title,
      description: info.videoDetails.description,
      transcript
    };
  } catch (error) {
    console.error('Error fetching video info:', error);
    throw new Error('Failed to fetch video information');
  }
}