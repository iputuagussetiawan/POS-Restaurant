import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const customers = pgTable('customers', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	name: text('name').notNull(),
	phone: text('phone').notNull().unique(),
	email: text('email'),
	points: integer('points').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
