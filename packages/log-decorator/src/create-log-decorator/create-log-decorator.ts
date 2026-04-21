import { createInterceptor } from '@rnw-community/decorators-core';

import { createLogMiddleware } from '../util/create-log-middleware/create-log-middleware';

import type { CreateLogOptionsInterface } from '../interface/create-log-options.interface';
import type { ErrorLogInputType } from '../type/error-log-input.type';
import type { PostLogInputType } from '../type/post-log-input.type';
import type { PreLogInputType } from '../type/pre-log-input.type';
import type { GetResultType } from '@rnw-community/decorators-core';
import type { AnyFn, MethodDecoratorType } from '@rnw-community/shared';

export const createLogDecorator =
    (options: CreateLogOptionsInterface) =>
    <K extends AnyFn, TResult extends GetResultType<ReturnType<K>>, TArgs extends Parameters<K>>(
        preLog?: PreLogInputType<TArgs>,
        postLog?: PostLogInputType<TArgs, TResult>,
        errorLog?: ErrorLogInputType<TArgs>
    ): MethodDecoratorType<K> =>
        createInterceptor<TArgs, TResult>({
            middlewares: [createLogMiddleware<TArgs, TResult>(options, preLog, postLog, errorLog)],
        }) as unknown as MethodDecoratorType<K>;
