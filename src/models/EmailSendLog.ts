import mongoose, { Document, Model, Schema } from 'mongoose';

export type EmailLogStatus = 'sent' | 'failed' | 'skipped';
export type EmailLogCategory = 'automation' | 'campaign' | 'system' | 'test';

export interface IEmailSendLog extends Document {
  to: string;
  subject: string;
  status: EmailLogStatus;
  category: EmailLogCategory;
  templateId?: mongoose.Types.ObjectId;
  templateName?: string;
  automationKey?: string;
  campaignId?: mongoose.Types.ObjectId;
  campaignName?: string;
  userId?: mongoose.Types.ObjectId;
  providerMessageId?: string;
  variables?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  errorMessage?: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EmailSendLogSchema = new Schema<IEmailSendLog>(
  {
    to: { type: String, required: true, index: true },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ['sent', 'failed', 'skipped'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: ['automation', 'campaign', 'system', 'test'],
      default: 'system',
      index: true,
    },
    templateId: { type: Schema.Types.ObjectId, ref: 'EmailTemplate' },
    templateName: { type: String },
    automationKey: { type: String, index: true },
    campaignId: { type: Schema.Types.ObjectId, ref: 'EmailCampaign', index: true },
    campaignName: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    providerMessageId: { type: String },
    variables: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
    errorMessage: { type: String },
    sentAt: { type: Date, index: true },
  },
  { timestamps: true }
);

EmailSendLogSchema.index({ createdAt: -1 });
EmailSendLogSchema.index({ category: 1, createdAt: -1 });

const EmailSendLog: Model<IEmailSendLog> =
  mongoose.models.EmailSendLog || mongoose.model<IEmailSendLog>('EmailSendLog', EmailSendLogSchema);

export default EmailSendLog;
