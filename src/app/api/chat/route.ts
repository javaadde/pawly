import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Pet from '@/lib/models/Pet';
import KnowledgeBase from '@/lib/models/KnowledgeBase';
import PageAction from '@/lib/models/PageAction';
import Conversation from '@/lib/models/Conversation';
import { chatWithAI } from '@/lib/openrouter';
import { buildSystemPrompt } from '@/lib/prompt';
import { ChatResponse, KnowledgeItem, PageAction as IPageAction } from '@/types';
import { buildWidgetCorsHeaders, isAllowedWidgetOrigin } from '@/lib/widget-origin';

const STOP_WORDS = new Set([
  'a', 'an', 'and', 'are', 'can', 'do', 'for', 'how', 'i', 'is', 'me', 'of', 'on', 'or', 'tell', 'the', 'to', 'what', 'where',
  'which', 'who', 'you', 'your',
]);

function normalizeText(value: string) {
  return value.toLowerCase();
}

function getSearchTerms(message: string) {
  return normalizeText(message)
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));
}

function scoreKnowledge(item: KnowledgeItem, terms: string[]) {
  const title = normalizeText(item.title);
  const content = normalizeText(item.content);

  return terms.reduce((score, term) => {
    let next = score;

    if (title.includes(term)) next += 4;
    if (content.includes(term)) next += 2;

    return next;
  }, 0);
}

function findRelevantAction(message: string, actions: IPageAction[]) {
  const text = normalizeText(message);

  return actions.find((action) => {
    const label = normalizeText(action.label);
    const intent = normalizeText(action.intent);
    return text.includes(label) || text.includes(intent);
  });
}

function buildKnowledgeFallbackResponse(
  message: string,
  knowledge: KnowledgeItem[],
  actions: IPageAction[]
): ChatResponse {
  const terms = getSearchTerms(message);
  const bestMatch = knowledge
    .map((item) => ({ item, score: scoreKnowledge(item, terms) }))
    .sort((a, b) => b.score - a.score)[0];

  const action = findRelevantAction(message, actions);

  if (!bestMatch || bestMatch.score === 0) {
    return {
      message: "I'm not sure about that yet! Please contact the team directly. 😊",
      emotion: 'confused',
      action: action
        ? {
            type: action.actionType,
            selector: action.selector,
            url: action.url || undefined,
          }
        : null,
      leadCapture: false,
    };
  }

  return {
    message: bestMatch.item.content,
    emotion: 'happy',
    action: action
      ? {
          type: action.actionType,
          selector: action.selector,
          url: action.url || undefined,
        }
      : null,
    leadCapture: false,
  };
}

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: buildWidgetCorsHeaders(origin),
  });
}

// POST /api/chat — PUBLIC endpoint used by widget.js
export async function POST(req: NextRequest) {
  const requestOrigin = req.headers.get('origin');
  const headers = buildWidgetCorsHeaders(requestOrigin);

  try {
    const { petId, message, visitorId, conversationId } = await req.json();

    if (!petId || !message) {
      return NextResponse.json({ error: 'petId and message are required' }, { status: 400, headers });
    }

    await connectDB();

    // Fetch pet config
    const pet = await Pet.findById(petId);
    if (!pet || !pet.isActive) {
      return NextResponse.json({ error: 'Pet not found or inactive' }, { status: 404, headers });
    }

    if (!isAllowedWidgetOrigin(req, pet).allowed) {
      return NextResponse.json({ error: 'This domain is not allowed for this pet' }, { status: 403, headers });
    }

    // Fetch knowledge + actions
    const [knowledge, actions] = await Promise.all([
      KnowledgeBase.find({ petId }),
      PageAction.find({ petId }),
    ]);

    let conversation = conversationId
      ? await Conversation.findById(conversationId)
      : null;

    const history = conversation
      ? conversation.messages.slice(-6).map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      : [];

    const knowledgeItems = knowledge as unknown as KnowledgeItem[];
    const pageActions = actions as unknown as IPageAction[];

    const useRag = Boolean(pet.ragEnabled && pet.ragApiKey);

    let aiResponse: ChatResponse;

    if (useRag) {
      const systemPrompt = buildSystemPrompt(
        pet.name,
        pet.personality,
        knowledgeItems,
        pageActions
      );

      aiResponse = await chatWithAI(systemPrompt, message, history, {
        apiKey: pet.ragApiKey,
        model: pet.ragModel,
      });
    } else {
      aiResponse = buildKnowledgeFallbackResponse(
        message,
        knowledgeItems,
        pageActions
      );
    }

    // Save conversation
    const vid = visitorId || `visitor_${Date.now()}`;

    if (!conversation) {
      conversation = await Conversation.create({
        petId,
        visitorId: vid,
        messages: [],
      });
    }

    conversation.messages.push(
      { role: 'user', content: message, emotion: 'idle', timestamp: new Date() },
      {
        role: 'assistant',
        content: aiResponse.message,
        emotion: aiResponse.emotion,
        timestamp: new Date(),
      }
    );
    await conversation.save();

    return NextResponse.json({
      ...aiResponse,
      conversationId: conversation._id.toString(),
      visitorId: vid,
    }, { headers });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        message: "Oops! I'm having a little trouble right now. Please try again in a moment! 🐾",
        emotion: 'confused',
        action: null,
      },
      { status: 200, headers } // Return 200 so widget doesn't break
    );
  }
}
