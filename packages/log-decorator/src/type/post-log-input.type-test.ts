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
            const r: string = result;
            const d: number = durationMs;
            const i: string = id;
            const q: number = qty;

            return `${r}-${d.toString()}-${i}-${q.toString()}`;
        },
        (error, durationMs, id, qty) => {
            const e: unknown = error;
            const d: number = durationMs;
            const i: string = id;
            const q: number = qty;

            return `${String(e)}-${d.toString()}-${i}-${q.toString()}`;
        }
    )
    sync(id: string, qty: number): string {
        return `${id}-${qty.toString()}`;
    }
}

const assertCompatiblePost: PostLogInputType<readonly [number], boolean> = (result, durationMs, flag) => {
    const r: boolean = result;
    const d: number = durationMs;
    const f: number = flag;

    return `${r.toString()}-${d.toString()}-${f.toString()}`;
};

const assertCompatibleError: ErrorLogInputType<readonly [string, number]> = (error, durationMs, name, count) => {
    const e: unknown = error;
    const d: number = durationMs;
    const n: string = name;
    const c: number = count;

    return `${String(e)}-${d.toString()}-${n}-${c.toString()}`;
};

export { InferenceSentinel, assertCompatiblePost, assertCompatibleError };
