import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISecureId extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  link?: string;
  username?: string;
  password: string; // Will be encrypted
  notes?: string;
  category?: string;
  project?: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const SecureIdSchema = new Schema<ISecureId>(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },
    link: {
      type: String,
      trim: true,
    },
    username: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      select: false, // Don't return by default
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Les notes ne peuvent pas dépasser 1000 caractères'],
    },
    category: {
      type: String,
      trim: true,
      default: 'Général',
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sharedWith: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
SecureIdSchema.index({ owner: 1, category: 1 });
SecureIdSchema.index({ project: 1 });

const SecureId: Model<ISecureId> = mongoose.models.SecureId || mongoose.model<ISecureId>('SecureId', SecureIdSchema);

export default SecureId;
