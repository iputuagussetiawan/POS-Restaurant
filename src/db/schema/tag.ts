
import { relations } from "drizzle-orm";
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";
import { postTags } from "./postTags";
import { z } from "zod";

export const tag = pgTable("tag", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull().unique(),
});

export const tagRelations = relations(tag, ({ many }) => ({
	postToTag: many(postTags),
}));


export const tagSchema = z.object({
	id: z.number().optional(),
	name: z.string(),
});

export type TagSchema = z.infer<typeof tagSchema>;



