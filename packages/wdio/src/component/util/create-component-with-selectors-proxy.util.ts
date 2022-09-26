import { proxyCall } from './proxy-call.util';

import type { Enum } from '../../type';
import type { Component } from '../component/component';
import type { ComponentType } from '../type';

export const createComponentWithSelectorsProxy = <E extends string, T extends Component>(
    parent: T,
    selectors: Enum<E>
): ComponentType<E, T> =>
    new Proxy(parent as unknown as ComponentType<E, T>, {
        get(client, field: E, receiver) {
            if (field in client) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                return Reflect.get(client, field, receiver);
            }

            return proxyCall(client, selectors, field);
        },
    });
