import { Injectable } from '@nestjs/common';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const DEFAULT_MODEL_NAME = 'gemini-2.5-flash-lite';
const DEFAULT_TEMPERATURE = 0;

@Injectable()
export class LlmProvider {
  private readonly model: ChatGoogleGenerativeAI;

  constructor() {
    this.model = new ChatGoogleGenerativeAI({
      model: DEFAULT_MODEL_NAME,
      temperature: DEFAULT_TEMPERATURE,
      apiKey: process.env.GOOGLE_API_KEY,
    });
  }

  getModel(): ChatGoogleGenerativeAI {
    return this.model;
  }
}
