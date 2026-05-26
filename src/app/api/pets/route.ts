import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import Pet from '@/lib/models/Pet';

const ANIMATED_PARTS = new Set(['head', 'hands', 'legs', 'tail']);

function sanitizePetImages(input: unknown) {
  if (!input || typeof input !== 'object') return null;

  const images = input as Record<string, unknown>;
  const front = typeof images.front === 'string' ? images.front.trim() : '';
  const left = typeof images.left === 'string' ? images.left.trim() : '';
  const right = typeof images.right === 'string' ? images.right.trim() : '';

  if (!front || !left || !right) return null;

  return { front, left, right };
}

function sanitizeAnimatedParts(input: unknown) {
  if (!Array.isArray(input)) return [];

  return input.filter(
    (part): part is 'head' | 'hands' | 'legs' | 'tail' =>
      typeof part === 'string' && ANIMATED_PARTS.has(part)
  );
}

// GET /api/pets - list all pets for authenticated user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const pets = await Pet.find({ userId: session.user.id }).sort({ createdAt: -1 });

  return NextResponse.json({ pets });
}

// POST /api/pets - create a new pet
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, petType, brandColor, greetingMessage, personality, position, allowedDomain, ragEnabled, ragApiKey, ragModel } = body;
  const petImages = sanitizePetImages(body.petImages);
  const animatedParts = sanitizeAnimatedParts(body.animatedParts);

  if (!name) {
    return NextResponse.json({ error: 'Pet name is required' }, { status: 400 });
  }

  if (!petImages) {
    return NextResponse.json({ error: 'Front, left, and right pet images are required' }, { status: 400 });
  }

  await connectDB();

  const pet = await Pet.create({
    userId: session.user.id,
    name,
    petType: petType || 'cat',
    brandColor: brandColor || '#7C3AED',
    greetingMessage: greetingMessage || "Hi! 👋 I'm here to help!",
      personality: personality || 'friendly',
      position: position || 'bottom-right',
      petImages,
      animatedParts,
      allowedDomain: allowedDomain || null,
      ragEnabled: Boolean(ragEnabled),
      ragApiKey: ragApiKey?.trim() || null,
      ragModel: ragModel?.trim() || 'openai/gpt-4o-mini',
  });

  return NextResponse.json({ pet }, { status: 201 });
}
