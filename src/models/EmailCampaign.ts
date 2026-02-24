import mongoose, { Document, Model, Schema } from 'mongoose';

export type EmailCampaignStatus = 'draft' | 'sending' | 'sent' | 'failed';
export type EmailAudienceType = 'all_users' | 'admins' | 'notifications_enabled' | 'recent_users' | 'custom_emails';

export interface IEmailCampaignRecipientSnapshot {
  email: string;
  userId?: mongoose.Types.ObjectId;
  firstName?: string;
  lastName?: string;
}

export interface IEmailCampaign extends Document {
  name: string;
  description?: string;
  subject: string;
  body: string;
  templateId?: mongoose.Types.ObjectId;
  status: EmailCampaignStatus;
  audience: {
    type: EmailAudienceType;
    customEmails?: string[];
    daysSinceSignup?: number;
    lastResolvedCount?: number;
  };
  stats: {
    total: number;
    sent: number;
    failed: number;
    skipped: number;
  };
  recipientsSnapshot: IEmailCampaignRecipientSnapshot[];
  createdBy?: mongoose.Types.ObjectId;
  lastError?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailCampaignSchema = new Schema<IEmailCampaign>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, maxlength: 400 },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'EmailTemplate' },
    status: {
      type: String,
      enum: ['draft', 'sending', 'sent', 'failed'],
      default: 'draft',
      index: true,
    },
    audience: {
      type: {
        type: String,
        enum: ['all_users', 'admins', 'notifications_enabled', 'recent_users', 'custom_emails'],
        default: 'all_users',
      },
      customEmails: [{ type: String }],
      daysSinceSignup: { type: Number, default: 30 },
      lastResolvedCount: { type: Number, default: 0 },
    },
    stats: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
    },
    recipientsSnapshot: [
      {
        email: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        firstName: { type: String },
        lastName: { type: String },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    lastError: { type: String },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

EmailCampaignSchema.index({ createdAt: -1 });

const EmailCampaign: Model<IEmailCampaign> =
  mongoose.models.EmailCampaign || mongoose.model<IEmailCampaign>('EmailCampaign', EmailCampaignSchema);

export default EmailCampaign;
