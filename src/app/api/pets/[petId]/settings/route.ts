import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Pet from '@/lib/models/Pet';
import { buildWidgetCorsHeaders, isAllowedWidgetOrigin } from '@/lib/widget-origin';

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: buildWidgetCorsHeaders(origin),
  });
}

// GET /api/pets/:petId/settings — PUBLIC endpoint used by widget.js
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ petId: string }> }
) {
  const { petId } = await params;

  await connectDB();

  const pet = await Pet.findById(petId).select(
    'name petType brandColor greetingMessage personality position petImages animatedParts isActive allowedDomain'
  );

  if (!pet) {
    return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
  }

  if (!pet.isActive) {
    return NextResponse.json({ error: 'Pet is inactive' }, { status: 403 });
  }

  const { allowed, requestOrigin } = isAllowedWidgetOrigin(req, pet);
  const headers = buildWidgetCorsHeaders(requestOrigin);

  if (!allowed) {
    return NextResponse.json({ error: 'This domain is not allowed for this pet' }, { status: 403, headers });
  }

  // Return only safe public fields
  return NextResponse.json({
    id: pet._id.toString(),
    name: pet.name,
    petType: pet.petType,
    brandColor: pet.brandColor,
    greetingMessage: pet.greetingMessage,
    personality: pet.personality,
    position: pet.position,
    petImages: pet.petImages,
    animatedParts: pet.animatedParts || [],
  }, { headers });
}
