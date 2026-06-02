import { pgTable, text, timestamp, decimal } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { user } from './auth';
import { categories } from './categories';
import { ingredients } from './ingredients';

export const products = pgTable('products', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	categoryId: text('category_id')
		.notNull()
		.references(() => categories.id, { onDelete: 'cascade' }),
	createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
	name: text('name').notNull(),
	imageUrl: text('image_url').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const productItemSize = pgTable('product_item_size', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	size: text('size').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const productItem = pgTable('product_items', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	productId: text('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'cascade' }),
	productItemSizeId: text('product_item_size_id')
		.notNull()
		.references(() => productItemSize.id, { onDelete: 'cascade' }),
	price: decimal('price').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const productIngredient = pgTable('product_ingredient', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	productId: text('product_id')
		.notNull()
		.references(() => products.id, { onDelete: 'cascade' }),
	ingredientId: text('ingredient_id')
		.notNull()
		.references(() => ingredients.id, { onDelete: 'cascade' }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
