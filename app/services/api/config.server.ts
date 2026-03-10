import { getBehaviorsConfig } from "./projects/index.server";
import { getSupportedPlatforms } from "./entries/mocks/platforms";
import { DEFAULT_TOKEN_QUOTA } from "~/components/Dashboard/SummaryGrid/types";

export interface AppConfig {
    behaviors: Awaited<ReturnType<typeof getBehaviorsConfig>>;
    platforms: Awaited<ReturnType<typeof getSupportedPlatforms>>;
    tokenQuota: number;
}

export const getAppConfig = async (): Promise<AppConfig> => {
    const [behaviors, platforms] = await Promise.all([
        getBehaviorsConfig(),
        getSupportedPlatforms(),
    ]);

    return {
        behaviors,
        platforms,
        tokenQuota: DEFAULT_TOKEN_QUOTA,
    };
};
