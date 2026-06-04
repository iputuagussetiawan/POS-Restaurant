import { boolean, decimal, integer, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { user } from './auth';

export const discountTypeEnum = pgEnum('discount_type', ['percentage', 'fixed']);

export const discounts = pgTable('discounts', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
	name: text('name').notNull(),
	code: text('code').notNull().unique(),
	type: discountTypeEnum('type').notNull().default('percentage'),
	value: decimal('value', { precision: 10, scale: 2 }).notNull(),
	minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
	maxUses: integer('max_uses'),
	usedCount: integer('used_count').notNull().default(0),
	isActive: boolean('is_active').notNull().default(true),
	expiresAt: timestamp('expires_at'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
