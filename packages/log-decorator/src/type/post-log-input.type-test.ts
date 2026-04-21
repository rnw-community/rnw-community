/* istanbul ignore file -- type-level sentinel, no runtime behavior */
import { createLogDecorator } from '../create-log-decorator/create-log-decorator';

import type { ErrorLogInputType } from './error-log-input.type';
import type { PostLogInputType } from './post-log-input.type';
import type { LogTransportInterface } from '../interface/log-transport.interface';

const noopTransport: LogTransportInterface = {
    log: () => void 0,
    debug: () => void 0,
    error: () => void 0,
};

const Log = createLogDecorator({ transport: noopTransport });

class InferenceSentinel {
    @Log(
        (id, qty) => `${id}:${qty.toFixed(0)}`,
        (result, durationMs, id, qty) => {
            const resultSentinel: string = result;
            const durationSentinel: number = durationMs;
            const idSentinel: string = id;
            const qtySentinel: number = qty;

            return `${resultSentinel}-${durationSentinel.toString()}-${idSentinel}-${qtySentinel.toString()}`;
        },
        (error, durationMs, id, qty) => {
            const errorSentinel: unknown = error;
            const durationSentinel: number = durationMs;
            const idSentinel: string = id;
            const qtySentinel: number = qty;

            return `${String(errorSentinel)}-${durationSentinel.toString()}-${idSentinel}-${qtySentinel.toString()}`;
        }
    )
    sync(id: string, qty: number): string {
        return `${id}-${qty.toString()}`;
    }
}

const assertCompatiblePost: PostLogInputType<readonly [number], boolean> = (result, durationMs, flag) => {
    const resultSentinel: boolean = result;
    const durationSentinel: number = durationMs;
    const flagSentinel: number = flag;

    return `${resultSentinel.toString()}-${durationSentinel.toString()}-${flagSentinel.toString()}`;
};

const assertCompatibleError: ErrorLogInputType<readonly [string, number]> = (error, durationMs, name, count) => {
    const errorSentinel: unknown = error;
    const durationSentinel: number = durationMs;
    const nameSentinel: string = name;
    const countSentinel: number = count;

    return `${String(errorSentinel)}-${durationSentinel.toString()}-${nameSentinel}-${countSentinel.toString()}`;
};

export { InferenceSentinel, assertCompatiblePost, assertCompatibleError };
