import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IIdea extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  content: string;
  project?: mongoose.Types.ObjectId;
  creator: mongoose.Types.ObjectId;
  assignee?: mongoose.Types.ObjectId;
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: Date;
  }[];
  tags: string[];
  status: 'raw' | 'standby' | 'in_progress' | 'implemented' | 'archived';
  votes: mongoose.Types.ObjectId[];
  comments: {
    id: string;
    user: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const IdeaSchema = new Schema<IIdea>(
  {
    title: {
      type: String,
      required: [true, 'Le titre de l\'idée est requis'],
      trim: true,
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
    },
    content: {
      type: String,
      required: [true, 'Le contenu est requis'],
      trim: true,
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
    tags: [{
      type: String,
      trim: true,
    }],
    status: {
      type: String,
      enum: ['raw', 'standby', 'in_progress', 'implemented', 'archived'],
      default: 'raw',
    },
    votes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
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
  },
  {
    timestamps: true,
  }
);

// Indexes
IdeaSchema.index({ creator: 1, status: 1 });
IdeaSchema.index({ project: 1 });
IdeaSchema.index({ tags: 1 });

const Idea: Model<IIdea> = mongoose.models.Idea || mongoose.model<IIdea>('Idea', IdeaSchema);

export default Idea;
