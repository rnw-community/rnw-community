import { on, On } from 'ts-action';

import { RequestActionsTuple } from './request-actions';
import { StateInterface } from './request-state.interface';
import { ArgsType, EntityType } from './type';

// TODO: Automatic type for stateKey generic
// TODO: Do we need to override data?
// TODO: In some use cases we need to accumulate data and reset it based on pagination for infinite lists,
// should we add this behavior? For example: `infiniteListReducers` with modified successAction data handling?

/**
 * Create generic reducers for request state
 *
 * @param {RequestActionsTuple} Item request actions tuple
 * @param {string} stateKey State key
 * @param {object} overrideData Initial object for overriding state key
 */
export const requestReducers = <S extends StateInterface, K extends keyof S, T = EntityType<S[K]>, A = ArgsType<S[K]>>(
    [request, requestSuccess, requestFailed, requestArgs]: RequestActionsTuple<T, A>,
    stateKey: K,
    overrideData?: Partial<S>
): Array<On<S>> => [
    on(request, (state, { payload: args }) => ({
        ...state,
        [stateKey]: {
            ...state[stateKey],
            ...overrideData,
            args,
            isLoading: true,
            error: undefined,
        },
    })),
    on(requestSuccess, (state, { payload: data }) => ({
        ...state,
        [stateKey]: {
            ...state[stateKey],
            ...overrideData,
            isLoading: false,
            error: undefined,
            data,
        },
    })),
    on(requestFailed, (state, { payload: error }) => ({
        ...state,
        [stateKey]: {
            ...state[stateKey],
            ...overrideData,
            isLoading: false,
            error,
        },
    })),
    on(requestArgs, (state, { payload: args }) => ({
        ...state,
        [stateKey]: {
            ...state[stateKey],
            args,
        },
    })),
];
