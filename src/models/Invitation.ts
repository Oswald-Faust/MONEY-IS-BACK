
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IInvitation extends Document {
  email: string;
  workspace: mongoose.Types.ObjectId;
  role: 'admin' | 'editor' | 'visitor';
  token: string;
  inviter: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'editor', 'visitor'],
      default: 'editor',
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    inviter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InvitationSchema.index({ email: 1, workspace: 1 }, { unique: true }); // Prevent duplicate pending invites? Status check needed?
// Actually if one is pending, prevent another. If expired/accepted, allow new.
// Unique index might be too strict if we don't partial filter.
// Let's just index email and workspace.
InvitationSchema.index({ email: 1 });
InvitationSchema.index({ workspace: 1 });

const Invitation: Model<IInvitation> = mongoose.models.Invitation || mongoose.model<IInvitation>('Invitation', InvitationSchema);

export default Invitation;
