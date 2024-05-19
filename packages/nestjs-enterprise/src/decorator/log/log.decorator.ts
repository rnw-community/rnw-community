import { Logger } from '@nestjs/common';

import { isDefined, isNotEmptyString } from '@rnw-community/shared';

import type { ErrorLogFunction } from './type/error-log-function.type';
import type { PostLogFunction } from './type/post-log-function.type';
import type { PreLogFunction } from './type/pre-log-function.type';
import type { Observable } from 'rxjs';

export type DecoratedMethodType<TResult, TArgs extends unknown[]> = (
    ...args: TArgs
) => Observable<TResult> | Promise<TResult> | TResult;

export type MethodDecoratorType<TResult, TArgs extends unknown[]> = (
    target: object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<DecoratedMethodType<TResult, TArgs>>
) => TypedPropertyDescriptor<DecoratedMethodType<TResult, TArgs>>;

export const Log =
    <TResult, TArgs extends unknown[] = any[]>(
        preLog: PreLogFunction<TArgs> | string,
        postLog?: PostLogFunction<TResult, TArgs> | string,
        errorLog?: ErrorLogFunction<TArgs> | string
    ): MethodDecoratorType<TResult, TArgs> =>
    (target, propertyKey, descriptor) => {
        const logContext = `${target.constructor.name}::${String(propertyKey)}`;
        const originalMethod = descriptor.value;

        // TODO: Promisify this? How to handle observable

        descriptor.value = async (...args: TArgs) => {
            try {
                const preText = isNotEmptyString(preLog) ? preLog : preLog(args[0], args[1], args[2], args[3], args[4]);

                Logger.log(preText, logContext);

                const result = await originalMethod?.apply(this, args);

                if (isDefined(postLog)) {
                    const postText = isNotEmptyString(postLog)
                        ? postLog
                        : postLog(result, args[0], args[1], args[2], args[3], args[4]);

                    Logger.debug(postText, logContext);
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
