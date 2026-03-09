/**
 * Maps semantic color keys to Tailwind class pairs.
 * This keeps styling concerns in the frontend, out of API responses.
 */

const BEHAVIOR_COLOR_MAP: Record<string, { text: string; bg: string }> = {
    red: { text: "text-red-400", bg: "bg-red-400/10" },
    orange: { text: "text-orange-400", bg: "bg-orange-400/10" },
    purple: { text: "text-purple-400", bg: "bg-purple-400/10" },
    pink: { text: "text-pink-400", bg: "bg-pink-400/10" },
    blue: { text: "text-blue-400", bg: "bg-blue-400/10" },
    teal: { text: "text-teal-400", bg: "bg-teal-400/10" },
};

const FALLBACK = { text: "text-gray-400", bg: "bg-gray-400/10" };

export const getBehaviorClasses = (color: string): { text: string; bg: string } => {
    return BEHAVIOR_COLOR_MAP[color] ?? FALLBACK;
};
