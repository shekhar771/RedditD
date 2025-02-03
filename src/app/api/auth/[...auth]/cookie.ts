import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "session";

export const setSessionCookie = async (
  sessionToken: string,
  expiresAt: Date,
  response?: NextResponse
) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };

  if (response) {
    response.cookies.set(SESSION_COOKIE_NAME, sessionToken, cookieOptions);
  } else {
    (await cookies()).set(SESSION_COOKIE_NAME, sessionToken, cookieOptions);
  }
};

export const deleteSessionCookie = async (response?: NextResponse) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };

  if (response) {
    response.cookies.set(SESSION_COOKIE_NAME, "", cookieOptions);
  } else {
    (await cookies()).set(SESSION_COOKIE_NAME, "", cookieOptions);
  }
};

export const getSessionToken = async () => {
  return (await cookies()).get(SESSION_COOKIE_NAME)?.value;
};
