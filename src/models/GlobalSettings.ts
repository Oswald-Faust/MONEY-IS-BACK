import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGlobalSettings extends Document {
  permissions: {
    createProject: boolean;
    deleteProject: boolean;
    inviteMembers: boolean;
    viewAnalytics: boolean;
    manageBilling: boolean;
    exportData: boolean;
    driveAccess: boolean;
    allowedFileTypes: string[];
  };
  updatedAt: Date;
}

const GlobalSettingsSchema = new Schema<IGlobalSettings>(
  {
    permissions: {
      createProject: { type: Boolean, default: true },
      deleteProject: { type: Boolean, default: false },
      inviteMembers: { type: Boolean, default: true },
      viewAnalytics: { type: Boolean, default: false },
      manageBilling: { type: Boolean, default: false },
      exportData: { type: Boolean, default: true },
      driveAccess: { type: Boolean, default: true },
      allowedFileTypes: { type: [String], default: [] }, // Empty means all allowed
    },
  },
  {
    timestamps: true,
  }
);

const GlobalSettings: Model<IGlobalSettings> = mongoose.models.GlobalSettings || mongoose.model<IGlobalSettings>('GlobalSettings', GlobalSettingsSchema);

export default GlobalSettings;
