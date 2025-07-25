import { sha256 } from "@oslojs/crypto/sha2";
// import { webcrypto as crypto } from "crypto"; // Add this import
import { prisma } from "@/lib/db"; // Prisma client instance
import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding";

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15; // 15 days
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2; // 30 days

const fromSessionTokenToSessionId = (sessionToken: string) => {
  return encodeHexLowerCase(sha256(new TextEncoder().encode(sessionToken)));
};
const crypto = globalThis.crypto;

export const generateRandomSessionToken = () => {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes); // Now uses the correct crypto instance
  return encodeBase32LowerCaseNoPadding(bytes);
};

export const createSession = async (sessionToken: string, userId: string) => {
  const sessionId = fromSessionTokenToSessionId(sessionToken);

  const session = {
    id: sessionId,
    userId,
    sessionToken,
    expires: new Date(Date.now() + SESSION_MAX_DURATION_MS), // Change expiresAt to expires
  };

  await prisma.session.create({ data: session });
  return session;
};

export const validateSession = async (sessionToken: string) => {
  const sessionId = fromSessionTokenToSessionId(sessionToken);

  const result = await prisma.session.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!result) return { session: null, user: null };

  const { user, ...session } = result;

  if (Date.now() >= session.expires.getTime()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return { session: null, user: null };
  }

  if (Date.now() >= session.expires.getTime() - SESSION_REFRESH_INTERVAL_MS) {
    session.expires = new Date(Date.now() + SESSION_MAX_DURATION_MS);
    await prisma.session.update({
      where: { id: sessionId },
      data: { expires: session.expires },
    });
  }

  return { session, user };
};

export const invalidateSession = async (sessionToken: string) => {
  try {
    const sessionId = fromSessionTokenToSessionId(sessionToken);
    await prisma.session.delete({ where: { id: sessionId } });
  } catch (error) {
    console.error("Error invalidating session:", error);
    throw new Error("Failed to invalidate session");
  }
};
