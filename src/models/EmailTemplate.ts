import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailTemplate extends Document {
  name: string;
  subject: string;
  body: string; // HTML content
  type: 'automation' | 'campaign' | 'system';
  automationKey?: string; // e.g., 'welcome', 'payment', 'workspace_action'
  variables: string[]; // List of available variables for this template
  lastUpdated: Date;
}

const EmailTemplateSchema = new Schema<IEmailTemplate>(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['automation', 'campaign', 'system'], 
      default: 'automation' 
    },
    automationKey: { type: String, unique: true, sparse: true },
    variables: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

const EmailTemplate: Model<IEmailTemplate> = mongoose.models.EmailTemplate || mongoose.model<IEmailTemplate>('EmailTemplate', EmailTemplateSchema);

export default EmailTemplate;
