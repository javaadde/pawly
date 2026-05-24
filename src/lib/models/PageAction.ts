import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPageAction extends Document {
  petId: mongoose.Types.ObjectId;
  label: string;
  intent: string;
  selector: string;
  actionType: 'scroll_to' | 'highlight' | 'open_link';
  url: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PageActionSchema = new Schema<IPageAction>(
  {
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
    label: { type: String, required: true },
    intent: { type: String, required: true },
    selector: { type: String, required: true },
    actionType: {
      type: String,
      enum: ['scroll_to', 'highlight', 'open_link'],
      default: 'scroll_to',
    },
    url: { type: String, default: null },
  },
  { timestamps: true }
);

const PageAction: Model<IPageAction> =
  mongoose.models.PageAction ||
  mongoose.model<IPageAction>('PageAction', PageActionSchema);

export default PageAction;
