import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = 'AIzaSyDOsv98ULQ707kI2usvQr6o1pGeF07LN98';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to generate response from Gemini AI');
    }
  }

  async generateJarvisResponse(userMessage: string): Promise<string> {
    const systemPrompt = `You are JARVIS (Just A Rather Very Intelligent System), an advanced AI assistant. 
    Respond as JARVIS would - intelligent, helpful, slightly formal but friendly, and capable.
    Keep responses concise and natural for voice interaction.
    User message: "${userMessage}"
    
    Respond as JARVIS in a helpful and intelligent manner:`;

    return this.generateResponse(systemPrompt);
  }
}

export const geminiService = new GeminiService();