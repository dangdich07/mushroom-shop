  import { Router } from 'express';
  import { requireAuth } from '../middlewares/auth';
  import { requireRole } from '../middlewares/rbac';
  import {
    listProducts,
    getProductById,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getFeaturedProducts,
    getProductsByCategory
  } from '../controllers/product.controller';

  import {
  addSkusForProduct,
  toggleSkuActive,
  deleteSku
} from '../controllers/skus.controller';
  const router = Router();

  // Public routes
  router.get('/', listProducts);
  router.get('/id/:id', getProductById);
  router.get('/search', searchProducts);
  router.get('/featured', getFeaturedProducts);
  router.get('/category/:categorySlug', getProductsByCategory);
  router.get('/slug/:slug', getProduct);

  // ✅ Alias cho GET /products/:id (đặt sau các route tĩnh ở trên)
  router.get('/:id', getProductById);

  // Admin routes
  router.post('/', requireAuth, requireRole('admin'), createProduct);
  router.put('/:id', requireAuth, requireRole('admin'), updateProduct);
  router.delete('/:id', requireAuth, requireRole('admin'), deleteProduct);
  
       // (để trang edit liệt kê)
router.post('/:id/skus', addSkusForProduct);        // thêm nhiều SKU
router.patch('/:id/skus/:skuId/active', toggleSkuActive);
router.delete('/:id/skus/:skuId', deleteSku);

  export default router;
