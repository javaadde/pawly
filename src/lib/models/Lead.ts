import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILead extends Document {
  petId: mongoose.Types.ObjectId;
  visitorId: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
    visitorId: { type: String, default: null },
    name: { type: String, default: null },
    email: { type: String, default: null },
    phone: { type: String, default: null },
    message: { type: String, default: null },
  },
  { timestamps: true }
);

const Lead: Model<ILead> =
  mongoose.models.Lead || mongoose.model<ILead>('Lead', LeadSchema);

export default Lead;
