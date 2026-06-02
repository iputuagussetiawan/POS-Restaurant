import { z } from 'zod';

export const productInsertSchema = z.object({
	name: z.string().min(1, { message: 'Name is required.' }),
	slug: z.string().optional(),
	categoryId: z.string().min(1, { message: 'Category is required.' }),
	description: z.string().optional(),
	price: z.coerce.number().min(0, { message: 'Price must be 0 or more.' }),
	isAvailable: z.boolean(),
	imageUrl: z.string().min(1, { message: 'Image is required.' }),
});

export const productUpdateSchema = productInsertSchema.extend({
	id: z.string().min(1, { message: 'Id is required.' }),
});
