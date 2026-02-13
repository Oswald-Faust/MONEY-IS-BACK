import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IObjective extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  project?: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  assignee?: mongoose.Types.ObjectId;
  targetDate?: Date;
  progress: number; // 0-100
  checkpoints: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  status: 'not_started' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const ObjectiveSchema = new Schema<IObjective>(
  {
    title: {
      type: String,
      required: [true, 'Le titre de l\'objectif est requis'],
      trim: true,
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'La description ne peut pas dépasser 2000 caractères'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    targetDate: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    checkpoints: [{
      id: {
        type: String,
        required: true,
      },
      title: {
        type: String,
        required: true,
        trim: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    }],
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
      default: 'not_started',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
ObjectiveSchema.index({ creator: 1, status: 1 });
ObjectiveSchema.index({ project: 1 });

const Objective: Model<IObjective> = mongoose.models.Objective || mongoose.model<IObjective>('Objective', ObjectiveSchema);

export default Objective;
