import { pgTable, text, timestamp, decimal, integer, pgEnum } from 'drizzle-orm/pg-core';
import { nanoid } from 'nanoid';
import { user } from './auth';
import { products } from './products';
import { customers } from './customers';

export const orderStatusEnum = pgEnum('order_status', [
	'pending',
	'processing',
	'completed',
	'cancelled',
]);

export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'card', 'qris', 'transfer']);

export const orders = pgTable('orders', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	cashierId: text('cashier_id').references(() => user.id, { onDelete: 'set null' }),
	customerId: text('customer_id').references(() => customers.id, { onDelete: 'set null' }),
	status: orderStatusEnum('status').notNull().default('pending'),
	subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
	tax: decimal('tax', { precision: 10, scale: 2 }).notNull(),
	serviceCharge: decimal('service_charge', { precision: 10, scale: 2 }).notNull().default('0'),
	total: decimal('total', { precision: 10, scale: 2 }).notNull(),
	note: text('note'),
	cancelReason: text('cancel_reason'),
	paymentMethod: paymentMethodEnum('payment_method'),
	customerName: text('customer_name'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const orderItems = pgTable('order_items', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => nanoid()),
	orderId: text('order_id')
		.notNull()
		.references(() => orders.id, { onDelete: 'cascade' }),
	productId: text('product_id').references(() => products.id, { onDelete: 'set null' }),
	name: text('name').notNull(),
	price: decimal('price', { precision: 10, scale: 2 }).notNull(),
	quantity: integer('quantity').notNull(),
	subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
});
