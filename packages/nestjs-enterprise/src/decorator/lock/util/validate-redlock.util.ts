import { isDefined } from '@rnw-community/shared';

import type { LockableService } from '../service/lockable.service';

export const validateRedlock = (self: LockableService): void => {
    if (!isDefined(self.redlock)) {
        throw new Error(
            'Redlock is not available on this instance. Ensure that the class using the `Lock` decorator extends `LockableService` or provide redlock field manually.'
        );
    }
};
