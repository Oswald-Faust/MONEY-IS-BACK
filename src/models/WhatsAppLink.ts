import mongoose, { Schema, Model } from 'mongoose';

export interface IWhatsAppLink {
  _id: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  phone: string;
  waUserId?: string;
  label?: string;
  status: 'pending_verification' | 'verified' | 'disabled' | 'failed';
  isActive: boolean;
  verificationCode?: string;
  verificationExpiresAt?: Date;
  verifiedAt?: Date;
  optInConfirmedAt?: Date;
  initializationMessageSentAt?: Date;
  initializationLastError?: string;
  lastInboundAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppLinkSchema = new Schema<IWhatsAppLink>(
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
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    waUserId: {
      type: String,
      trim: true,
      index: true,
    },
    label: {
      type: String,
      trim: true,
      maxlength: [80, 'Le label WhatsApp ne peut pas dépasser 80 caractères'],
    },
    status: {
      type: String,
      enum: ['pending_verification', 'verified', 'disabled', 'failed'],
      default: 'pending_verification',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    verificationCode: {
      type: String,
      trim: true,
      maxlength: 12,
    },
    verificationExpiresAt: {
      type: Date,
    },
    verifiedAt: {
      type: Date,
    },
    optInConfirmedAt: {
      type: Date,
    },
    initializationMessageSentAt: {
      type: Date,
    },
    initializationLastError: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    lastInboundAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

WhatsAppLinkSchema.index({ workspace: 1, user: 1 }, { unique: true });
WhatsAppLinkSchema.index({ workspace: 1, phone: 1 }, { unique: true });
WhatsAppLinkSchema.index({ workspace: 1, status: 1 });
WhatsAppLinkSchema.index(
  { workspace: 1, waUserId: 1 },
  {
    unique: true,
    partialFilterExpression: { waUserId: { $exists: true, $type: 'string' } },
  }
);

const WhatsAppLink: Model<IWhatsAppLink> =
  mongoose.models.WhatsAppLink ||
  mongoose.model<IWhatsAppLink>('WhatsAppLink', WhatsAppLinkSchema);

export default WhatsAppLink;
