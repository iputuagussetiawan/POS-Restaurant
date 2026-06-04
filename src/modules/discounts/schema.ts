import { z } from 'zod';

export const discountInsertSchema = z.object({
	name: z.string().min(1, { message: 'Name is required.' }),
	code: z
		.string()
		.min(1, { message: 'Code is required.' })
		.regex(/^[A-Z0-9_-]+$/, { message: 'Code must be uppercase letters, numbers, - or _.' }),
	type: z.enum(['percentage', 'fixed']),
	value: z.coerce
		.number({ invalid_type_error: 'Value must be a number.' })
		.positive({ message: 'Value must be positive.' }),
	minOrderAmount: z.coerce.number().min(0).optional().nullable(),
	maxUses: z.coerce.number().int().positive().optional().nullable(),
	isActive: z.boolean(),
	expiresAt: z.string().optional().nullable(),
});

export const discountUpdateSchema = discountInsertSchema.extend({
	id: z.string().min(1, { message: 'Id is required.' }),
});
