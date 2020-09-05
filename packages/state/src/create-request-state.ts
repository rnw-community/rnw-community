import { On } from 'ts-action';

import { requestActions, RequestActionsTuple } from './request-actions';
import { requestReducers } from './request-reducers';
import { requestInitialState, RequestStateInterface, StateInterface } from './request-state.interface';

export const createRequestState = <T, A, S extends StateInterface, K extends keyof S>(
    prefix: string,
    stateKey: K
): [RequestActionsTuple<T, A>, Array<On<S>>, RequestStateInterface<T, A>] => {
    const actions = requestActions<T, A>(`${prefix}${stateKey}`);

    const initialState: RequestStateInterface<T, A> = requestInitialState;

    return [actions, requestReducers<S, K, T, A>(actions, stateKey), initialState];
};
