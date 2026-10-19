import { relative } from 'node:path';

import { BaseMods } from '@expo/config-plugins';

import type { ExportedConfig, ModPlatform } from '@expo/config-plugins';

type BaseModProvider<T> = ReturnType<typeof BaseMods.provider<T>>;

interface DoctorProviderOptions<T> {
    platform: ModPlatform;
    modName: string;
    provider: BaseModProvider<T>;
    serialize: (contents: T) => string;
    fix: boolean;
    drifts: string[];
}

const getLines = (text: string): string[] => text.split('\n').map(line => line.trim());

const formatDrift = (filePath: string, foundText: string, expectedText: string): string => {
    const foundLines = getLines(foundText);
    const expectedLines = getLines(expectedText);

    return [
        filePath,
        ...foundLines.filter(line => !expectedLines.includes(line)).map(line => `  - ${line}`),
        ...expectedLines.filter(line => !foundLines.includes(line)).map(line => `  + ${line}`),
    ].join('\n');
};

export const withDoctorProvider = <T>(
    config: ExportedConfig,
    { platform, modName, provider, serialize, fix, drifts }: DoctorProviderOptions<T>
): ExportedConfig => {
    let foundText = '';

    return BaseMods.withGeneratedBaseMods(config, {
        platform,
        providers: {
            [modName]: BaseMods.provider<T>({
                getFilePath: provider.getFilePath,
                read: async (filePath, modConfig, props) => {
                    const contents = await provider.read(filePath, modConfig, props);
                    foundText = serialize(contents);

                    return contents;
                },
                write: async (filePath, modConfig, props) => {
                    const expectedText = serialize(modConfig.modResults);

                    if (expectedText === foundText) {
                        return;
                    }

                    drifts.push(formatDrift(relative(modConfig.modRequest.projectRoot, filePath), foundText, expectedText));

                    if (fix) {
                        await provider.write(filePath, modConfig, props);
                    }
                },
            }),
        },
    });
};
