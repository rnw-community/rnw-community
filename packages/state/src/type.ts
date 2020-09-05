import { ActionCreator, Typed } from 'ts-action';

import { RequestStateInterface } from './request-state.interface';

// tslint:disable:no-any

export type TsAction<T = any> = Typed<{ payload: T }, string> | Typed<{ type: string }, string>;
export type TsActionCreator<T> = ActionCreator<string, (payload: T) => Typed<{ payload: T }, string>>;
export type TsActionCreatorWithoutPayload = ActionCreator<string, () => Typed<{}, string>>;

/** Get Entity type from item or list state */
export type EntityType<S> = S extends RequestStateInterface<infer T, any, any> ? T : never;

/** Get Args type from item or list state */
export type ArgsType<S> = S extends RequestStateInterface<any, infer A, any> ? A : never;
