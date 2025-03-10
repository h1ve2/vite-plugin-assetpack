import {AssetPack, AssetPackConfig} from "@assetpack/core";
import {createLogger, type ResolvedConfig} from "vite";
import path from "path";
import {getConfig} from "./apconfig.js";

export type viteAssetPackOptions = {
    /**
     * config path
     *
     * default: '.assetpack.js'
     */
    config?: string
} & Partial<AssetPackConfig>

/**
 * Using assetpack in Vite
 *
 * @example
 * export default defineConfig({
 *    ...
 *   plugins: [
 *     viteAssetPackPlugin(),
 *   ],
 * })
 */
export function viteAssetPackPlugin(options?: viteAssetPackOptions) {
    const option = {
        config: '.assetpack.js',
        ...options
    }

    const logger = createLogger('info', {
        prefix: '[vite-plugin-assetpack]',
        allowClearScreen: true
    });

    let mode: ResolvedConfig["command"];
    let ap: AssetPack | undefined;
    let apConfig: AssetPackConfig;

    return {
        name: "vite-plugin-assetpack",
        async configResolved(resolvedConfig) {
            let configPath: string;
            try {
                configPath = path.resolve(process.cwd(), option.config);
            } catch (e: any) {
                logger.error(`invalid path: ${option.config}`);
                process.exit(1);
            }

            try {
                apConfig = await getConfig(configPath)
            } catch (error: any) {
                logger.error(error.message);
                process.exit(1);

            }

            if (!apConfig) {
                logger.error('Config file found, but could not be read');
                process.exit(1);
            }

            mode = resolvedConfig.command;

        },
        buildStart: async () => {
            if (mode === "serve") {
                if (ap) return;
                ap = new AssetPack(apConfig);
                await ap.watch();
            } else {
                await new AssetPack(apConfig).run();
            }
        },
        buildEnd: async () => {
            if (ap) {
                await ap.stop();
                ap = undefined;
            }
        },
    };
}
