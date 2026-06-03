import { pgTable, text, timestamp, decimal } from 'drizzle-orm/pg-core';

export const companySettings = pgTable('company_settings', {
	id: text('id').primaryKey().default('default'),
	name: text('name').notNull().default('FoodOrder'),
	tagline: text('tagline'),
	address: text('address'),
	phone: text('phone'),
	email: text('email'),
	logoUrl: text('logo_url'),
	website: text('website'),
	receiptFooter: text('receipt_footer'),
	taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).notNull().default('10'),
	bankName: text('bank_name'),
	bankAccountNumber: text('bank_account_number'),
	bankAccountName: text('bank_account_name'),
	qrisImageUrl: text('qris_image_url'),
	qrisName: text('qris_name'),
	currencyCode: text('currency_code').notNull().default('USD'),
	currencySymbol: text('currency_symbol').notNull().default('$'),
	currencyLocale: text('currency_locale').notNull().default('en-US'),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
