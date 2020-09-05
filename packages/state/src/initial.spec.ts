import { requestActions } from './request-actions';
import { requestInitialState, RequestStateInterface } from './request-state.interface';

export interface TestEntity {
    name: string;
}

export interface TestEntityArgs {
    id: string;
}

export interface TestState {
    myEntity: RequestStateInterface<TestEntity, TestEntityArgs>;
}

export const testEntity: TestEntity = { name: 'testName' };
export const testEntityArgs: TestEntityArgs = { id: 'testId' };
export const testInitialState: TestState = { myEntity: requestInitialState };
export const testActions = requestActions<TestEntity, TestEntityArgs>('MyEntity');
export const [requestAction, successAction, failedAction, argsAction] = testActions;
export const testErrorMessage = 'testErrorMessage';
