import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISystemLog extends Document {
  user?: mongoose.Types.ObjectId;
  action: string;
  details: string;
  status: 'info' | 'warning' | 'error' | 'success';
  ip?: string;
  createdAt: Date;
}

const SystemLogSchema = new Schema<ISystemLog>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    ip: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const SystemLog: Model<ISystemLog> = mongoose.models.SystemLog || mongoose.model<ISystemLog>('SystemLog', SystemLogSchema);

export default SystemLog;
