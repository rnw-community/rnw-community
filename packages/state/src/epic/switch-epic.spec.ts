import { testActions, testErrorMessage } from '../initial-spec';
import { resetMocks, service$, serviceCallTest } from './request-epic.spec';
import { simpleSwitchEpic, switchEpic } from './switch-epic';

describe('switchEpic', () => {
    beforeEach(resetMocks);

    it('should work through switchMap operator', () => {
        serviceCallTest(switchEpic(testActions, service$, testErrorMessage));
    });

    it('simpleSwitchEpic should work with success actions array', () => {
        serviceCallTest(simpleSwitchEpic(testActions, service$, testErrorMessage));
    });
});
