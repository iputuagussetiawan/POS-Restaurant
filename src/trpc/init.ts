import { auth } from '@/lib/auth';
import { roleEnum } from '@/db/schema';
import { initTRPC, TRPCError } from '@trpc/server';
import { headers } from 'next/headers';
import { cache } from 'react';

export const createTRPCContext = cache(async () => {
	return {};
});

const t = initTRPC.create({});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
	}

	return next({ ctx: { ...ctx, auth: session } });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	if (ctx.auth.user.role !== 'admin') {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
	}
	return next({ ctx });
});

export const staffProcedure = protectedProcedure.use(async ({ ctx, next }) => {
	const allowed: string[] = roleEnum.enumValues.filter((r) => r !== 'pending');
	if (!ctx.auth.user.role || !allowed.includes(ctx.auth.user.role)) {
		throw new TRPCError({ code: 'FORBIDDEN', message: 'Access restricted to staff' });
	}
	return next({ ctx });
});
