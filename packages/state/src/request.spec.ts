import { reducer } from 'ts-action';

import {
    argsAction,
    failedAction,
    requestAction,
    successAction,
    testActions,
    testEntity,
    testEntityArgs,
    testInitialState,
    TestState,
} from './initial-spec';
import { requestReducers } from './request-reducers';

describe('itemRequest', () => {
    let myState: TestState;

    // Check TS to comply with ts-action interfaces
    reducer(testInitialState, ...requestReducers<TestState, 'myEntity'>(testActions, 'myEntity'));

    const [
        { reducer: requestReducer },
        { reducer: requestSuccessReducer },
        { reducer: requestFailedReducer },
        { reducer: requestArgsReducer },
    ] = requestReducers<TestState, 'myEntity'>(testActions, 'myEntity');

    beforeEach(() => (myState = testInitialState));

    it('should set loading state, clear error and should NOT clear previous data on request action', () => {
        myState = requestReducer(myState, requestAction(testEntityArgs));

        expect(myState.myEntity.data).toEqual(testInitialState.myEntity.data);
        expect(myState.myEntity.args).toEqual(testEntityArgs);
        expect(myState.myEntity.isLoading).toBeTruthy();
        expect(myState.myEntity.error).toBeUndefined();
    });

    it('should set data on request success action', () => {
        myState = requestSuccessReducer(myState, successAction(testEntity));

        expect(myState.myEntity.data).toEqual(testEntity);
        expect(myState.myEntity.isLoading).toBeFalsy();
        expect(myState.myEntity.error).toBeUndefined();
    });

    it('should set error, clear loading state and should NOT clear previous data on request failed action', () => {
        const error = 'some_error';
        myState = requestFailedReducer(myState, failedAction(error));

        expect(myState.myEntity.data).toEqual(testInitialState.myEntity.data);
        expect(myState.myEntity.isLoading).toBeFalsy();
        expect(myState.myEntity.error).toEqual(error);
    });

    it('should set args and should NOT change other data on request args action', () => {
        myState = requestArgsReducer(myState, argsAction(testEntityArgs));

        expect(myState.myEntity.data).toEqual(testInitialState.myEntity.data);
        expect(myState.myEntity.isLoading).toEqual(testInitialState.myEntity.isLoading);
        expect(myState.myEntity.error).toEqual(testInitialState.myEntity.error);
        expect(myState.myEntity.args).toEqual(testEntityArgs);
    });
});
