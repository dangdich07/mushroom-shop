import mongoose, { Schema, Document, Model } from 'mongoose';

interface OrderItem {
  sku: string;
  qty: number;
  price: number;
}

interface Totals {
  sub: number;
  discount?: number;
  ship?: number;
  tax?: number;
  grand: number;
}

export interface OrderDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  items: OrderItem[];
  totals: Totals;
  status: 'pending_payment' | 'paid' | 'failed' | 'canceled' | 'refunded';
  payment: { provider: 'stripe'; id: string | null; status: string };
  shipping?: any;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>({
  sku: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 }
}, { _id: false });

const TotalsSchema = new Schema<Totals>({
  sub: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  ship: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  grand: { type: Number, required: true }
}, { _id: false });

const OrderSchema = new Schema<OrderDocument>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  items: { type: [OrderItemSchema], required: true },
  totals: { type: TotalsSchema, required: true },
  status: { type: String, required: true, index: true },
  payment: {
    provider: { type: String, required: true, default: 'stripe' },
    id: { type: String, default: null, index: true },
    status: { type: String, required: true, default: 'requires_payment' }
  },
  shipping: { type: Schema.Types.Mixed },
  idempotencyKey: { type: String, index: true }
}, { timestamps: true });

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export const OrderModel: Model<OrderDocument> = mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);





