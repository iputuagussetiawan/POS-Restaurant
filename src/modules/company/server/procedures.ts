import { z } from 'zod';
import { db } from '@/db';
import { companySettings } from '@/db/schema';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '@/trpc/init';
import { eq } from 'drizzle-orm';

const upsertSchema = z.object({
	name: z.string().min(1).optional(),
	tagline: z.string().optional(),
	address: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().optional(),
	logoUrl: z.string().url().or(z.literal('')).optional(),
	website: z.string().optional(),
	receiptFooter: z.string().optional(),
	taxRate: z.number().min(0).max(100).optional(),
	bankName: z.string().optional(),
	bankAccountNumber: z.string().optional(),
	bankAccountName: z.string().optional(),
	qrisImageUrl: z.string().url().or(z.literal('')).optional(),
	qrisName: z.string().optional(),
	currencyCode: z.string().min(1).max(10).optional(),
	currencySymbol: z.string().min(1).max(5).optional(),
	currencyLocale: z.string().min(1).optional(),
});

export const companyRouter = createTRPCRouter({
	get: protectedProcedure.query(async () => {
		const [settings] = await db
			.select()
			.from(companySettings)
			.where(eq(companySettings.id, 'default'));
		return settings ?? null;
	}),

	upsert: adminProcedure.input(upsertSchema).mutation(async ({ input }) => {
		const [existing] = await db
			.select({ id: companySettings.id })
			.from(companySettings)
			.where(eq(companySettings.id, 'default'));

		if (existing) {
			const [updated] = await db
				.update(companySettings)
				.set({
					...input,
					taxRate: input.taxRate !== undefined ? String(input.taxRate) : undefined,
					updatedAt: new Date(),
				})
				.where(eq(companySettings.id, 'default'))
				.returning();
			return updated;
		}

		const [created] = await db
			.insert(companySettings)
			.values({
				id: 'default',
				...input,
				taxRate: input.taxRate !== undefined ? String(input.taxRate) : '10',
			})
			.returning();
		return created;
	}),
});
