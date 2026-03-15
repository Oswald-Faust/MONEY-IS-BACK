import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAIConversation extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  workspace: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  source: 'panel' | 'page' | 'onboarding' | 'whatsapp';
  archived: boolean;
  lastMessage?: {
    role: 'user' | 'assistant';
    content: string;
    createdAt: Date;
    provider?: 'openai' | 'gemini';
  };
  context?: {
    route?: string;
    project?: mongoose.Types.ObjectId;
    objective?: mongoose.Types.ObjectId;
    task?: mongoose.Types.ObjectId;
    idea?: mongoose.Types.ObjectId;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AIConversationSchema = new Schema<IAIConversation>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [140, 'Le titre ne peut pas dépasser 140 caractères'],
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ['panel', 'page', 'onboarding', 'whatsapp'],
      default: 'page',
    },
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
    lastMessage: {
      role: {
        type: String,
        enum: ['user', 'assistant'],
      },
      content: {
        type: String,
      },
      createdAt: {
        type: Date,
      },
      provider: {
        type: String,
        enum: ['openai', 'gemini'],
      },
    },
    context: {
      route: String,
      project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
      },
      objective: {
        type: Schema.Types.ObjectId,
        ref: 'Objective',
      },
      task: {
        type: Schema.Types.ObjectId,
        ref: 'Task',
      },
      idea: {
        type: Schema.Types.ObjectId,
        ref: 'Idea',
      },
    },
  },
  {
    timestamps: true,
  }
);

AIConversationSchema.index({ workspace: 1, creator: 1, updatedAt: -1 });

const AIConversation: Model<IAIConversation> =
  mongoose.models.AIConversation ||
  mongoose.model<IAIConversation>('AIConversation', AIConversationSchema);

export default AIConversation;
