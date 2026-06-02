import { z } from 'zod';
import { db } from '@/db';
import { user, roleEnum } from '@/db/schema';
import { createTRPCRouter, adminProcedure } from '@/trpc/init';
import { asc, eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

const VALID_ROLES = roleEnum.enumValues;

export const usersRouter = createTRPCRouter({
	getAll: adminProcedure.query(async () => {
		return db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
			})
			.from(user)
			.orderBy(asc(user.createdAt));
	}),

	setRole: adminProcedure
		.input(
			z.object({
				userId: z.string().min(1),
				role: z.enum(VALID_ROLES),
			})
		)
		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(user)
				.set({ role: input.role })
				.where(eq(user.id, input.userId))
				.returning({ id: user.id, role: user.role });

			if (!updated) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
			}
			return updated;
		}),
});
