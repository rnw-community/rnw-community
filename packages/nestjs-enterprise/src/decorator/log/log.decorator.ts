import { Logger } from '@nestjs/common';
import { from, isObservable, of } from 'rxjs';

import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import type { ErrorLogFunction } from './type/error-log-function.type';
import type { MethodDecoratorType } from './type/method-decorator.type';
import type { PostLogFunction } from './type/post-log-function.type';
import type { PreLogFunction } from './type/pre-log-function.type';

export const Log =
    <TResult, TArgs extends unknown[] = unknown[]>(
        preLog: PreLogFunction<TArgs> | string,
        postLog?: PostLogFunction<TResult, TArgs> | string,
        errorLog?: ErrorLogFunction<TArgs> | string
    ): MethodDecoratorType<TResult, TArgs> =>
    (target, propertyKey, descriptor) => {
        const logContext = `${target.constructor.name}::${String(propertyKey)}`;
        const originalMethod = descriptor.value;

        if (!isDefined(originalMethod)) {
            throw new Error('Cannot apply @Log decorator to a method that does not exist.');
        }

        // eslint-disable-next-line max-statements
        descriptor.value = (...args: TArgs) => {
            try {
                const preText = isNotEmptyString(preLog) ? preLog : preLog(args[0], args[1], args[2], args[3], args[4]);

                Logger.log(preText, logContext);

                const result = originalMethod.apply(target, args);

                let observableResult = result;
                if (isObservable(result)) {
                    observableResult = result;
                } else if (result instanceof Promise) {
                    observableResult = from(result);
                } else {
                    observableResult = of(result);
                }

                if (isDefined(postLog)) {
                    observableResult.subscribe(res => {
                        const postText = isNotEmptyString(postLog)
                            ? postLog
                            : postLog(res, args[0], args[1], args[2], args[3], args[4]);

                        Logger.debug(postText, logContext);
                    });
                }

                return result as TResult;
            } catch (error) {
                if (isDefined(errorLog)) {
                    const errorText = isNotEmptyString(errorLog)
                        ? errorLog
                        : errorLog(error, args[0], args[1], args[2], args[3], args[4]);

                    Logger.error(errorText, logContext);
                }

                throw error;
            }
        };

        return descriptor;
    };
