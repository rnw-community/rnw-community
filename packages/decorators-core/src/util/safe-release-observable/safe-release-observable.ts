import { emptyFn } from '@rnw-community/shared';

import type { ResourceHandleInterface } from '../../interface/resource-handle.interface';

export const safeReleaseObservable = (handle: ResourceHandleInterface): void => {
    void Promise.resolve()
        .then(() => handle.release())
        .catch(emptyFn);
};
