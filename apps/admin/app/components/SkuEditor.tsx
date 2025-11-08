'use client';

import { useState } from 'react';

export type SkuRow = {
  sku: string;
  price: number;
  weight?: number;
  stock?: number;
  active?: boolean;
};

export default function SkuEditor({
  value = [],
  onChange,
  title = 'SKU (biến thể)',
}: {
  value?: SkuRow[];
  onChange: (rows: SkuRow[]) => void;
  title?: string;
}) {
  const [rows, setRows] = useState<SkuRow[]>(
    value.length ? value : [{ sku: '', price: 0, weight: undefined, stock: 0, active: true }]
  );

  const push = () => {
    const next = [...rows, { sku: '', price: 0, weight: undefined, stock: 0, active: true }];
    setRows(next); onChange(next);
  };
  const remove = (i: number) => {
    const next = rows.slice(); next.splice(i, 1);
    const safe = next.length ? next : [{ sku: '', price: 0, weight: undefined, stock: 0, active: true }];
    setRows(safe); onChange(safe);
  };
  const set = (i: number, patch: Partial<SkuRow>) => {
    const next = rows.slice();
    next[i] = { ...rows[i], ...patch };
    setRows(next); onChange(next);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">{title}</h3>
        <button
          type="button"
          onClick={push}
          className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-sm hover:opacity-90"
        >
          + Thêm dòng
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600">
              <th className="py-2 pr-3">SKU *</th>
              <th className="py-2 pr-3">Giá (VND) *</th>
              <th className="py-2 pr-3">Khối lượng (g)</th>
              <th className="py-2 pr-3">Tồn</th>
              <th className="py-2 pr-3">Hoạt động</th>
              <th className="py-2 pr-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="py-2 pr-3">
                  <input
                    value={r.sku}
                    onChange={(e) => set(i, { sku: e.target.value.trim() })}
                    className="w-44 border rounded px-2 py-1"
                    placeholder="VD: LC-100-DRY"
                    required
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={Number.isFinite(r.price) ? r.price : 0}
                    onChange={(e) => set(i, { price: Number(e.target.value || 0) })}
                    className="w-40 border rounded px-2 py-1"
                    required
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={r.weight ?? ''}
                    onChange={(e) =>
                      set(i, { weight: e.target.value === '' ? undefined : Number(e.target.value) })
                    }
                    className="w-32 border rounded px-2 py-1"
                    placeholder="VD: 500"
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="number"
                    min={0}
                    step="1"
                    value={r.stock ?? 0}
                    onChange={(e) => set(i, { stock: Number(e.target.value || 0) })}
                    className="w-28 border rounded px-2 py-1"
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    type="checkbox"
                    checked={r.active ?? true}
                    onChange={(e) => set(i, { active: e.target.checked })}
                  />
                </td>
                <td className="py-2 pr-3">
                  <button type="button" onClick={() => remove(i)} className="text-red-600 hover:underline">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500">* Không bắt buộc. Có thể thêm SKU sau.</p>
    </div>
  );
}
