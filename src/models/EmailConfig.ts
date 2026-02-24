import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmailConfig extends Document {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    pass: string;
    from: string;
  };
  automations: {
    onRegister: boolean;
    onPayment: boolean;
    onWorkspaceAction: boolean;
    onInvitation: boolean;
    onWorkspaceWelcome: boolean;
  };
  updatedAt: Date;
}

const EmailConfigSchema = new Schema<IEmailConfig>(
  {
    smtp: {
      host: { type: String, default: 'smtp.hostinger.com' },
      port: { type: Number, default: 465 },
      secure: { type: Boolean, default: true },
      user: { type: String, default: '' },
      pass: { type: String, default: '' },
      from: { type: String, default: 'Edwin <contact@edwin.com>' },
    },
    automations: {
      onRegister: { type: Boolean, default: true },
      onPayment: { type: Boolean, default: true },
      onWorkspaceAction: { type: Boolean, default: true },
      onInvitation: { type: Boolean, default: true },
      onWorkspaceWelcome: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

const EmailConfig: Model<IEmailConfig> = mongoose.models.EmailConfig || mongoose.model<IEmailConfig>('EmailConfig', EmailConfigSchema);

export default EmailConfig;
