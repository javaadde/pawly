import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import connectDB from '@/lib/db/mongoose';
import MarketplacePet from '@/lib/models/MarketplacePet';
import type { IMarketplacePet } from '@/lib/models/MarketplacePet';
import Pet from '@/lib/models/Pet';

const marketplacePetTypes: IMarketplacePet['petType'][] = ['cat', 'dog', 'bunny', 'robot', 'fantasy', 'companion'];

function isMarketplacePetType(type: string): type is IMarketplacePet['petType'] {
  return marketplacePetTypes.includes(type as IMarketplacePet['petType']);
}

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const query = searchParams.get('q');

  let filter: any = {};
  
  if (type && type !== 'all' && isMarketplacePetType(type)) {
    filter.petType = type;
  }
  
  if (query) {
    filter.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } }
    ];
  }

  const pets = await MarketplacePet.find(filter).sort({ isPopular: -1, createdAt: -1 });
  return NextResponse.json({ pets });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { marketplaceId } = await req.json();
  await connectDB();

  const template = await MarketplacePet.findById(marketplaceId);
  if (!template) return NextResponse.json({ error: 'Design not found' }, { status: 404 });

  const newPet = await Pet.create({
    userId: session.user.id,
    name: template.name,
    petType: template.petType === 'fantasy' || template.petType === 'companion' ? 'robot' : template.petType,
    brandColor: template.brandColor,
    petImages: template.petImages,
    animatedParts: template.animatedParts,
    greetingMessage: `Hi! I'm ${template.name}, your new assistant.`,
    personality: 'friendly',
  });

  template.downloads += 1;
  await template.save();

  return NextResponse.json({ pet: newPet });
}
