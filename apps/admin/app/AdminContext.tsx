'use client';
import React, { createContext, useContext } from 'react';

// ✅ Định nghĩa kiểu dữ liệu rõ ràng cho user
export type AdminUser = {
  id?: string;
  email?: string;
  roles?: string[];
};

export type AdminContextValue = {
  user?: AdminUser | null;
};

// ✅ Khởi tạo context với giá trị mặc định rỗng
const AdminContext = createContext<AdminContextValue | undefined>(undefined);

// ✅ Provider — giữ nguyên logic gốc, thêm kiểm tra an toàn
export function AdminContextProvider({
  value,
  children,
}: {
  value: AdminContextValue;
  children: React.ReactNode;
}) {
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

// ✅ Hook an toàn hơn: tránh lỗi nếu gọi useAdmin ngoài Provider
export function useAdmin(): AdminContextValue {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminContextProvider');
  }
  return context;
}
