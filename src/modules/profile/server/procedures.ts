import { z } from 'zod';
import { db } from '@/db';
import { user } from '@/db/schema';
import { createTRPCRouter, protectedProcedure } from '@/trpc/init';
import { eq } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';

export const profileRouter = createTRPCRouter({
	get: protectedProcedure.query(async ({ ctx }) => {
		const [profile] = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				role: user.role,
				createdAt: user.createdAt,
			})
			.from(user)
			.where(eq(user.id, ctx.auth.user.id));

		if (!profile) {
			throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
		}
		return profile;
	}),

	update: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, { message: 'Name is required.' }),
				image: z.string().url({ message: 'Must be a valid URL.' }).nullish(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const [updated] = await db
				.update(user)
				.set({ name: input.name, image: input.image ?? null })
				.where(eq(user.id, ctx.auth.user.id))
				.returning({
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
					role: user.role,
				});

			if (!updated) {
				throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
			}
			return updated;
		}),
});
