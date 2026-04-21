import { isNotEmptyString } from '@rnw-community/shared';

export const resolveFallbackClassName = (target: object): string => {
    if (typeof target === 'function') {
        const { name } = target as { readonly name?: string };
        if (isNotEmptyString(name)) {
            return name;
        }
    }
    const ctorName = (target as { readonly constructor?: { readonly name?: string } }).constructor?.name;

    return isNotEmptyString(ctorName) ? ctorName : 'Object';
};
