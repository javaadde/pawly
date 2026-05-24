import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import Pet from '@/lib/models/Pet';

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
  const { name, petType, brandColor, greetingMessage, personality, position, allowedDomain } = body;

  if (!name) {
    return NextResponse.json({ error: 'Pet name is required' }, { status: 400 });
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
    allowedDomain: allowedDomain || null,
  });

  return NextResponse.json({ pet }, { status: 201 });
}
