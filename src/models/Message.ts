import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttachment {
  type: 'task' | 'objective' | 'file' | 'folder';
  id: mongoose.Types.ObjectId;
  name: string;
}

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  content: string;
  attachments: IAttachment[];
  read: boolean;
  deletedForSender: boolean;
  deletedForRecipient: boolean;
  deletedForEveryone: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: function(this: IMessage): boolean {
        // If there are no attachments, content is required
        return !this.attachments || this.attachments.length === 0;
      },
    },
    attachments: [
      {
        type: {
          type: String,
          enum: ['task', 'objective', 'file', 'folder'],
          required: true,
        },
        id: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
      },
    ],
    read: {
      type: Boolean,
      default: false,
    },
    deletedForSender: {
      type: Boolean,
      default: false,
    },
    deletedForRecipient: {
      type: Boolean,
      default: false,
    },
    deletedForEveryone: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for faster message retrieval between two users
MessageSchema.index({ sender: 1, recipient: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, sender: 1, createdAt: -1 });

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
