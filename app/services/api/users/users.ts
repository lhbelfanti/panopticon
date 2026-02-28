import type { User } from "./types";

// Note: This file contains client-side helper functions or specific client-only logic.
export const getUserById = async (id: string): Promise<User | null> => {
    // Simulated domain logic
    if (id === "1") {
        return { id: "1", name: "John Doe" };
    }
    return null;
};
