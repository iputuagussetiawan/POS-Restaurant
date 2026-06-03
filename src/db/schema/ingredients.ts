import { pgTable, text, timestamp, decimal } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';

export const ingredients = pgTable('ingredients', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	name: text('name').notNull(),
	price: decimal('price').notNull(),
	imageUrl: text('image_url').notNull(),
	description: text('description').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
