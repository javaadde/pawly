// Shared TypeScript types across the Pawly application

export type PetType = 'cat' | 'dog' | 'bunny' | 'robot';
export type Personality = 'friendly' | 'professional' | 'funny' | 'calm';
export type Position = 'bottom-right' | 'bottom-left';
export type ActionType = 'scroll_to' | 'highlight' | 'open_link';
export type Emotion = 'idle' | 'happy' | 'thinking' | 'confused';
export type MessageRole = 'user' | 'assistant';

export interface Pet {
  _id: string;
  userId: string;
  name: string;
  petType: PetType;
  brandColor: string;
  greetingMessage: string;
  personality: Personality;
  position: Position;
  allowedDomain: string | null;
  isActive: boolean;
  ragEnabled: boolean;
  ragApiKey: string | null;
  ragModel: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeItem {
  _id: string;
  petId: string;
  title: string;
  content: string;
  sourceType: 'manual' | 'faq' | 'document';
  fileName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PageAction {
  _id: string;
  petId: string;
  label: string;
  intent: string;
  selector: string;
  actionType: ActionType;
  url: string | null;
  createdAt: string;
}

export interface Message {
  role: MessageRole;
  content: string;
  emotion: Emotion;
  timestamp: string;
}

export interface Conversation {
  _id: string;
  petId: string;
  visitorId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  _id: string;
  petId: string;
  visitorId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  createdAt: string;
}

// Widget public settings (returned by /api/pets/:id/settings)
export interface PetSettings {
  id: string;
  name: string;
  petType: PetType;
  brandColor: string;
  greetingMessage: string;
  personality: Personality;
  position: Position;
}

// AI Chat response structure
export interface ChatAction {
  type: ActionType;
  selector?: string;
  url?: string;
}

export interface ChatResponse {
  message: string;
  emotion: Emotion;
  action: ChatAction | null;
  leadCapture?: boolean;
}
