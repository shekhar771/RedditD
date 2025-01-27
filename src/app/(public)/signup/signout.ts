import { NextApiRequest, NextApiResponse } from "next";
import { deleteSessionCookie } from "@/auth/cookie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") return res.status(405).end();
  await deleteSessionCookie();
  res.status(200).end();
}
