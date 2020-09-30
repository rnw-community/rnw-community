import { On } from 'ts-action';

import { requestActions, RequestActionsTuple } from './request-actions';
import { requestReducers } from './request-reducers';
import { requestInitialState, RequestStateInterface, StateInterface } from './request-state.interface';
import { ArgsType, EntityType } from './type';

export const createRequestState = <
    S extends StateInterface,
    K extends keyof S = keyof S,
    T = EntityType<S[K]>,
    A = ArgsType<S[K]>
>(
    prefix: string,
    stateKey: K
): [RequestActionsTuple<T, A>, Array<On<S>>, RequestStateInterface<T, A>] => {
    const actions = requestActions<T, A>(`${prefix}/${stateKey}`);

    const initialState: RequestStateInterface<T, A> = requestInitialState;

    return [actions, requestReducers<S, K, T, A>(actions, stateKey), initialState];
};
