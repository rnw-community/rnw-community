import { switchMap } from 'rxjs/operators';

import { RequestActionsTuple } from '../request-actions';
import { StateInterface } from '../request-state.interface';
import { TsAction } from '../type';
import { emptySideEffectFn, requestEpic, Service$Fn, SideEffectFn } from './request-epic';

export const switchEpic = <T, A, S = StateInterface>(
    requestActions: RequestActionsTuple<T, A>,
    service$: Service$Fn<T, A, S>,
    errorMessage: string,
    successSideEffectFn: SideEffectFn<T> = emptySideEffectFn,
    failedSideEffectFn: SideEffectFn = emptySideEffectFn
) => requestEpic(switchMap, requestActions, service$, errorMessage, successSideEffectFn, failedSideEffectFn);

export const simpleSwitchEpic = <T, A, S = StateInterface>(
    requestActions: RequestActionsTuple<T, A>,
    service$: Service$Fn<T, A, S>,
    errorMessage: string,
    ...successSideEffectActions: TsAction[]
) => switchEpic(requestActions, service$, errorMessage, () => [...successSideEffectActions]);
