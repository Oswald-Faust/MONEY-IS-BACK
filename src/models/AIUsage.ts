import mongoose, { Schema, Document } from 'mongoose';

export type AIFeature = 'assistant' | 'search' | 'objectives' | 'whatsapp';

export interface IAIUsage extends Document {
  workspace: mongoose.Types.ObjectId;
  /** Format "YYYY-MM" ex: "2026-04" */
  month: string;
  tokensUsed: number;
  breakdown: Record<AIFeature, number>;
  updatedAt: Date;
  createdAt: Date;
}

const AIUsageSchema = new Schema<IAIUsage>(
  {
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    month: { type: String, required: true }, // "YYYY-MM"
    tokensUsed: { type: Number, default: 0 },
    breakdown: {
      assistant:  { type: Number, default: 0 },
      search:     { type: Number, default: 0 },
      objectives: { type: Number, default: 0 },
      whatsapp:   { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Un seul document par workspace × mois
AIUsageSchema.index({ workspace: 1, month: 1 }, { unique: true });

export default mongoose.models.AIUsage ||
  mongoose.model<IAIUsage>('AIUsage', AIUsageSchema);
