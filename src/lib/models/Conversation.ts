import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  emotion: 'idle' | 'happy' | 'thinking' | 'confused';
  timestamp: Date;
}

export interface IConversation extends Document {
  petId: mongoose.Types.ObjectId;
  visitorId: string;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    emotion: {
      type: String,
      enum: ['idle', 'happy', 'thinking', 'confused'],
      default: 'idle',
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
    visitorId: { type: String, required: true },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
