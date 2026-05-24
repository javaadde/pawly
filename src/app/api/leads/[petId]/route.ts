import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import Lead from '@/lib/models/Lead';
import Pet from '@/lib/models/Pet';

// GET /api/leads/[petId] — fetch leads for a pet (authenticated)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ petId: string }> }
) {
  const { petId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();

  // Verify ownership
  const pet = await Pet.findById(petId);
  if (!pet || pet.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const leads = await Lead.find({ petId }).sort({ createdAt: -1 });
  return NextResponse.json({ leads });
}
