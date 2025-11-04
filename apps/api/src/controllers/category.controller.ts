import { Request, Response, NextFunction } from 'express';
import { CategoryModel } from '../models/category.model';
import mongoose from 'mongoose';
import categoriesRoutes from '../routes/categories.route';
export async function listCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await CategoryModel.find()
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    res.json({ items: categories });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryById(req: Request, res: Response, next: NextFunction) {
   try {
    const { id } = req.params;

    // ✅ Kiểm tra id hợp lệ (tránh CastError)
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: { code: 'INVALID_ID', message: 'ID danh mục không hợp lệ' } });
    }

    const doc = await CategoryModel.findById(id).lean();
    if (!doc) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Không tìm thấy danh mục' } });
    }

    res.json(doc);
  } catch (e) {
    next(e);
  }
}

export async function getCategoryBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const doc = await CategoryModel.findOne({ slug: req.params.slug }).lean();
    if (!doc) return res.status(404).json({ error: 'Category not found' });
    res.json(doc);
  } catch (e) { next(e); }
}


export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const category = new CategoryModel(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const category = await CategoryModel.findByIdAndUpdate(id, req.body, { new: true });
    if (!category) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }
    res.json(category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const deleted = await CategoryModel.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Category not found' } });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}


