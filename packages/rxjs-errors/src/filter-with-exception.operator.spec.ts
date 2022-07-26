import { expectTypeOf } from 'expect-type';
import { EMPTY, catchError, of } from 'rxjs';

import { getErrorMessage } from '@rnw-community/shared';

import { filterWithException } from './filter-with-exception.operator';
import { RxJSFilterError } from './rxjs-filter-error';

describe('filterWithException', () => {
    it('should pass the value forward if condition returns true', async () => {
        expect.assertions(1);

        await new Promise(resolve => {
            const wanted = 'A';

            of(wanted)
                .pipe(filterWithException(letter => letter === wanted, 'Error'))
                .subscribe(value => {
                    expect(value).toBe(wanted);
                    resolve(true);
                });
        });
    });
    it('should throw an error if condition returns false', async () => {
        expect.assertions(2);

        await new Promise(resolve => {
            const wantedErrorText = 'Error';

            of('A')
                .pipe(
                    filterWithException(() => false, wantedErrorText),
                    catchError((err: unknown) => {
                        expect(err instanceof RxJSFilterError).toBe(true);
                        expect(getErrorMessage(err)).toBe(wantedErrorText);

                        resolve(true);

                        return EMPTY;
                    })
                )
                .subscribe();
        });
    });
    it('should narrow down typescript types when type guard is passed in', async () => {
        expect.assertions(1);

        await new Promise(resolve => {
            const wanted: unknown = 'A';

            const typeGuard = (val: unknown): val is string => typeof val === 'string';
            of(wanted)
                .pipe(filterWithException(typeGuard, 'Error'))
                .subscribe(value => {
                    expectTypeOf(value).toBeString();
                    expect(value).toBe(wanted);

                    resolve(true);
                });
        });
    });
    it('should throw custom exception if provided a constructor fn', async () => {
        expect.assertions(2);

        await new Promise(resolve => {
            class CustomError extends Error {}

            const errorCreator = (msg: string): Error => new CustomError(msg);

            const wantedErrorText = 'Error';

            of('A')
                .pipe(
                    filterWithException(() => false, wantedErrorText, errorCreator),
                    catchError((err: unknown) => {
                        expect(err instanceof CustomError).toBe(true);
                        expect(getErrorMessage(err)).toBe(wantedErrorText);

                        resolve(true);

                        return EMPTY;
                    })
                )
                .subscribe();
        });
    });
});
