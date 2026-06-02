import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { user } from './auth';

export const categories = pgTable('categories', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
	name: text('name').notNull(),
	slug: text('slug').notNull().unique(),
	description: text('description').notNull(),
	imageUrl: text('image_url').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
