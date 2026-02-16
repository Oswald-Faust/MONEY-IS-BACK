import mongoose, { Schema, Document, Model } from 'mongoose';

export type TaskPriority = 'important' | 'less_important' | 'waiting';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  projectName?: string;
  projectColor?: string;
  assignees: mongoose.Types.ObjectId[];
  assignee?: mongoose.Types.ObjectId; // Deprecated, kept for backward compatibility
  creator: mongoose.Types.ObjectId;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: Date;
  startDate?: Date;
  estimatedTime?: number; // in minutes
  timeSpent?: number; // in minutes
  tags: string[];
  subtasks: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
  }[];
  comments: {
    id: string;
    user: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Le titre de la tâche est requis'],
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
      required: true,
    },
    projectName: {
      type: String,
    },
    projectColor: {
      type: String,
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignees: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    priority: {
      type: String,
      enum: ['important', 'less_important', 'waiting'],
      default: 'less_important',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'review', 'done'],
      default: 'todo',
    },
    dueDate: {
      type: Date,
    },
    startDate: {
      type: Date,
    },
    estimatedTime: {
      type: Number,
      min: 0,
    },
    timeSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    subtasks: [{
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
    attachments: [{
      id: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    comments: [{
      id: {
        type: String,
        required: true,
      },
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: true,
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better performance
TaskSchema.index({ project: 1, status: 1, priority: 1 });
TaskSchema.index({ assignee: 1, status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ priority: 1, order: 1 });

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
