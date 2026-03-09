import type { User } from "./types";

// Note: This file contains client-side helper functions or specific client-only logic.
export const getUserById = async (id: number): Promise<User | null> => {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch user with id ${id}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    // Graceful fallback to avoid crashing client completely if api is not implemented
    return null;
  }
};
