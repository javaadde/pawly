import { ChatResponse } from '@/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function chatWithAI(
  systemPrompt: string,
  userMessage: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  options?: { apiKey?: string | null; model?: string | null }
): Promise<ChatResponse> {
  const model = options?.model?.trim() || process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini';
  const apiKey = options?.apiKey?.trim() || process.env.OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your-openrouter-key-here') {
    throw new Error('OPENROUTER_API_KEY is not configured');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.slice(-6), // Keep last 3 exchanges for context
    { role: 'user', content: userMessage },
  ];

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Pawly AI',
    },
    body: JSON.stringify({
      model,
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response from AI');
  }

  try {
    const parsed: ChatResponse = JSON.parse(content);
    return {
      message: parsed.message || "I'm not sure about that. Please contact the team!",
      emotion: parsed.emotion || 'idle',
      action: parsed.action || null,
      leadCapture: parsed.leadCapture || false,
    };
  } catch {
    // If JSON parsing fails, return the raw message
    return {
      message: content,
      emotion: 'idle',
      action: null,
    };
  }
}
