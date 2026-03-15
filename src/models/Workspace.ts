import mongoose, { Schema, Document, Model } from 'mongoose';
import './User'; // S'assurer que le modèle User est enregistré

export interface IWorkspace extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  owner: mongoose.Types.ObjectId;
  members: {
    user: mongoose.Types.ObjectId;
    role: 'admin' | 'editor' | 'visitor';
    joinedAt: Date;
  }[];
  settings: {
    defaultProjectColor: string;
    allowInvitations: boolean;
    icon: string;
    image?: string;
    theme: 'dark' | 'light' | 'system';
  };
  aiProfile?: {
    businessSummary?: string;
    primaryGoals?: string[];
    teamSummary?: string;
    preferredTone?: 'coach' | 'direct' | 'friendly' | 'executive';
    onboardingCompleted?: boolean;
    whatsappEnabled?: boolean;
  };
  useCase: 'personal' | 'work' | 'school' | 'agency' | 'startup' | 'other';
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionPlan: 'starter' | 'pro' | 'team' | 'business' | 'enterprise';
  subscriptionStatus?: string;
  subscriptionPriceId?: string;
  subscriptionInterval?: 'month' | 'year';
  subscriptionEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du workspace est requis'],
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
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
      defaultProjectColor: {
        type: String,
        default: '#6366f1',
      },
      allowInvitations: {
        type: Boolean,
        default: true,
      },
      icon: {
        type: String,
        default: 'Briefcase',
      },
      image: {
        type: String,
        required: false,
      },
      theme: {
        type: String,
        enum: ['dark', 'light', 'system'],
        default: 'dark',
      },
    },
    aiProfile: {
      businessSummary: {
        type: String,
        trim: true,
        maxlength: [500, 'Le résumé business ne peut pas dépasser 500 caractères'],
      },
      primaryGoals: [{
        type: String,
        trim: true,
        maxlength: [140, 'Un objectif IA ne peut pas dépasser 140 caractères'],
      }],
      teamSummary: {
        type: String,
        trim: true,
        maxlength: [300, 'Le résumé équipe ne peut pas dépasser 300 caractères'],
      },
      preferredTone: {
        type: String,
        enum: ['coach', 'direct', 'friendly', 'executive'],
        default: 'coach',
      },
      onboardingCompleted: {
        type: Boolean,
        default: false,
      },
      whatsappEnabled: {
        type: Boolean,
        default: false,
      },
    },
    useCase: {
      type: String,
      enum: ['personal', 'work', 'school', 'agency', 'startup', 'freelance', 'creative', 'ecommerce', 'nonprofit', 'other'],
      default: 'other',
    },
    stripeCustomerId: String,
    subscriptionId: String,
    subscriptionPlan: {
      type: String,
      enum: ['starter', 'pro', 'team', 'business', 'enterprise'],
      default: 'starter',
    },
    subscriptionStatus: String,
    subscriptionPriceId: String,
    subscriptionInterval: {
      type: String,
      enum: ['month', 'year'],
    },
    subscriptionEnd: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
WorkspaceSchema.index({ owner: 1 });
WorkspaceSchema.index({ 'members.user': 1 });

const Workspace: Model<IWorkspace> = mongoose.models.Workspace || mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);

export default Workspace;
