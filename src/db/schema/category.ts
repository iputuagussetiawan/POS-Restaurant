
import { relations } from "drizzle-orm";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { post } from "./post";
import { z } from "zod";

export const category = pgTable("category", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull().unique(),
});

export const categoryRelations = relations(category, ({ many }) => ({
	posts: many(post),
}));

export const categorySchema = z.object({
	id: z.number().optional(),
	name: z.string(),
});
export type CategorySchema = z.infer<typeof categorySchema>;




