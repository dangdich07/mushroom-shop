import Link from 'next/link';

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
        <p className="text-gray-600">Xem và quản lý tất cả đơn hàng</p>
      </div>

      {/* Coming Soon */}
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="text-gray-400 text-6xl mb-4">📦</div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Sắp có!</h2>
        <p className="text-gray-600 mb-6">
          Tính năng quản lý đơn hàng đang được phát triển
        </p>
        
        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="font-medium text-gray-900 mb-3">Tính năng sẽ có:</h3>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li>• Danh sách tất cả đơn hàng</li>
            <li>• Chi tiết đơn hàng</li>
            <li>• Cập nhật trạng thái đơn hàng</li>
            <li>• Thống kê doanh thu</li>
            <li>• Xuất báo cáo</li>
            <li>• Quản lý vận chuyển</li>
          </ul>
        </div>

        <div className="mt-6">
          <Link 
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Quay lại Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
