import {pathToFileURL} from "url";
import {AssetPackConfig} from "@assetpack/core";

export async function getConfig(configPath: string): Promise<AssetPackConfig> {
    const esmLoader = dynamicImportLoader();
    const urlForConfig = pathToFileURL(configPath);

    const apConfig: AssetPackConfig = (await esmLoader!(urlForConfig)).default;

    return apConfig;
}

function dynamicImportLoader() {
    let importESM;

    try {
        // eslint-disable-next-line no-new-func
        importESM = new Function('id', 'return import(id);');
    } catch (e) {
        importESM = null;
    }

    return importESM;
}