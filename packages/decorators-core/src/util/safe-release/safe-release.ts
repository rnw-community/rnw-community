import { emptyFn } from '@rnw-community/shared';

import type { ResourceHandleInterface } from '../../interface/resource-handle.interface';

export const safeRelease = (handle: ResourceHandleInterface): Promise<void> =>
    Promise.resolve()
        .then(() => handle.release())
        .catch(emptyFn);
