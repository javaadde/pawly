import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import KnowledgeBase from '@/lib/models/KnowledgeBase';
import Pet from '@/lib/models/Pet';

type Params = { params: Promise<{ petId: string }> };

async function verifyOwnership(petId: string, userId: string) {
  const pet = await Pet.findById(petId);
  if (!pet || pet.userId.toString() !== userId) return null;
  return pet;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { petId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const pet = await verifyOwnership(petId, session.user.id);
  if (!pet) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const items = await KnowledgeBase.find({ petId }).sort({ createdAt: -1 });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { petId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { title, content, sourceType, fileName } = await req.json();
  if (!title || !content) return NextResponse.json({ error: 'Title and content required' }, { status: 400 });

  await connectDB();
  const pet = await verifyOwnership(petId, session.user.id);
  if (!pet) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const item = await KnowledgeBase.create({
    petId,
    title,
    content,
    sourceType: sourceType || 'manual',
    fileName: fileName || null,
  });
  return NextResponse.json({ item }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { petId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { itemId } = await req.json();
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 });

  await connectDB();
  const pet = await verifyOwnership(petId, session.user.id);
  if (!pet) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await KnowledgeBase.findOneAndDelete({ _id: itemId, petId });
  return NextResponse.json({ success: true });
}
