import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import Lead from '@/lib/models/Lead';

// POST /api/leads — PUBLIC endpoint used by widget.js
export async function POST(req: NextRequest) {
  try {
    const { petId, visitorId, name, email, phone, message } = await req.json();

    if (!petId) {
      return NextResponse.json({ error: 'petId is required' }, { status: 400 });
    }

    await connectDB();

    const lead = await Lead.create({
      petId,
      visitorId: visitorId || null,
      name: name || null,
      email: email || null,
      phone: phone || null,
      message: message || null,
    });

    return NextResponse.json({ success: true, leadId: lead._id.toString() }, { status: 201 });
  } catch (error) {
    console.error('Lead error:', error);
    return NextResponse.json({ error: 'Failed to save lead' }, { status: 500 });
  }
}
