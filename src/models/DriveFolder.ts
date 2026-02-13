import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriveFolder extends Document {
  name: string;
  project?: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DriveFolderSchema = new Schema<IDriveFolder>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du dossier est requis'],
      trim: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    parentId: {
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

DriveFolderSchema.index({ parentId: 1 });
DriveFolderSchema.index({ project: 1 });

const DriveFolder: Model<IDriveFolder> = mongoose.models.DriveFolder || mongoose.model<IDriveFolder>('DriveFolder', DriveFolderSchema);

export default DriveFolder;
