
import { google } from "@ai-sdk/google";
import { type CoreMessage, streamText } from "ai";
import fs from 'fs';
import path from 'path';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json();

  const filePath = path.join(process.cwd(), 'app/api/chatbot/knowledge_base.txt');
  const knowledgeBase = fs.readFileSync(filePath, 'utf8');

  const result = await streamText({
    model: google("models/gemini-1.5-flash-latest"),
    system: knowledgeBase,
    messages,
  });

  return result.toDataStreamResponse();
}

