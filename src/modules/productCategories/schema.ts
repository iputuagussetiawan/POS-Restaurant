import { z } from 'zod';

export const categoriesInsertSchema = z.object({
	name: z.string().min(1, {
		message: 'Name is required.',
	}),
	description: z.string().min(1, {
		message: 'description is required.',
	}),
	imageUrl: z.string().min(1, {
		message: 'image is required.',
	}),
	slug: z.string().optional(),
});

export const categoriesUpdateSchema = categoriesInsertSchema.extend({
	id: z.string().min(1, {
		message: 'Id is required.',
	}),
});
