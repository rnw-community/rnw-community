import { isDefined } from '@rnw-community/shared';
import { NEVER, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Action, ActionType } from 'ts-action';
import { ofType } from 'ts-action-operators';

import { TsActionCreator, TsActionCreatorWithoutPayload } from '../type';

const isSameAction = <A extends Action & { payload?: P }, P>(
    sourceAction: A,
    compareAction: A
): sourceAction is A & { payload: P } => isDefined(sourceAction.payload) && compareAction.type === sourceAction.type;

/**
 * Generic util for creating redux-observable epic which works with Observable subscriptions, for example Apollo subscription,
 * and handling correct subscription creation, closing and errors.
 *
 * @param subscriptionFn  Handler that returns Observable of subscription events
 * @param createActionFn Redux action creator function for creating new subscription
 * @param closeActionFn Redux action creator function for closing existing subscription
 * @param failedActionCreator Redux action creator function for subscription errors
 *
 * @return redux-observable epic
 */
// tslint:disable:rxjs-no-unsafe-switchmap
export const subscriptionEpic = <P, R>(
    subscriptionFn: (payload: P) => Observable<R>,
    createActionFn: TsActionCreator<P>,
    closeActionFn: TsActionCreatorWithoutPayload,
    failedActionCreator: TsActionCreator<string>
) => (actions$: Observable<ActionType<TsActionCreator<P>> | ActionType<TsActionCreatorWithoutPayload>>) =>
    actions$.pipe(
        ofType(createActionFn, closeActionFn),
        switchMap(myAction =>
            isSameAction(myAction, createActionFn)
                ? subscriptionFn(myAction.payload).pipe(catchError(() => of(failedActionCreator('Subscription error'))))
                : NEVER
        )
    );
