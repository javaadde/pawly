import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPet extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  petType: 'cat' | 'dog' | 'bunny' | 'robot';
  brandColor: string;
  greetingMessage: string;
  personality: 'friendly' | 'professional' | 'funny' | 'calm';
  position: 'bottom-right' | 'bottom-left';
  allowedDomain: string | null;
  isActive: boolean;
  ragEnabled: boolean;
  ragApiKey: string | null;
  ragModel: string;
  createdAt: Date;
  updatedAt: Date;
}

const PetSchema = new Schema<IPet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, default: 'Pawly' },
    petType: { type: String, enum: ['cat', 'dog', 'bunny', 'robot'], default: 'cat' },
    brandColor: { type: String, default: '#7C3AED' },
    greetingMessage: {
      type: String,
      default: "Hi! 👋 I'm Pawly! How can I help you today?",
    },
    personality: {
      type: String,
      enum: ['friendly', 'professional', 'funny', 'calm'],
      default: 'friendly',
    },
    position: {
      type: String,
      enum: ['bottom-right', 'bottom-left'],
      default: 'bottom-right',
    },
    allowedDomain: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    ragEnabled: { type: Boolean, default: false },
    ragApiKey: { type: String, default: null },
    ragModel: { type: String, default: 'openai/gpt-4o-mini' },
  },
  { timestamps: true }
);

const Pet: Model<IPet> =
  mongoose.models.Pet || mongoose.model<IPet>('Pet', PetSchema);

export default Pet;
