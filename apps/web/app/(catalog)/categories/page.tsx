import { getJSON } from '../../../lib/api';
import Link from 'next/link';

export default async function CategoriesPage() {
  const data = await getJSON<{ items: any[] }>('/categories');
  
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Danh mục sản phẩm</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.items?.map((category: any) => (
          <div key={category.slug} className="border p-4 rounded space-y-2">
            <div className="font-medium">{category.name}</div>
            {category.description && (
              <div className="text-sm text-gray-600">{category.description}</div>
            )}
            <div className="flex gap-2">
              <Link 
                href={`/products?category=${category.slug}`} 
                className="text-blue-600 text-sm"
              >
                Xem sản phẩm
              </Link>
              <Link 
                href={`/products/category/${category.slug}`} 
                className="text-green-600 text-sm"
              >
                API endpoint
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      {(!data.items || data.items.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          Chưa có danh mục nào
        </div>
      )}
    </main>
  );
}


