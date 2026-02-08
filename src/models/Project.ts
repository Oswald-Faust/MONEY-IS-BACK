import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  workspace: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  members: {
    user: mongoose.Types.ObjectId;
    role: 'admin' | 'editor' | 'visitor';
    joinedAt: Date;
  }[];
  settings: {
    isPublic: boolean;
    allowComments: boolean;
    defaultTaskPriority: 'important' | 'less_important' | 'waiting';
  };
  status: 'active' | 'archived' | 'paused';
  tasksCount: number;
  completedTasksCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du projet est requis'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },
    color: {
      type: String,
      required: true,
      default: '#6366f1', // Indigo
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Couleur hexadécimale invalide'],
    },
    icon: {
      type: String,
      default: 'folder',
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String,
        enum: ['admin', 'editor', 'visitor'],
        default: 'editor',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    settings: {
      isPublic: {
        type: Boolean,
        default: false,
      },
      allowComments: {
        type: Boolean,
        default: true,
      },
      defaultTaskPriority: {
        type: String,
        enum: ['important', 'less_important', 'waiting'],
        default: 'less_important',
      },
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'paused'],
      default: 'active',
    },
    tasksCount: {
      type: Number,
      default: 0,
    },
    completedTasksCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ProjectSchema.index({ workspace: 1, status: 1 });
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ 'members.user': 1 });

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
