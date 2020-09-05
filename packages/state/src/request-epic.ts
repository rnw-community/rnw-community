import { from, Observable } from 'rxjs';
import { catchError, concatMap, exhaustMap, switchMap, withLatestFrom } from 'rxjs/operators';
import { Action } from 'ts-action';
import { ofType, toPayload } from 'ts-action-operators';

import { RequestActionsTuple } from './request-actions';
import { StateInterface } from './request-state.interface';
import { TsAction } from './type';

// tslint:disable:no-any

type SideEffectFn<I = any, A = {}, S = StateInterface> = (input: I, args: A, state: S) => TsAction[];
type Service$Fn<T, A, S = StateInterface> = (args: A, state: S) => Observable<T>;

const emptySideEffectFn: SideEffectFn = () => [];

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

export const switchEpic = <T, A, S = StateInterface>(
    requestActions: RequestActionsTuple<T, A>,
    service$: Service$Fn<T, A, S>,
    errorMessage: string,
    successSideEffectFn: SideEffectFn<T> = emptySideEffectFn,
    failedSideEffectFn: SideEffectFn = emptySideEffectFn
) => requestEpic(switchMap, requestActions, service$, errorMessage, successSideEffectFn, failedSideEffectFn);

export const concatEpic = <T, A, S = StateInterface>(
    requestActions: RequestActionsTuple<T, A>,
    service$: Service$Fn<T, A, S>,
    errorMessage: string,
    successSideEffectFn: SideEffectFn<T> = emptySideEffectFn,
    failedSideEffectFn: SideEffectFn = emptySideEffectFn
) => requestEpic(concatMap, requestActions, service$, errorMessage, successSideEffectFn, failedSideEffectFn);

export const exhaustEpic = <T, A, S = StateInterface>(
    requestActions: RequestActionsTuple<T, A>,
    service$: Service$Fn<T, A, S>,
    errorMessage: string,
    successSideEffectFn: SideEffectFn<T> = emptySideEffectFn,
    failedSideEffectFn: SideEffectFn = emptySideEffectFn
) => requestEpic(exhaustMap, requestActions, service$, errorMessage, successSideEffectFn, failedSideEffectFn);

export const simpleSwitchEpic = <T, A, S = StateInterface>(
    requestActions: RequestActionsTuple<T, A>,
    service$: Service$Fn<T, A, S>,
    errorMessage: string,
    ...successSideEffectActions: TsAction[]
) => switchEpic(requestActions, service$, errorMessage, () => [...successSideEffectActions]);

export const simpleConcatEpic = <T, A, S = StateInterface>(
    requestActions: RequestActionsTuple<T, A>,
    service$: Service$Fn<T, A, S>,
    errorMessage: string,
    ...successSideEffectActions: TsAction[]
) => concatEpic(requestActions, service$, errorMessage, () => [...successSideEffectActions]);

export const simpleExhaustEpic = <T, A, S = StateInterface>(
    requestActions: RequestActionsTuple<T, A>,
    service$: Service$Fn<T, A, S>,
    errorMessage: string,
    ...successSideEffectActions: TsAction[]
) => exhaustEpic(requestActions, service$, errorMessage, () => [...successSideEffectActions]);
