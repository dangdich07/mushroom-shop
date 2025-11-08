export type OrderItem = {
  sku: string;
  qty: number;
  price: number;
};

export type Totals = { grand?: number };

export type Payment = {
  id?: string | null;
  status?: string;
};

export type Order = {
  _id: string;
  userId?: string;
  items?: OrderItem[];
  totals?: Totals;
  status: string;
  payment?: Payment;
  createdAt?: string;
  idempotencyKey?: string;
};

export type Pagination = {
  page: number;
  pages: number;
  total: number;
  pageSize: number;
};

export type ListResponse = {
  items: Order[];
  pagination?: Pagination;
};

export const ADMIN_API_BASE =
  (process.env.NEXT_PUBLIC_API_ABSOLUTE_URL as string) ||
  (process.env.NEXT_PUBLIC_API_URL as string) ||
  'http://localhost:4000';

export function formatVND(n?: number) {
  if (typeof n !== 'number') return '—';
  try {
    return n.toLocaleString('vi-VN') + '₫';
  } catch {
    return `${n}₫`;
  }
}

export function formatDate(s?: string) {
  if (!s) return '—';
  try {
    return new Date(s).toLocaleString('vi-VN');
  } catch {
    return s;
  }
}

export function statusBadgeClass(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'pending_payment':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'shipping':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'completed':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'failed':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'canceled':
      return 'bg-slate-50 text-slate-500 border-slate-200';
    case 'refunded':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}
