import { of, throwError } from 'rxjs';
import { action, payload } from 'ts-action';

import { action$, resetMocks } from './request-epic.spec';
import { subscriptionEpic } from './subscription-epic';

describe('subscriptionEpic', () => {
    const subscriptionAction = action('Subscription action');
    const createAction = action('Create', payload<string>());
    const errorAction = action('Error', payload<string>());
    const closeAction = action('Clos');

    const subscriptionFn = jest.fn().mockImplementation((_payload: string) => of(subscriptionAction));

    beforeEach(resetMocks);

    it('should subscribe to subscriptionFn on create action, passing payload there', done => {
        const createActionPayload = 'create-data';
        const epic = subscriptionEpic(subscriptionFn, createAction, closeAction, errorAction);

        epic(action$).subscribe(next => {
            expect(subscriptionFn).toBeCalledWith(createActionPayload);
            expect(next).toEqual(subscriptionAction);
            done();
        });

        action$.next(createAction(createActionPayload));
        action$.complete();
    });

    it('should complete observable on close action', done => {
        const dummyAction = action('dummy');
        const epic = subscriptionEpic(subscriptionFn, createAction, closeAction, errorAction);

        // Tests that after closeAction we do not receive dummyAction and only subscriptionAction after renewal
        epic(action$).subscribe(next => {
            expect(next).toEqual(subscriptionAction);
            done();
        });

        action$.next(closeAction());
        action$.next(dummyAction());
        action$.next(createAction(''));
        action$.complete();
    });

    it('should call error action on subscription error', done => {
        const subscriptionWithErrorFn = jest.fn().mockImplementation((_payload: string) => throwError(''));
        const epic = subscriptionEpic(subscriptionWithErrorFn, createAction, closeAction, errorAction);

        epic(action$).subscribe(error => {
            expect(error).toEqual(errorAction('Subscription error'));
            done();
        });

        action$.next(createAction(''));
        action$.complete();
    });
});
