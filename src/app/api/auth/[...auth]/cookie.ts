// app/api/auth/[...auth]/cookie.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "session";

// Cookie configuration
const getCookieOptions = (expiresAt?: Date) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  ...(expiresAt && { expires: expiresAt }),
  // Set a reasonable max age as fallback if expires is not provided
  maxAge: expiresAt

    ? Math.floor((expiresAt.getTime() - Date.now()) / 1000)
    : 60 * 60 * 24 * 7, // 1 week default
});

export const setSessionCookie = async (
  sessionToken: string,
  expiresAt: Date,
  response?: NextResponse
) => {
  const cookieOptions = getCookieOptions(expiresAt);

  try {
    if (response) {
      // For API routes using NextResponse
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: sessionToken,
        ...cookieOptions,
      });
    } else {
      // For server components/middleware
      (
        await // For server components/middleware
        cookies()
      ).set({

        name: SESSION_COOKIE_NAME,
        value: sessionToken,
        ...cookieOptions,
      });
    }
  } catch (error) {
    console.error("Error setting session cookie:", error);
    throw new Error("Failed to set session cookie");
  }
};

export const deleteSessionCookie = async (response?: NextResponse) => {
  const cookieOptions = {
    ...getCookieOptions(),
    maxAge: 0, // Expire immediately
    expires: new Date(0), // Set expiration to past date
  };

  try {
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      ...cookieOptions,
    });
    return response;

  } catch (error) {
    console.error("Error deleting session cookie:", error);
    throw new Error("Failed to delete session cookie");
  }
};

export const getSessionToken = async (): Promise<string | undefined> => {
  try {
    return (await cookies()).get(SESSION_COOKIE_NAME)?.value;
 
  } catch (error) {
    console.error("Error getting session token:", error);
    return undefined;
  }
};

// Utility to check if a session token exists
export const hasSessionToken = async (): Promise<boolean> => {
  try {
    const token = await getSessionToken();
    return !!token;
  } catch {
    return false;
  }

};

// Utility to check if a session token exists
export const hasSessionToken = async (): Promise<boolean> => {
  try {
    const token = await getSessionToken();
    return !!token;
  } catch {
    return false;
  }
};