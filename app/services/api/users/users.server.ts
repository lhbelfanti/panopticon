import type { User } from "./types";

// Note: This file should hold server secrets, external API calls, and DB logic.
// It runs exclusively on the server.
export const getUserById = async (id: string): Promise<User | null> => {
    // Simulated domain logic
    if (id === "1") {
        return { id: "1", name: "John Doe" };
    }
    return null;
};
