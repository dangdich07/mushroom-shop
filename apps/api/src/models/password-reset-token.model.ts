import mongoose, { Schema, Document, Model } from 'mongoose';

export interface PasswordResetTokenDocument extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<PasswordResetTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // tự xóa khi hết hạn

export const PasswordResetTokenModel: Model<PasswordResetTokenDocument> =
  mongoose.models.PasswordResetToken ||
  mongoose.model<PasswordResetTokenDocument>('PasswordResetToken', PasswordResetTokenSchema);
