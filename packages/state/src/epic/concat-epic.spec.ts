import { testActions, testErrorMessage } from '../initial-spec';
import { concatEpic, simpleConcatEpic } from './concat-epic';
import { resetMocks, service$, serviceCallTest } from './request-epic.spec';

describe('concatEpic', () => {
    beforeEach(resetMocks);

    it('should work through concatMap operator', () => {
        serviceCallTest(concatEpic(testActions, service$, testErrorMessage));
    });

    it('simpleConcatEpic should work with success actions array', () => {
        serviceCallTest(simpleConcatEpic(testActions, service$, testErrorMessage));
    });
});
