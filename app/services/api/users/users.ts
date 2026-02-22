import type { User } from "./types";

// Note: This file contains client-side helper functions or specific client-only logic.
export function formatUserName(user: User): string {
    return `${user.name.toUpperCase()} (Client Formatted)`;
}
