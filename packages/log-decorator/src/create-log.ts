import { createInterceptor } from '@rnw-community/decorators-core';

import type { CreateLogOptionsInterface } from './create-log-options.interface';
import { createLogInterceptor } from './create-log-interceptor';
import type { ErrorLogInputType, PostLogInputType, PreLogInputType } from './log-input.type';

export const createLog =
    (options: CreateLogOptionsInterface) =>
    <TArgs extends readonly unknown[], TResult>(
        preLog?: PreLogInputType<TArgs>,
        postLog?: PostLogInputType<TArgs, TResult>,
        errorLog?: ErrorLogInputType<TArgs>
    ) => {
        if (options.devGate !== undefined && !options.devGate()) {
            return <TOriginal extends (this: unknown, ...args: TArgs) => TResult>(
                originalMethod: TOriginal,
                _context: ClassMethodDecoratorContext<unknown, TOriginal>
            ): TOriginal => originalMethod;
        }

        return createInterceptor<TArgs, TResult>({
            interceptor: createLogInterceptor<TArgs, TResult>(options, preLog, postLog, errorLog),
            strategies: options.strategies,
        });
    };
