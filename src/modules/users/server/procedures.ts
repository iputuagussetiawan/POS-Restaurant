import { z } from 'zod';
import { db } from '@/db';
import { user, roleEnum, account } from '@/db/schema';
import { createTRPCRouter, adminProcedure } from '@/trpc/init';
import { and, asc, count, eq, ilike } from 'drizzle-orm';
import { TRPCError } from '@trpc/server';
import { nanoid } from 'nanoid';
import { hashPassword } from 'better-auth/crypto';
import {
	DEFAULT_PAGE,
	DEFAULT_PAGE_SIZE,
	MAX_PAGE_SIZE,
	MIN_PAGE_SIZE,
} from '../../../../constants';

const VALID_ROLES = roleEnum.enumValues;

export const usersRouter = createTRPCRouter({
	create: adminProcedure
		.input(
			z.object({
				name: z.string().min(1, 'Name is required'),
				email: z.string().email('Invalid email'),
				password: z.string().min(8, 'Password must be at least 8 characters'),
				role: z.enum(VALID_ROLES).default('pending'),
			})
		)
		.mutation(async ({ input }) => {
			const [existing] = await db
				.select({ id: user.id })
				.from(user)
				.where(eq(user.email, input.email.toLowerCase()));
			if (existing) {
				throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use.' });
			}

			const userId = nanoid();
			const hashedPassword = await hashPassword(input.password);
			const now = new Date();

			const [created] = await db
				.insert(user)
				.values({
					id: userId,
					name: input.name,
					email: input.email.toLowerCase(),
					emailVerified: true,
					role: input.role,
					createdAt: now,
					updatedAt: now,
				})
				.returning();

			await db.insert(account).values({
				id: nanoid(),
				accountId: userId,
				providerId: 'credential',
				userId,
				password: hashedPassword,
				createdAt: now,
				updatedAt: now,
			});

			return created;
		}),

	getAll: adminProcedure
		.input(
			z.object({
				page: z.number().default(DEFAULT_PAGE),
				pageSize: z
					.number()
					.min(MIN_PAGE_SIZE)
					.max(MAX_PAGE_SIZE)
					.default(DEFAULT_PAGE_SIZE),
				search: z.string().nullish(),
				role: z.enum(VALID_ROLES).nullish(),
				status: z.enum(['active', 'banned']).nullish(),
			})
		)
		.query(async ({ input }) => {
			const { page, pageSize, search, role, status } = input;
			const where = and(
				search ? ilike(user.name, `%${search}%`) : undefined,
				role ? eq(user.role, role) : undefined,
				status === 'banned' ? eq(user.banned, true) : undefined,
				status === 'active' ? eq(user.banned, false) : undefined
			);

			const data = await db
				.select({
					id: user.id,
					name: user.name,
					email: user.email,
					role: user.role,
					banned: user.banned,
					createdAt: user.createdAt,
				})
				.from(user)
				.where(where)
				.orderBy(asc(user.createdAt))
				.limit(pageSize)
				.offset((page - 1) * pageSize);

			const [total] = await db.select({ count: count() }).from(user).where(where);
			return {
				items: data,
				total: total.count,
				totalPages: Math.ceil(total.count / pageSize),
			};
		}),

	setRole: adminProcedure
		.input(z.object({ userId: z.string().min(1), role: z.enum(VALID_ROLES) }))
		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(user)
				.set({ role: input.role })
				.where(eq(user.id, input.userId))
				.returning({ id: user.id, role: user.role });
			if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
			return updated;
		}),

	ban: adminProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(user)
				.set({ banned: true })
				.where(eq(user.id, input.userId))
				.returning({ id: user.id });
			if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
			return updated;
		}),

	unban: adminProcedure
		.input(z.object({ userId: z.string().min(1) }))
		.mutation(async ({ input }) => {
			const [updated] = await db
				.update(user)
				.set({ banned: false })
				.where(eq(user.id, input.userId))
				.returning({ id: user.id });
			if (!updated) throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
			return updated;
		}),
});
