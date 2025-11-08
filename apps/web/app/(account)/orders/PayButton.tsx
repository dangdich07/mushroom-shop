'use client';

import { useState } from 'react';
import Button from '../../../components/ui/Button';

type Props = { orderId: string; disabled?: boolean; className?: string };

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');

export default function PayButton({ orderId, disabled, className }: Props) {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders/${orderId}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        alert(`Không tạo được phiên thanh toán.\n${text}`);
        return;
      }
      const data = await res.json().catch(() => ({} as any));
      if (data?.url) window.location.href = data.url;
      else alert('Không nhận được URL thanh toán từ máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={onClick} disabled={disabled || loading} className={className}>
      {loading ? 'Đang chuyển…' : 'Thanh toán'}
    </Button>
  );
}
