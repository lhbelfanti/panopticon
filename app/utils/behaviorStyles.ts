import * as LucideIcons from "lucide-react";
import type { TargetBehavior } from "~/services/api/projects/types";

/**
 * Maps semantic behavior IDs to their visual styles (color and icon).
 * This keeps styling concerns in the frontend, out of API responses.
 */

interface BehaviorStyle {
    text: string;
    bg: string;
    icon: LucideIcons.LucideIcon;
}

const BEHAVIOR_STYLE_MAP: Record<TargetBehavior, BehaviorStyle> = {
    illicit_drugs: {
        text: "text-red-400",
        bg: "bg-red-400/10",
        icon: LucideIcons.Pill,
    },
    hate_speech: {
        text: "text-orange-400",
        bg: "bg-orange-400/10",
        icon: LucideIcons.MessageSquareWarning,
    },
    cyberbullying: {
        text: "text-purple-400",
        bg: "bg-purple-400/10",
        icon: LucideIcons.UserMinus,
    },
    sexism: {
        text: "text-pink-400",
        bg: "bg-pink-400/10",
        icon: LucideIcons.Scale,
    },
    suicidal_ideation_depression: {
        text: "text-blue-400",
        bg: "bg-blue-400/10",
        icon: LucideIcons.HeartCrack,
    },
    eating_disorders: {
        text: "text-teal-400",
        bg: "bg-teal-400/10",
        icon: LucideIcons.UtensilsCrossed,
    },
};

const FALLBACK: BehaviorStyle = {
    text: "text-gray-400",
    bg: "bg-gray-400/10",
    icon: LucideIcons.Circle,
};

export const getBehaviorStyles = (id: TargetBehavior): BehaviorStyle => {
    return BEHAVIOR_STYLE_MAP[id] ?? FALLBACK;
};
