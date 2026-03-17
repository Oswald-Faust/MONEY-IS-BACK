import mongoose, { Schema, Model } from 'mongoose';

export interface IWhatsAppLink {
  _id: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  phone: string;
  waUserId?: string;
  label?: string;
  isActive: boolean;
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
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
