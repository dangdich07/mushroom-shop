import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
  seo: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional()
  }).optional(),
  featured: z.boolean().optional()
});

export const updateProductSchema = createProductSchema.partial().extend({
  active: z.boolean().optional()
});

export const productSearchSchema = z.object({
  category: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  featured: z.enum(['true', 'false']).optional(),
  active: z.enum(['true', 'false']).optional(),
  search: z.string().optional(),
  priceMin: z.string().transform(val => val ? Number(val) : undefined).optional(),
  priceMax: z.string().transform(val => val ? Number(val) : undefined).optional(),
  page: z.string().transform(val => val ? Number(val) : 1).optional(),
  limit: z.string().transform(val => val ? Number(val) : 20).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional()
});

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().optional(),
  parent: z.string().optional(),
  image: z.string().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().optional()
});

export const updateCategorySchema = createCategorySchema.partial();


