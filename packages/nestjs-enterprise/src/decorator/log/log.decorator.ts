import { Logger } from '@nestjs/common';
import { type Observable, from, isObservable, of } from 'rxjs';

import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import type { ErrorLogFunction } from './type/error-log-function.type';
import type { PostLogFunction } from './type/post-log-function.type';
import type { PreLogFunction } from './type/pre-log-function.type';
import type { MethodDecoratorType } from '../../type/method-decorator.type';

type GetResultType<T> = T extends Promise<infer U> ? U : T extends Observable<infer U> ? U : T;

export const Log =
    <TResult, TArgs extends unknown[] = unknown[]>(
        preLog: PreLogFunction<TArgs> | string,
        postLog?: PostLogFunction<GetResultType<TResult>, TArgs> | string,
        errorLog?: ErrorLogFunction<TArgs> | string
    ): MethodDecoratorType<TResult, TArgs> =>
    (target, propertyKey, descriptor) => {
        const logContext = `${target.constructor.name}::${String(propertyKey)}`;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const originalMethod = descriptor.value!;

        // eslint-disable-next-line max-statements,func-names
        descriptor.value = function (...args: TArgs) {
            try {
                if (isNotEmptyString(preLog)) {
                    Logger.log(preLog, logContext);
                } else {
                    Logger.log(preLog(args[0], args[1], args[2], args[3], args[4]), logContext);
                }

                const result = originalMethod.apply(this, args);

                let observableResult = result as Observable<TResult>;
                if (result instanceof Promise) {
                    observableResult = from(result);
                } else if (!isObservable(result)) {
                    observableResult = of(result);
                }

                if (isDefined(postLog)) {
                    observableResult.subscribe(res => {
                        if (isNotEmptyString(postLog)) {
                            Logger.debug(postLog, logContext);
                        } else {
                            Logger.debug(
                                postLog(res as GetResultType<TResult>, args[0], args[1], args[2], args[3], args[4]),
                                logContext
                            );
                        }
                    });
                }

                return result;
            } catch (error) {
                if (isDefined(errorLog)) {
                    if (isNotEmptyString(errorLog)) {
                        Logger.error(errorLog, logContext);
                    } else {
                        Logger.error(errorLog(error, args[0], args[1], args[2], args[3], args[4]), logContext);
                    }
                }

                throw error;
            }
        };

        return descriptor;
    };
