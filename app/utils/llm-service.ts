import { GoogleGenerativeAI } from '@google/generative-ai';

interface LLMProvider {
  analyzeTranscript(transcript: string): Promise<string>;
}

export class GeminiProvider implements LLMProvider {
  private model: any;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  async analyzeTranscript(transcript: string): Promise<string> {
    try {
      const messages = [
        {
          role: "system",
          content: "You are an expert analyst who analyzes video transcripts."
        },
        {
          role: "user",
          content: `Analyze the following YouTube video transcript and provide:
1. What the video is about (core topic/subject)
2. 3-5 key points or insights from the video
3. A concise summary (2-3 paragraphs)

Format your response as JSON with the following structure:
{
  "topic": "Core topic of the video",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "summary": "Concise summary of the video content"
}

Here is the transcript: ${transcript}`
        }
      ];

      const result = await this.model.generateContent({
        contents: messages,
        generationConfig: {
          temperature: 0.7
        }
      });
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error in Gemini AI analysis:', error);
      throw new Error('Failed to analyze transcript with AI');
    }
  }
}

class OpenRouterProvider implements LLMProvider {
  private apiKey: string;
  private siteUrl: string;
  private siteName: string;

  constructor() {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not set in environment variables');
    }
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.siteUrl = process.env.SITE_URL || '';
    this.siteName = process.env.SITE_NAME || '';
  }

  async analyzeTranscript(transcript: string): Promise<string> {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1:free',
          messages: [
            {
              role: "system",
              content: "You are an expert analyst who analyzes video transcripts."
            },
            {
              role: "user",
              content: `Analyze the following YouTube video transcript and provide:
1. What the video is about (core topic/subject)
2. 3-5 key points or insights from the video
3. A concise summary (2-3 paragraphs)

Format your response as JSON with the following structure:
{
  "topic": "Core topic of the video",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4", "Key point 5"],
  "summary": "Concise summary of the video content"
}

Here is the transcript: ${transcript}`
            }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from OpenRouter API');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error in OpenRouter analysis:', error);
      throw new Error('Failed to analyze transcript with AI');
    }
  }
}

class LLMService {
  private provider: LLMProvider;

  constructor() {
    // Choose provider based on environment variable
    const providerType = process.env.LLM_PROVIDER || 'gemini';
    
    switch (providerType.toLowerCase()) {
      case 'openrouter':
        this.provider = new OpenRouterProvider();
        break;
      case 'gemini':
      default:
        this.provider = new GeminiProvider();
        break;
    }
  }

  async analyzeTranscript(transcript: string): Promise<string> {
    return this.provider.analyzeTranscript(transcript);
  }
}

// Export singleton instance
const llmService = new LLMService();
export { llmService };