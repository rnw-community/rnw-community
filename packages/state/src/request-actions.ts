import { action, payload } from 'ts-action';

import { TsActionCreator } from './type';

// TODO: Make args action optional by providing initial object structure?

export type RequestActionsTuple<T, A> = [
    /*requestAction:*/ TsActionCreator<A>,
    /*requestSuccessAction:*/ TsActionCreator<T>,
    /*requestFailedAction:*/ TsActionCreator<string>,
    /*requestArgsAction:*/ TsActionCreator<A>
];

/**
 * Creates actions tuple for item request
 *
 * @param {string} prefix An action type prefix
 *
 * @return {RequestActionsTuple}
 */
export const requestActions = <T, A>(prefix: string): RequestActionsTuple<T, A> => [
    action(`${prefix}`, payload<A>()),
    action(`${prefix}Success`, payload<T>()),
    action(`${prefix}Failed`, payload<string>()),
    action(`${prefix}Args`, payload<A>()),
];
