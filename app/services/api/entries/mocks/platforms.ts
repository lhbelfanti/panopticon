import type { SocialMediaType } from "../types";

export interface SocialMediaPlatform {
    id: SocialMediaType;
    name: string;
    icon: string; // Name of Lucide icon or custom SVG reference
}

const mockPlatforms: SocialMediaPlatform[] = [
    {
        id: "twitter",
        name: "X (Twitter)",
        icon: "Twitter", // Or a custom X logo if we have one
    }
];

export async function getSupportedPlatforms(): Promise<SocialMediaPlatform[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockPlatforms;
}
