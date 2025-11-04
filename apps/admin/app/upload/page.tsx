'use client';

import { useState } from 'react';
import BackButton from '../components/BackButton';
export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    
    try {
      // Simulate file upload (in real app, you'd upload to cloud storage)
      const fileNames = Array.from(files).map(file => file.name);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUploadedFiles(prev => [...prev, ...fileNames]);
      alert(`Đã upload ${files.length} file thành công!`);
    } catch (error) {
      alert('Lỗi khi upload file');
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      // Simulate file processing
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
    }
  };

  return (
    <div className="space-y-6">
      {/* 🔹 Nút quay lại */}
                  <BackButton label="Quay lại" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload ảnh sản phẩm</h1>
        <p className="text-gray-600">Quản lý hình ảnh cho sản phẩm</p>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow p-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div className="text-gray-400 text-6xl mb-4">📷</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Kéo thả ảnh vào đây hoặc click để chọn
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Hỗ trợ: JPG, PNG, GIF (tối đa 10MB mỗi file)
          </p>
          
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={loading}
            className="hidden"
            id="file-upload"
          />
          
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 cursor-pointer ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Đang upload...' : 'Chọn ảnh'}
          </label>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ảnh đã upload ({uploadedFiles.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {uploadedFiles.map((fileName, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🖼️</span>
                </div>
                <div className="mt-2 text-xs text-gray-600 truncate">
                  {fileName}
                </div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quản lý ảnh</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Thông tin</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Tổng ảnh: {uploadedFiles.length}</li>
              <li>• Dung lượng: ~{uploadedFiles.length * 2}MB</li>
              <li>• Định dạng: JPG, PNG, GIF</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Hướng dẫn</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Upload ảnh chất lượng cao</li>
              <li>• Tên file không có ký tự đặc biệt</li>
              <li>• Kích thước khuyến nghị: 800x600px</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Future Features */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">🚀 Tính năng sắp tới</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload lên Cloudinary/AWS S3</li>
          <li>• Resize ảnh tự động</li>
          <li>• Watermark cho ảnh</li>
          <li>• Gallery quản lý ảnh</li>
          <li>• Liên kết ảnh với sản phẩm</li>
        </ul>
      </div>
    </div>
  );
}
