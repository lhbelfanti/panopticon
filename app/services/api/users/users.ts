import type { User } from "./types";

// Note: This file contains client-side helper functions or specific client-only logic.
export const getUserById = async (id: number): Promise<User | null> => {
  if (id === 1) {
    return { id: 1, name: "John", lastName: "Doe", nickname: "johndoe" };
  }
  return null;
};
