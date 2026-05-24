import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Pet from '@/lib/models/Pet';
import KnowledgeBase from '@/lib/models/KnowledgeBase';
import PageAction from '@/lib/models/PageAction';
import Conversation from '@/lib/models/Conversation';
import { chatWithAI } from '@/lib/openrouter';
import { buildSystemPrompt } from '@/lib/prompt';
import { KnowledgeItem, PageAction as IPageAction } from '@/types';

// POST /api/chat — PUBLIC endpoint used by widget.js
export async function POST(req: NextRequest) {
  try {
    const { petId, message, visitorId, conversationId } = await req.json();

    if (!petId || !message) {
      return NextResponse.json({ error: 'petId and message are required' }, { status: 400 });
    }

    await connectDB();

    // Fetch pet config
    const pet = await Pet.findById(petId);
    if (!pet || !pet.isActive) {
      return NextResponse.json({ error: 'Pet not found or inactive' }, { status: 404 });
    }

    // Fetch knowledge + actions
    const [knowledge, actions] = await Promise.all([
      KnowledgeBase.find({ petId }),
      PageAction.find({ petId }),
    ]);

    // Build system prompt
    const systemPrompt = buildSystemPrompt(
      pet.name,
      pet.personality,
      knowledge as unknown as KnowledgeItem[],
      actions as unknown as IPageAction[]
    );

    // Get conversation history
    let conversation = conversationId
      ? await Conversation.findById(conversationId)
      : null;

    const history = conversation
      ? conversation.messages.slice(-6).map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }))
      : [];

    // Call AI
    const aiResponse = await chatWithAI(systemPrompt, message, history);

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
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        message: "Oops! I'm having a little trouble right now. Please try again in a moment! 🐾",
        emotion: 'confused',
        action: null,
      },
      { status: 200 } // Return 200 so widget doesn't break
    );
  }
}
