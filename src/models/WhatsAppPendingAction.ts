import mongoose, { Schema, Model } from 'mongoose';

export type WhatsAppPendingKind = 'task' | 'objective' | 'idea';
export type WhatsAppPendingStatus = 'waiting_input' | 'completed' | 'cancelled';

export interface IWhatsAppPendingAction {
  _id: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  link: mongoose.Types.ObjectId;
  conversation: mongoose.Types.ObjectId;
  status: WhatsAppPendingStatus;
  kind: WhatsAppPendingKind;
  missingFields: string[];
  payload: {
    title?: string;
    description?: string;
    projectName?: string;
    assigneeName?: string;
    assigneeId?: string;
    dueDate?: string;
    priority?: string;
    checkpoints?: string[];
    tags?: string[];
  };
  lastQuestion?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppPendingActionSchema = new Schema<IWhatsAppPendingAction>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    link: {
      type: Schema.Types.ObjectId,
      ref: 'WhatsAppLink',
      required: true,
      index: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: 'AIConversation',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['waiting_input', 'completed', 'cancelled'],
      default: 'waiting_input',
      index: true,
    },
    kind: {
      type: String,
      enum: ['task', 'objective', 'idea'],
      required: true,
    },
    missingFields: [
      {
        type: String,
        trim: true,
      },
    ],
    payload: {
      title: String,
      description: String,
      projectName: String,
      assigneeName: String,
      assigneeId: String,
      dueDate: String,
      priority: String,
      checkpoints: [String],
      tags: [String],
    },
    lastQuestion: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

WhatsAppPendingActionSchema.index(
  { workspace: 1, user: 1, status: 1 },
  { partialFilterExpression: { status: 'waiting_input' } }
);

const WhatsAppPendingAction: Model<IWhatsAppPendingAction> =
  mongoose.models.WhatsAppPendingAction ||
  mongoose.model<IWhatsAppPendingAction>('WhatsAppPendingAction', WhatsAppPendingActionSchema);

export default WhatsAppPendingAction;
