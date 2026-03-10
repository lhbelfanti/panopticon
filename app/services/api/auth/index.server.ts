import { createAuthSession, destroyAuthSession } from "./session.server";
import type {
  LogInRequestBodyDTO,
  LogInResponse,
  SignUpRequestBodyDTO,
} from "./types";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const signup = async (
  requestBody: SignUpRequestBodyDTO,
): Promise<{ success: boolean; message: string }> => {
  // Artificial delay between 500ms and 1s
  await delay(Math.floor(Math.random() * 500) + 500);

  return { success: true, message: "Signup successful" };
};

export const login = async (
  requestBody: LogInRequestBodyDTO,
): Promise<LogInResponse> => {
  await delay(Math.floor(Math.random() * 500) + 500);

  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString(); // Expires in 30 days
  const token = `mock-jwt-token-${Date.now()}`;
  const userId = `mock-user-${Date.now()}`;

  const { headers } = await createAuthSession(token, expiresAt, userId);

  return {
    token,
    expiresAt,
    userId,
    headers,
  };
};

export const logout = async (request: Request, authToken?: string) => {
  await delay(Math.floor(Math.random() * 500) + 500);
  return destroyAuthSession(request);
};

export const requestPasswordReset = async (
  email: string,
): Promise<{ success: boolean; message: string }> => {
  await delay(Math.floor(Math.random() * 500) + 500);
  return { success: true, message: "Password reset email sent" };
};
