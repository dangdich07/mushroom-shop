import { Schema, model, models, Document } from 'mongoose';

export interface UserDocument extends Document {
  email: string;
  passwordHash: string;
  roles: string[];
  mfa?: Record<string, unknown>;
  addresses?: Array<Record<string, unknown>>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>({
  email: { type: String, required: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  roles: { type: [String], required: true, default: ['customer'] },
  mfa: { type: Schema.Types.Mixed },
  addresses: { type: [Schema.Types.Mixed], default: [] }
}, { timestamps: true });

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ roles: 1 });

export const UserModel = models.User || model<UserDocument>('User', UserSchema);


