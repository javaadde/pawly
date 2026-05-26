import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import Pet from '@/lib/models/Pet';

type Params = { params: Promise<{ petId: string }> };

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

async function ownerGuard(petId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: 'Unauthorized', status: 401 };

  await connectDB();
  const pet = await Pet.findById(petId);
  if (!pet) return { error: 'Pet not found', status: 404 };
  if (pet.userId.toString() !== session.user.id) return { error: 'Forbidden', status: 403 };

  return { pet, session };
}

// GET /api/pets/:petId
export async function GET(_req: NextRequest, { params }: Params) {
  const { petId } = await params;
  const result = await ownerGuard(petId);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ pet: result.pet });
}

// PUT /api/pets/:petId
export async function PUT(req: NextRequest, { params }: Params) {
  const { petId } = await params;
  const result = await ownerGuard(petId);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

  const body = await req.json();
  const { name, petType, brandColor, greetingMessage, personality, position, allowedDomain, isActive, ragEnabled, ragApiKey, ragModel } = body;
  const petImages = sanitizePetImages(body.petImages);
  const animatedParts = sanitizeAnimatedParts(body.animatedParts);

  if (!petImages) {
    return NextResponse.json({ error: 'Front, left, and right pet images are required' }, { status: 400 });
  }

  const updated = await Pet.findByIdAndUpdate(
    petId,
    {
      name,
      petType,
      brandColor,
      greetingMessage,
      personality,
      position,
      petImages,
      animatedParts,
      allowedDomain,
      isActive,
      ragEnabled: Boolean(ragEnabled),
      ragApiKey: ragApiKey?.trim() || null,
      ragModel: ragModel?.trim() || 'openai/gpt-4o-mini',
    },
    { new: true, runValidators: true }
  );

  return NextResponse.json({ pet: updated });
}

// DELETE /api/pets/:petId
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { petId } = await params;
  const result = await ownerGuard(petId);
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status });

  await Pet.findByIdAndDelete(petId);
  return NextResponse.json({ success: true });
}
