import { from, Observable } from 'rxjs';
import { catchError, concatMap, exhaustMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { Action } from 'ts-action';
import { ofType, toPayload } from 'ts-action-operators';

import { RequestActionsTuple } from '../request-actions';
import { StateInterface } from '../request-state.interface';
import { TsAction } from '../type';

// tslint:disable:no-any

export type SideEffectFn<I = any, A = {}, S = StateInterface> = (input: I, args: A, state: S) => TsAction[];
export type Service$Fn<T, A, S = StateInterface> = (args: A, state: S) => Observable<T>;

export const emptySideEffectFn: SideEffectFn = () => [];

export const requestEpic = <T, A, S = StateInterface>(
    operator: typeof switchMap | typeof concatMap | typeof exhaustMap,
    [requestAction, requestSuccessAction, requestFailedAction]: RequestActionsTuple<T, A>,
    service$: Service$Fn<T, A, S>,
    errorMessage: string,
    successSideEffectFn: SideEffectFn<T> = emptySideEffectFn,
    failedSideEffectFn: SideEffectFn = emptySideEffectFn
) => (action$: Observable<Action>, state$: Observable<S>) =>
    action$.pipe(
        ofType(requestAction),
        toPayload(),
        withLatestFrom(state$, (args, state) => ({ args, state })),
        operator(({ args, state }) =>
            service$(args, state).pipe(
                concatMap(result => [requestSuccessAction(result), ...successSideEffectFn(result, args, state)]),
                catchError(err => from([requestFailedAction(errorMessage), ...failedSideEffectFn(err, args, state)]))
            )
        )
    );
