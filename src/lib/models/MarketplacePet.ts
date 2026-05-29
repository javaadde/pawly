import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMarketplacePet extends Document {
  name: string;
  authorId: mongoose.Types.ObjectId;
  petType: 'cat' | 'dog' | 'bunny' | 'robot' | 'fantasy' | 'companion';
  description: string;
  brandColor: string;
  petImages: {
    front: string;
    left: string;
    right: string;
  };
  animatedParts: Array<'head' | 'hands' | 'legs' | 'tail'>;
  price: number;
  downloads: number;
  tags: string[];
  isPopular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MarketplacePetSchema = new Schema<IMarketplacePet>(
  {
    name: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    petType: { 
      type: String, 
      enum: ['cat', 'dog', 'bunny', 'robot', 'fantasy', 'companion'], 
      required: true 
    },
    description: { type: String, default: '' },
    brandColor: { type: String, default: '#ff6a3d' },
    petImages: {
      front: { type: String, required: true },
      left: { type: String, required: true },
      right: { type: String, required: true },
    },
    animatedParts: {
      type: [{ type: String, enum: ['head', 'hands', 'legs', 'tail'] }],
      default: ['legs'],
    },
    price: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    tags: [{ type: String }],
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MarketplacePet: Model<IMarketplacePet> =
  mongoose.models.MarketplacePet || mongoose.model<IMarketplacePet>('MarketplacePet', MarketplacePetSchema);

export default MarketplacePet;
