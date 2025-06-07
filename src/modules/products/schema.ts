import { z } from 'zod';

export const productInsertSchema = z.object({
    name: z.string().min(1, {
        message: 'Name is required.',
    }),
    categoryId: z.string().min(1, {
        message: 'Category is required.',
    }),
    imageUrl: z.string().min(1, {
        message: 'image is required.',
    }),
});

export const productUpdateSchema = productInsertSchema.extend({
    id: z.string().min(1, {
        message: 'Id is required.',
    }),
});
