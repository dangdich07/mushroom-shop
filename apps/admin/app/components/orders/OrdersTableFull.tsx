'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ADMIN_API_BASE,
  ListResponse,
  Order,
  Pagination,
  formatVND,
  formatDate,
} from './types';
import { OrderStatusBadge } from './OrderStatusBadge';

type Props = {
  show: boolean;
};

export function OrdersTableFull({ show }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!show) return;
    void fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, show]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (status) params.set('status', status);

      const res = await fetch(
        `${ADMIN_API_BASE.replace(/\/$/, '')}/admin/orders?${params.toString()}`,
        { credentials: 'include' }
      );

      const data: ListResponse | Order[] = await res.json();
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
        ? data.items
        : [];

      setOrders(items);
      setPagination(
        !Array.isArray(data) && data.pagination
          ? data.pagination
          : {
              page,
              pageSize: items.length,
              total: items.length,
              pages: 1,
            }
      );
    } catch {
      setOrders([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }

  // thống kê
  const stats = useMemo(() => {
    let total = orders.length;
    let processing = 0; // paid + shipping + completed
    let pending = 0;
    let revenue = 0;

    for (const o of orders) {
      if (o.status === 'pending_payment') pending++;
      if (
        o.status === 'paid' ||
        o.status === 'shipping' ||
        o.status === 'completed'
      ) {
        processing++;
        if (typeof o.totals?.grand === 'number') {
          revenue += o.totals.grand;
        }
      }
    }

    return { total, processing, pending, revenue };
  }, [orders]);

  function exportCSV() {
    if (!orders.length) return;

    const header = [
      'orderId',
      'userId',
      'status',
      'paymentStatus',
      'paymentId',
      'grand',
      'createdAt',
    ];

    const rows = orders.map((o) => [
      o._id,
      o.userId || '',
      o.status,
      o.payment?.status || '',
      o.payment?.id || '',
      o.totals?.grand ?? '',
      o.createdAt || '',
    ]);

    const csv =
      [header, ...rows]
        .map((r) =>
          r
            .map((v) =>
              String(v ?? '')
                .replace(/"/g, '""')
                .replace(/\n/g, ' ')
            )
            .map((v) => `"${v}"`)
            .join(',')
        )
        .join('\n');

    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function updateStatus(orderId: string, nextStatus: string) {
    try {
      setUpdatingId(orderId);
      const res = await fetch(
        `${ADMIN_API_BASE.replace(
          /\/$/,
          ''
        )}/admin/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: nextStatus }),
        }
      );
      if (!res.ok) throw new Error();
      const { order } = (await res.json()) as { order: Order };

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...order } : o))
      );
      if (selected?._id === orderId) {
        setSelected({ ...selected, ...order });
      }
    } catch {
      alert(
        'Không cập nhật được trạng thái. Kiểm tra backend hoặc quyền admin.'
      );
    } finally {
      setUpdatingId(null);
    }
  }

  if (!show) return null;

  const canPrev = pagination && pagination.page > 1;
  const canNext = pagination && pagination.page < pagination.pages;

  return (
    <section className="space-y-3">
      {/* Header + stats + export */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Tất cả đơn hàng
          </h2>
          <p className="text-xs text-slate-500">
            Quản lý trạng thái thanh toán & vận chuyển cho toàn bộ đơn.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600">
          <div className="rounded-full bg-slate-50 px-3 py-1">
            Tổng: <span className="font-semibold">{stats.total}</span>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1">
            Đang xử lý:{' '}
            <span className="font-semibold">{stats.processing}</span>
          </div>
          <div className="rounded-full bg-amber-50 px-3 py-1">
            Chờ thanh toán:{' '}
            <span className="font-semibold">{stats.pending}</span>
          </div>
          <div className="rounded-full bg-slate-900 px-3 py-1 text-white">
            Doanh thu trang:{' '}
            <span className="font-semibold">
              {formatVND(stats.revenue)}
            </span>
          </div>
          <button
            type="button"
            onClick={exportCSV}
            disabled={!orders.length}
            className="ml-1 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ⬇ Xuất CSV
          </button>
        </div>
      </div>

      {/* Filter trạng thái */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600">
        <span className="text-slate-500">Lọc trạng thái:</span>
        <select
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          className="h-7 rounded-lg border border-slate-200 bg-white px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-slate-300"
        >
          <option value="">Tất cả</option>
          <option value="pending_payment">Chờ thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="shipping">Đang giao</option>
          <option value="completed">Hoàn tất</option>
          <option value="failed">Thanh toán lỗi</option>
          <option value="canceled">Đã huỷ</option>
          <option value="refunded">Hoàn tiền</option>
        </select>
      </div>

      {/* Bảng đơn hàng */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="grid grid-cols-[1.6fr,1fr,1fr,1.2fr,auto] gap-3 bg-slate-50 px-4 py-2 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
          <div>Đơn hàng</div>
          <div>Thời gian</div>
          <div>Tổng tiền</div>
          <div>Trạng thái</div>
          <div className="text-right">Hành động</div>
        </div>

        {loading ? (
          <div className="px-4 py-6 text-center text-xs text-slate-500">
            Đang tải danh sách đơn hàng…
          </div>
        ) : !orders.length ? (
          <div className="px-4 py-6 text-center text-xs text-slate-500">
            Không có đơn hàng nào phù hợp bộ lọc.
          </div>
        ) : (
          orders.map((o, idx) => (
            <div
              key={o._id}
              className={`grid grid-cols-[1.6fr,1fr,1fr,1.2fr,auto] gap-3 px-4 py-2 text-[10px] text-slate-800 ${
                idx % 2 ? 'bg-slate-50/40' : 'bg-white'
              }`}
            >
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-900">
                  #{o._id}
                </div>
                <div className="text-[9px] text-slate-500">
                  UID: {o.userId || '—'}
                </div>
                {o.payment?.id && (
                  <div className="text-[8px] text-slate-400">
                    PI: {o.payment.id}
                  </div>
                )}
              </div>

              <div className="text-[9px] text-slate-600">
                {formatDate(o.createdAt)}
              </div>

              <div className="font-semibold text-slate-900">
                {formatVND(o.totals?.grand)}
              </div>

              <div className="space-y-0.5">
                <OrderStatusBadge status={o.status} />
                {o.payment?.status && (
                  <div className="text-[8px] text-slate-400">
                    payment: {o.payment.status}
                  </div>
                )}
              </div>

              {/* Hành động: paid / shipping / completed / canceled / refunded */}
              <div className="flex items-center justify-end gap-1.5">
                <button
                  onClick={() => setSelected(o)}
                  className="rounded-full border border-slate-200 px-2 py-0.5 text-[9px] text-slate-700 hover:bg-slate-50"
                >
                  Chi tiết
                </button>

                {o.status === 'pending_payment' && (
                  <button
                    disabled={updatingId === o._id}
                    onClick={() => updateStatus(o._id, 'paid')}
                    className="rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Đánh dấu paid
                  </button>
                )}

                {o.status === 'paid' && (
                  <button
                    disabled={updatingId === o._id}
                    onClick={() => updateStatus(o._id, 'shipping')}
                    className="rounded-full bg-sky-500 px-2 py-0.5 text-[9px] font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
                  >
                    Đang giao
                  </button>
                )}

                {o.status === 'shipping' && (
                  <button
                    disabled={updatingId === o._id}
                    onClick={() => updateStatus(o._id, 'completed')}
                    className="rounded-full bg-indigo-600 px-2 py-0.5 text-[9px] font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    Hoàn tất
                  </button>
                )}

                {/* Hoàn tiền thêm riêng */}
                {o.status !== 'refunded' && (
                  <button
                    disabled={updatingId === o._id}
                    onClick={() => updateStatus(o._id, 'refunded')}
                    className="rounded-full bg-cyan-50 px-2 py-0.5 text-[9px] text-cyan-800 hover:bg-cyan-100 disabled:opacity-50"
                  >
                    Hoàn tiền
                  </button>
                )}

                {o.status !== 'canceled' &&
                  o.status !== 'completed' && (
                    <button
                      disabled={updatingId === o._id}
                      onClick={() => updateStatus(o._id, 'canceled')}
                      className="rounded-full bg-slate-200 px-2 py-0.5 text-[9px] text-slate-700 hover:bg-slate-300 disabled:opacity-50"
                    >
                      Huỷ
                    </button>
                  )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Phân trang nhỏ gọn */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between pt-1 text-[9px] text-slate-500">
          <div>
            Trang {pagination.page}/{pagination.pages} ·{' '}
            {pagination.total} đơn
          </div>
          <div className="flex gap-2">
            <button
              disabled={!canPrev}
              onClick={() => canPrev && setPage((p) => p - 1)}
              className={`rounded-full px-3 py-1 ${
                canPrev
                  ? 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                  : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
              }`}
            >
              ← Trước
            </button>
            <button
              disabled={!canNext}
              onClick={() => canNext && setPage((p) => p + 1)}
              className={`rounded-full px-3 py-1 ${
                canNext
                  ? 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                  : 'bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed'
              }`}
            >
              Sau →
            </button>
          </div>
        </div>
      )}

      {/* Drawer chi tiết từ bảng full */}
      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/20">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-4 py-2">
              <div>
                <div className="text-[9px] text-slate-500">
                  Chi tiết đơn hàng
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  #{selected._id}
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-700 hover:bg-slate-200"
              >
                Đóng ✕
              </button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3 text-[10px] text-slate-700">
              <div className="space-y-1">
                <div>UID: {selected.userId || '—'}</div>
                <div>Tạo lúc: {formatDate(selected.createdAt)}</div>
                <div className="flex items-center gap-1">
                  <span>Trạng thái:</span>
                  <OrderStatusBadge status={selected.status} />
                </div>
                {selected.payment?.id && (
                  <div>Payment ID: {selected.payment.id}</div>
                )}
                {selected.payment?.status && (
                  <div>Payment status: {selected.payment.status}</div>
                )}
                {selected.idempotencyKey && (
                  <div>Idempotency key: {selected.idempotencyKey}</div>
                )}
              </div>

              <div className="border-t pt-2">
                <div className="mb-1 font-semibold">
                  Sản phẩm
                </div>
                {selected.items?.length ? (
                  <div className="space-y-1">
                    {selected.items.map((it, i) => (
                      <div
                        key={i}
                        className="flex justify-between gap-2"
                      >
                        <div>
                          <div className="font-medium">
                            {it.sku}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            {it.qty} × {formatVND(it.price)}
                          </div>
                        </div>
                        <div className="text-[9px] font-semibold">
                          {formatVND(it.qty * it.price)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-[9px] text-slate-400">
                    Không có chi tiết sản phẩm.
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Tổng cộng</span>
                <span>{formatVND(selected.totals?.grand)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t px-4 py-2 text-[9px]">
              <Link
                href={`/orders/${selected._id}`}
                className="text-sky-600 hover:underline"
              >
                Mở trang chi tiết đầy đủ →
              </Link>
              <button
                onClick={() => setSelected(null)}
                className="rounded-full bg-slate-900 px-3 py-1 text-[9px] font-medium text-white hover:bg-slate-800"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
