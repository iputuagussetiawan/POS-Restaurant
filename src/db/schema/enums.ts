import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', [
	'admin',
	'manager',
	'cashier',
	'kitchen',
	'member',
	'pending',
]);
export type UserRole = (typeof roleEnum.enumValues)[number];
