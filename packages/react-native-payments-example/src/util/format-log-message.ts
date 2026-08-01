import { isDefined, isEmptyArray } from '@rnw-community/shared';

export const formatLogMessage = (topic: string, details: Record<string, number | string | undefined> = {}): string => {
    const detailPairs = Object.entries(details)
        .filter(([, value]) => isDefined(value))
        .map(([key, value]) => `${key}=${value}`);

    return isEmptyArray(detailPairs) ? topic : `${topic}: ${detailPairs.join(' ')}`;
};
