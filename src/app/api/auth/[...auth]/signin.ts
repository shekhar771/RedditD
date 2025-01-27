import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyPasswordHash } from "@/auth/password";
import { generateRandomSessionToken, createSession } from "@/auth/session";
import { setSessionCookie } from "@/auth/cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPasswordHash(user.passwordHash, password))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const sessionToken = generateRandomSessionToken();
  const session = await createSession(sessionToken, user.id);

  await setSessionCookie(sessionToken, session.expiresAt);

  res.status(200).json({ user });
}
