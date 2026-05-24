import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import PageAction from '@/lib/models/PageAction';
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

  const actions = await PageAction.find({ petId }).sort({ createdAt: -1 });
  return NextResponse.json({ actions });
}

export async function POST(req: NextRequest, { params }: Params) {
  const { petId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { label, intent, selector, actionType, url } = await req.json();
  if (!label || !intent || !selector) {
    return NextResponse.json({ error: 'label, intent and selector are required' }, { status: 400 });
  }

  await connectDB();
  const pet = await verifyOwnership(petId, session.user.id);
  if (!pet) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const action = await PageAction.create({
    petId,
    label,
    intent,
    selector,
    actionType: actionType || 'scroll_to',
    url: url || null,
  });
  return NextResponse.json({ action }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { petId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { actionId } = await req.json();
  if (!actionId) return NextResponse.json({ error: 'actionId required' }, { status: 400 });

  await connectDB();
  const pet = await verifyOwnership(petId, session.user.id);
  if (!pet) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await PageAction.findOneAndDelete({ _id: actionId, petId });
  return NextResponse.json({ success: true });
}
