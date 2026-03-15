import mongoose, { Schema, Model } from 'mongoose';

export interface IAIMessage {
  _id: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: 'openai' | 'gemini';
  model?: string;
  status: 'completed' | 'error';
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const AIMessageSchema = new Schema<IAIMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'AIConversation',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ['openai', 'gemini'],
    },
    model: {
      type: String,
    },
    status: {
      type: String,
      enum: ['completed', 'error'],
      default: 'completed',
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

AIMessageSchema.index({ conversation: 1, createdAt: 1 });

const AIMessage: Model<IAIMessage> =
  mongoose.models.AIMessage ||
  mongoose.model<IAIMessage>('AIMessage', AIMessageSchema);

export default AIMessage;
