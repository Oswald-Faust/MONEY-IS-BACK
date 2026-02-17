import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  type: 'group';
  workspace: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  members: {
    user: mongoose.Types.ObjectId;
    role: 'admin' | 'member';
    joinedAt: Date;
  }[];
  avatar?: string;
  lastMessage?: {
    content: string;
    sender: mongoose.Types.ObjectId;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la conversation est requis'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    type: {
      type: String,
      enum: ['group'],
      default: 'group',
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['admin', 'member'],
          default: 'member',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    avatar: {
      type: String,
      default: null,
    },
    lastMessage: {
      content: String,
      sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ workspace: 1 });
ConversationSchema.index({ 'members.user': 1 });
ConversationSchema.index({ creator: 1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>('Conversation', ConversationSchema);

export default Conversation;
