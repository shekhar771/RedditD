import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrisma: PrismaClient;
}

let prismas: PrismaClient;
if (process.env.NODE_ENV === "production") {
  prismas = new PrismaClient();
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient();
  }
  prismas = global.cachedPrisma;
}

export const prisma = prismas;
