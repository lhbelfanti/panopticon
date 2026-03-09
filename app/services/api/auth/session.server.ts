import { createCookieSessionStorage } from "react-router";
import type { SessionData } from "./types";

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET environment variable must be set in production");
}
const sessionSecret = SESSION_SECRET || "fallback-secret-for-panopticon";
const SESSION_REFRESH_THRESHOLD_MS: number = 5 * 60 * 1000; // 5 minutes
const COOKIE_SESSION_STORAGE_MAX_AGE: number = 30 * 24 * 60 * 60; // 30 days

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "panopticon_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    maxAge: COOKIE_SESSION_STORAGE_MAX_AGE,
    httpOnly: true,
  },
});

export const createAuthSession = async (token: string, expiresAt: string, userId?: string) => {
  const session = await sessionStorage.getSession();
  session.set("token", token);
  session.set("expiresAt", expiresAt);
  if (userId) {
    session.set("userId", userId);
  }

  return {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  };
};

export const getDataFromSession = async (
  request: Request,
): Promise<SessionData | null> => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );

  if (!session.has("token") || !session.has("expiresAt")) {
    return null;
  }

  const token: string = session.get("token");
  const expiresAt: string = session.get("expiresAt");
  const userId: string | undefined = session.get("userId");
  const dateNow = Date.now();
  const expiresAtDate = new Date(expiresAt);
  const hasTokenExpired: boolean =
    expiresAtDate.getTime() - dateNow < SESSION_REFRESH_THRESHOLD_MS;

  return { token, userId, hasTokenExpired };
};

export const destroyAuthSession = async (request: Request) => {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  return await sessionStorage.destroySession(session);
};

export const isAuthenticated = async (request: Request): Promise<boolean> => {
  const sessionData = await getDataFromSession(request);
  if (!sessionData || sessionData?.hasTokenExpired) {
    return false;
  }
  return true;
};

/**
 * Consolidates session retrieval + user lookup into a single call.
 * Returns both session data and the associated user (if any).
 */
export const getSessionUser = async (request: Request) => {
  const { getUserById } = await import("~/services/api/users/users.server");
  const session = await getDataFromSession(request);
  if (!session?.userId) {
    return { session: null, user: null };
  }
  const userId = parseInt(session.userId, 10);
  const user = await getUserById(userId);
  return { session, user };
};
