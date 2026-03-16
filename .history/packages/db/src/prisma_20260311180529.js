import pkg from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import env from "../../../apps/server/src/config/env.js";

const { PrismaClient } = pkg;
const adapter = new PrismaPg({
  connectionString: env.DATABASE_URL,
});

export const prisma = new PrismaClient({
  adapter,
});
