import { Router } from 'express';
import { requireAuth } from '../middlewares/auth';
import { requireRole } from '../middlewares/rbac';
import {
  listCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller';

const router = Router();

// Public routes
router.get('/', listCategories);
router.get('/id/:id', getCategoryById);       // 👈 thêm
router.get('/slug/:slug', getCategoryBySlug); // 👈 nếu cần xem theo slug

// Admin routes
router.post('/', requireAuth, requireRole('admin'), createCategory);
router.put('/:id', requireAuth, requireRole('admin'), updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory);


export default router;


