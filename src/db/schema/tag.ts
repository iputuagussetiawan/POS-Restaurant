
import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const tag = pgTable("tag", {
	id: serial("id").primaryKey(),
	name: varchar("name", { length: 255 }).notNull().unique(),
});



