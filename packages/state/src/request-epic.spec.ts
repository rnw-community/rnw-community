import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { switchMap, toArray } from 'rxjs/operators';
import { action, Action, payload } from 'ts-action';

import {
    failedAction,
    requestAction,
    successAction,
    testActions,
    TestEntity,
    testEntity,
    TestEntityArgs,
    testEntityArgs,
    testErrorMessage,
    testInitialState,
    TestState,
} from './initial.spec';
import {
    concatEpic,
    exhaustEpic,
    requestEpic,
    simpleConcatEpic,
    simpleExhaustEpic,
    simpleSwitchEpic,
    switchEpic,
} from './request-epic';

describe('requestEpic', () => {
    const customSuccessAction = action('customAction', payload<TestEntity>());
    const customErrorAction = action('customAction', payload<{ error: string; args: TestEntityArgs }>());
    const state$ = new BehaviorSubject<TestState>(testInitialState);
    const successSideEffectFn = jest.fn();
    const failedSideEffectFn = jest.fn();
    const service$ = jest.fn();

    let action$ = new Subject<Action>();

    const serviceCallTest = (epic: ReturnType<typeof requestEpic>) => () => {
        epic(action$, state$).subscribe();

        action$.next(requestAction(testEntityArgs));

        expect(service$).toBeCalledWith(testEntityArgs, testInitialState);
    };

    beforeEach(() => {
        service$.mockReset();
        action$ = new Subject<Action>();
    });

    it('should call service$ function with args and state', () => {
        serviceCallTest(requestEpic(switchMap, testActions, service$, testErrorMessage));
    });

    it('should return request success action if no errors occurred', done => {
        const epic = requestEpic(switchMap, testActions, service$, testErrorMessage);

        service$.mockImplementation(() => of(testEntity));

        epic(action$, state$).subscribe(next => {
            expect(next).toEqual(successAction(testEntity));
            done();
        });

        action$.next(requestAction(testEntityArgs));
        action$.complete();
    });

    it('should call successSideEffectFn with success result if no errors occurred', done => {
        const epic = requestEpic(switchMap, testActions, service$, testErrorMessage, successSideEffectFn);

        service$.mockImplementation(() => of(testEntity));
        successSideEffectFn.mockImplementation(result => [customSuccessAction(result)]);

        epic(action$, state$)
            .pipe(toArray())
            .subscribe(next => {
                expect(next).toEqual([successAction(testEntity), customSuccessAction(testEntity)]);
                done();
            });

        action$.next(requestAction(testEntityArgs));
        action$.complete();
    });

    it('should return request failed action with error message if error has occurred', done => {
        const epic = requestEpic(switchMap, testActions, service$, testErrorMessage);

        service$.mockImplementation(() => throwError('test error'));

        epic(action$, state$).subscribe(next => {
            expect(next).toEqual(failedAction(testErrorMessage));
            done();
        });

        action$.next(requestAction(testEntityArgs));
        action$.complete();
    });

    it('should call failedSideEffectFn with error and request args if error has occurred', done => {
        const epic = requestEpic(
            switchMap,
            testActions,
            service$,
            testErrorMessage,
            successSideEffectFn,
            failedSideEffectFn
        );

        const testError = 'testError';
        service$.mockImplementation(() => throwError(testError));
        failedSideEffectFn.mockImplementation((error, args) => [customErrorAction({ error, args })]);

        epic(action$, state$)
            .pipe(toArray())
            .subscribe(next => {
                expect(next).toEqual([
                    failedAction(testErrorMessage),
                    customErrorAction({ error: testError, args: testEntityArgs }),
                ]);
                done();
            });

        action$.next(requestAction(testEntityArgs));
        action$.complete();
    });

    describe('switchEpic', () => {
        it('should work through switchMap operator', () => {
            serviceCallTest(switchEpic(testActions, service$, testErrorMessage));
        });

        it('simpleSwitchEpic should work with success actions array', () => {
            serviceCallTest(simpleSwitchEpic(testActions, service$, testErrorMessage));
        });
    });

    describe('concatEpic', () => {
        it('should work through concatMap operator', () => {
            serviceCallTest(concatEpic(testActions, service$, testErrorMessage));
        });

        it('simpleConcatEpic should work with success actions array', () => {
            serviceCallTest(simpleConcatEpic(testActions, service$, testErrorMessage));
        });
    });

    describe('exhaustEpic', () => {
        it('should work through exhaustMap operator', () => {
            serviceCallTest(exhaustEpic(testActions, service$, testErrorMessage));
        });

        it('simpleExhaustEpic should work with success actions array', () => {
            serviceCallTest(simpleExhaustEpic(testActions, service$, testErrorMessage));
        });
    });
});
