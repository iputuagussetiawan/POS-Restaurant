
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const category = pgTable("category", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull().unique(),
});



