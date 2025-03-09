import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { analyzeTranscript } from '@/app/utils/gemini';
import { extractVideoId } from '@/app/utils/youtube';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      );
    }

    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      );
    }

    // Get video transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        { error: 'No transcript available for this video' },
        { status: 404 }
      );
    }

    // Combine transcript text
    const transcriptText = transcript
      .map((item) => item.text)
      .join(' ');

    // Analyze transcript using Gemini AI
    const analysis = await analyzeTranscript(transcriptText);

    return NextResponse.json({
      analysis
    });

  } catch (error) {
    console.error('Error analyzing video:', error);
    return NextResponse.json(
      { error: 'Failed to analyze video' },
      { status: 500 }
    );
  }
}