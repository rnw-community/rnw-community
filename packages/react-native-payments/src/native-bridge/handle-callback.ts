import { isDefined } from '@rnw-community/shared';

import type { NativeErrorInterface } from '../interface/native-error.interface';

type Resolve<T> = Parameters<ConstructorParameters<typeof Promise<T>>[0]>[0];
type Reject<T> = Parameters<ConstructorParameters<typeof Promise<T>>[0]>[1];

export const handleNativeCallback =
    <T>(resolve: Resolve<T>, reject: Reject<T>, value: T) =>
    (err?: NativeErrorInterface): void => {
        if (isDefined(err)) {
            reject(err);
        } else {
            resolve(value);
        }
    };
