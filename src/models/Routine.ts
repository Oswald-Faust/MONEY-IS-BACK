import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRoutine extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  project: mongoose.Types.ObjectId;
  projectColor?: string;
  creator: mongoose.Types.ObjectId;
  days: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  time?: string; // HH:MM format
  duration?: number; // in minutes
  isActive: boolean;
  color: string;
  completedDates: Date[]; // Track when routine was completed
  createdAt: Date;
  updatedAt: Date;
}

const RoutineSchema = new Schema<IRoutine>(
  {
    title: {
      type: String,
      required: [true, 'Le titre de la routine est requis'],
      trim: true,
      maxlength: [100, 'Le titre ne peut pas dépasser 100 caractères'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    projectColor: {
      type: String,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    days: {
      monday: { type: Boolean, default: false },
      tuesday: { type: Boolean, default: false },
      wednesday: { type: Boolean, default: false },
      thursday: { type: Boolean, default: false },
      friday: { type: Boolean, default: false },
      saturday: { type: Boolean, default: false },
      sunday: { type: Boolean, default: false },
    },
    time: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Format d\'heure invalide (HH:MM)'],
    },
    duration: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    color: {
      type: String,
      default: '#8b5cf6', // Violet
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Couleur hexadécimale invalide'],
    },
    completedDates: [{
      type: Date,
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes
RoutineSchema.index({ project: 1, isActive: 1 });
RoutineSchema.index({ creator: 1 });

const Routine: Model<IRoutine> = mongoose.models.Routine || mongoose.model<IRoutine>('Routine', RoutineSchema);

export default Routine;
