import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Lead from '@/lib/models/Lead';
import Pet from '@/lib/models/Pet';
import { buildWidgetCorsHeaders, isAllowedWidgetOrigin } from '@/lib/widget-origin';

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, {
    status: 204,
    headers: buildWidgetCorsHeaders(origin),
  });
}

// POST /api/leads — PUBLIC endpoint used by widget.js
export async function POST(req: NextRequest) {
  const requestOrigin = req.headers.get('origin');
  const headers = buildWidgetCorsHeaders(requestOrigin);

  try {
    const { petId, visitorId, name, email, phone, message } = await req.json();

    if (!petId) {
      return NextResponse.json({ error: 'petId is required' }, { status: 400, headers });
    }

    await connectDB();

    const pet = await Pet.findById(petId);
    if (!pet || !pet.isActive) {
      return NextResponse.json({ error: 'Pet not found or inactive' }, { status: 404, headers });
    }

    if (!isAllowedWidgetOrigin(req, pet).allowed) {
      return NextResponse.json({ error: 'This domain is not allowed for this pet' }, { status: 403, headers });
    }

    const lead = await Lead.create({
      petId,
      visitorId: visitorId || null,
      name: name || null,
      email: email || null,
      phone: phone || null,
      message: message || null,
    });

    return NextResponse.json({ success: true, leadId: lead._id.toString() }, { status: 201, headers });
  } catch (error) {
    console.error('Lead error:', error);
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500, headers });
  }
}
