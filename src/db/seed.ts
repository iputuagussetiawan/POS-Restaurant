import { drizzle } from "drizzle-orm/node-postgres";
import { seed } from "drizzle-seed";
import { user } from "./schema";

async function main() {
  const db = drizzle(process.env.DATABASE_URL!);
  await seed(db, { user }).refine((f) => ({
    user: {
        columns: {
            name: f.fullName(),
        },
        count: 20
    }
  }));
}
main();