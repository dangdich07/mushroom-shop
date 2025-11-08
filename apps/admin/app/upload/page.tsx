'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import BackButton from '../components/BackButton';

type Uploaded = { url: string; publicId: string };

export default function UploadPage() {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Uploaded[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addToPending = useCallback((urls: string[]) => {
    try {
      const raw = localStorage.getItem('pendingImages');
      const prev = raw ? (JSON.parse(raw) as string[]) : [];
      const merged = Array.from(new Set([...(prev || []), ...urls]));
      localStorage.setItem('pendingImages', JSON.stringify(merged));
      alert(`✅ Đã gửi ${urls.length} ảnh sang form sản phẩm (pendingImages).`);
    } catch {
      alert('Không thể lưu pendingImages vào localStorage.');
    }
  }, []);

  const sign = useCallback(async () => {
    const res = await fetch('/api/cloudinary/sign', { method: 'POST' });
    if (!res.ok) throw new Error('SIGN_FAILED');
    return (await res.json()) as {
      cloudName: string;
      apiKey: string;
      signature: string;
      timestamp: number;
      folder: string;
      tags: string | string[];
      uploadUrl: string;
    };
  }, []);

  const uploadOne = useCallback(async (file: File) => {
    const { apiKey, signature, timestamp, folder, tags, uploadUrl } = await sign();
    const fd = new FormData();
    fd.set('file', file);
    fd.set('api_key', apiKey);
    fd.set('timestamp', String(timestamp));
    fd.set('signature', signature);
    fd.set('folder', folder);
    fd.set('tags', Array.isArray(tags) ? tags.join(',') : String(tags));

    const res = await fetch(uploadUrl, { method: 'POST', body: fd });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || 'UPLOAD_FAILED');

    return { url: json.secure_url as string, publicId: json.public_id as string };
  }, [sign]);

  const handleFiles = useCallback(async (files: FileList) => {
    setError(null);
    setLoading(true);
    try {
      const results: Uploaded[] = [];
      for (const f of Array.from(files)) {
        // Chặn file > 10MB cho an toàn MVP
        if (f.size > 10 * 1024 * 1024) {
          setError('File quá lớn (>10MB). Bỏ qua: ' + f.name);
          continue;
        }
        const u = await uploadOne(f);
        results.push(u);
      }
      if (results.length) setItems((prev) => [...results, ...prev]);
      if (!results.length && !error) setError('Không upload được file nào.');
    } catch (e: any) {
      setError(String(e?.message || 'UPLOAD_ERROR'));
    } finally {
      setLoading(false);
    }
  }, [uploadOne, error]);

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) handleFiles(files);
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const totalSizeMb = useMemo(
    () => Math.round((items.length * 2000) / 10) / 100, // hiển thị tượng trưng (2MB/ảnh)
    [items.length]
  );

  useEffect(() => {
    // Không làm gì; chỉ là nơi bạn muốn auto-import pending vào đâu đó nếu sau này cần
  }, []);

  return (
    <div className="space-y-6">
      <BackButton label="Quay lại" />

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload ảnh sản phẩm</h1>
        <p className="text-gray-600">Quản lý hình ảnh cho sản phẩm (Cloudinary)</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="text-gray-400 text-6xl mb-4">📷</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Kéo thả ảnh vào đây hoặc click để chọn
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Hỗ trợ: JPG, PNG, WEBP (≤ 10MB)
          </p>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onChangeInput}
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

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>
      </div>

      {items.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Ảnh đã upload ({items.length})
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => addToPending(items.map((i) => i.url))}
                className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Gửi tất cả sang form sản phẩm
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
            {items.map((it, idx) => (
              <div key={it.publicId + idx} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img className="w-full h-full object-cover" src={it.url} alt="" />
                </div>
                <div className="mt-2 text-xs text-gray-600 truncate">{it.publicId}</div>
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(it.url);
                      }}
                      className="bg-black/70 text-white rounded px-2 py-1 text-xs"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => addToPending([it.url])}
                      className="bg-blue-600 text-white rounded px-2 py-1 text-xs"
                    >
                      Thêm vào form
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-600 mt-4">
            Ước lượng dung lượng: ~{totalSizeMb}MB
          </p>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">Gợi ý sử dụng</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload tại đây → Copy URL hoặc “Gửi sang form”.</li>
          <li>• Mở form Thêm/Sửa sản phẩm → bấm “Nhập từ Upload” để tự lấy URL.</li>
          <li>• Lưu ý không commit các biến CLOUDINARY_API_SECRET.</li>
        </ul>
      </div>
    </div>
  );
}
