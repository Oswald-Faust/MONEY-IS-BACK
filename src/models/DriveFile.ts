import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriveFile extends Document {
  name: string;
  type: string;
  size: number;
  url: string;
  project?: mongoose.Types.ObjectId;
  folderId?: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DriveFileSchema = new Schema<IDriveFile>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du fichier est requis'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: Number, // in bytes
      required: true,
    },
    url: {
      type: String, // Public path or Cloud Storage URL
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    folderId: {
      type: Schema.Types.ObjectId,
      ref: 'DriveFolder',
      default: null,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

DriveFileSchema.index({ folderId: 1 });
DriveFileSchema.index({ project: 1 });

const DriveFile: Model<IDriveFile> = mongoose.models.DriveFile || mongoose.model<IDriveFile>('DriveFile', DriveFileSchema);

export default DriveFile;
