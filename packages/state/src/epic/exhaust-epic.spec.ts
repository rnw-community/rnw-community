import { testActions, testErrorMessage } from '../initial-spec';
import { exhaustEpic, simpleExhaustEpic } from './exhaust-epic';
import { resetMocks, service$, serviceCallTest } from './request-epic.spec';

describe('exhaustEpic', () => {
    beforeEach(resetMocks);

    it('should work through exhaustMap operator', () => {
        serviceCallTest(exhaustEpic(testActions, service$, testErrorMessage));
    });

    it('simpleExhaustEpic should work with success actions array', () => {
        serviceCallTest(simpleExhaustEpic(testActions, service$, testErrorMessage));
    });
});
