import { z } from 'zod';
import { db } from '@/db';
import { customers } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { eq, ilike, count, desc } from 'drizzle-orm';

export const customersRouter = createTRPCRouter({
	getByPhone: protectedProcedure
		.input(z.object({ phone: z.string().min(1) }))
		.query(async ({ input }) => {
			const [customer] = await db
				.select()
				.from(customers)
				.where(eq(customers.phone, input.phone));
			return customer ?? null;
		}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1),
				phone: z.string().min(1),
				email: z.string().email().optional(),
			})
		)
		.mutation(async ({ input }) => {
			const [customer] = await db.insert(customers).values(input).returning();
			return customer;
		}),

	getMany: protectedProcedure
		.input(z.object({ search: z.string().optional() }))
		.query(async ({ input }) => {
			return db
				.select()
				.from(customers)
				.where(input.search ? ilike(customers.name, `%${input.search}%`) : undefined)
				.orderBy(desc(customers.createdAt))
				.limit(50);
		}),
});
