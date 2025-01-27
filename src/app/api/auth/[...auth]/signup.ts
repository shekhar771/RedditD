import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/auth/password";
import { generateRandomSessionToken, createSession } from "@/auth/session";
import { setSessionCookie } from "@/auth/cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();

  const { username, email, password } = req.body;

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
  });

  const sessionToken = generateRandomSessionToken();
  const session = await createSession(sessionToken, user.id);

  await setSessionCookie(sessionToken, session.expiresAt);

  res.status(201).json({ user });
}
