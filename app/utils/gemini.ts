import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function analyzeTranscript(transcript: string) {
  try {
    const prompt = `Analyze this YouTube video transcript and provide a concise summary that includes:
1. The main topic/subject of the video
2. Key points and important insights
3. Main takeaways and learnings

Transcript:
${transcript}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error in Gemini AI analysis:', error);
    throw new Error('Failed to analyze transcript with AI');
  }
}