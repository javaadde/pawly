import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IKnowledgeBase extends Document {
  petId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  sourceType: 'manual' | 'faq' | 'document';
  fileName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const KnowledgeBaseSchema = new Schema<IKnowledgeBase>(
  {
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    sourceType: { type: String, enum: ['manual', 'faq', 'document'], default: 'manual' },
    fileName: { type: String, default: null },
  },
  { timestamps: true }
);

const KnowledgeBase: Model<IKnowledgeBase> =
  mongoose.models.KnowledgeBase ||
  mongoose.model<IKnowledgeBase>('KnowledgeBase', KnowledgeBaseSchema);

export default KnowledgeBase;
