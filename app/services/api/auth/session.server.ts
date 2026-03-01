import { createCookieSessionStorage } from "react-router";
import type { SessionData } from "./types";

const SESSION_SECRET =
  process.env.SESSION_SECRET || "fallback-secret-for-panopticon";
const SESSION_REFRESH_THRESHOLD_MS: number = 5 * 60 * 1000; // 5 minutes
const COOKIE_SESSION_STORAGE_MAX_AGE: number = 30 * 24 * 60 * 60; // 30 days

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "panopticon_session",
    secure: process.env.NODE_ENV === "production",
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    maxAge: COOKIE_SESSION_STORAGE_MAX_AGE,
    httpOnly: true,
  },
});

export const createAuthSession = async (token: string, expiresAt: string) => {
  const session = await sessionStorage.getSession();
  session.set("token", token);
  session.set("expiresAt", expiresAt);

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
  const dateNow = Date.now();
  const expiresAtDate = new Date(expiresAt);
  const hasTokenExpired: boolean =
    expiresAtDate.getTime() - dateNow < SESSION_REFRESH_THRESHOLD_MS;

  return { token, hasTokenExpired };
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
