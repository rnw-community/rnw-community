import { describe, expect, it } from '@jest/globals';

import { LockBusyError } from '../../error/lock-busy-error/lock-busy.error';
import { createInMemoryLockStore } from '../../store/create-in-memory-lock-store/create-in-memory-lock-store';
import { createExclusiveLock } from '../create-exclusive-lock/create-exclusive-lock';
import { createLegacyExclusiveLock } from '../create-legacy-exclusive-lock/create-legacy-exclusive-lock';
import { createLegacySequentialLock } from '../create-legacy-sequential-lock/create-legacy-sequential-lock';
import { createSequentialLock } from '../create-sequential-lock/create-sequential-lock';

describe('multiple factories on same class do not conflict', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const makeCtx = (name: string): ClassMethodDecoratorContext<any, any> =>
        ({
            kind: 'method',
            name,
            static: false,
            private: false,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            access: { get: (): any => undefined },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as unknown as ClassMethodDecoratorContext<any, any>;

    it('stage-3 sequential and exclusive with separate stores do not interfere', async () => {
        const storeA = createInMemoryLockStore();
        const storeB = createInMemoryLockStore();

        const SeqLock = createSequentialLock({ store: storeA });
        const ExLock = createExclusiveLock({ store: storeB });

        const seqDecorator = SeqLock('shared-key');
        const exDecorator = ExLock('shared-key');

        const seqMethod = async function (this: unknown): Promise<string> {
            return 'seq';
        };
        const exMethod = async function (this: unknown): Promise<string> {
            return 'ex';
        };

        const seqWrapped = seqDecorator(
            seqMethod as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx('seq')
        );
        const exWrapped = exDecorator(
            exMethod as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx('ex')
        );

        const svc = {};

        const [r1, r2] = await Promise.all([seqWrapped.call(svc), exWrapped.call(svc)]);
        expect(r1).toBe('seq');
        expect(r2).toBe('ex');
    });

    it('two exclusive factories with same store on same key do conflict', async () => {
        const store = createInMemoryLockStore();
        const ExLock1 = createExclusiveLock({ store });
        const ExLock2 = createExclusiveLock({ store });

        let releaseHeld!: () => void;
        const holdLock = new Promise<void>((resolve) => {
            releaseHeld = resolve;
        });

        const method1 = async function (this: unknown): Promise<void> {
            await holdLock;
        };

        const method2 = async function (this: unknown): Promise<void> {
            await Promise.resolve();
        };

        const wrapped1 = ExLock1('same-key')(
            method1 as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx('m1')
        );
        const wrapped2 = ExLock2('same-key')(
            method2 as (this: unknown, ...args: readonly unknown[]) => unknown,
             
            makeCtx('m2')
        );

        const svc = {};

        const p1 = wrapped1.call(svc);
        await expect(wrapped2.call(svc)).rejects.toBeInstanceOf(LockBusyError);

        releaseHeld();
        await p1;
    });

    it('legacy sequential and legacy exclusive with separate stores work independently', async () => {
        const storeA = createInMemoryLockStore();
        const storeB = createInMemoryLockStore();

        const LSeqLock = createLegacySequentialLock({ store: storeA });
        const LExLock = createLegacyExclusiveLock({ store: storeB });

        const makeDescriptor = (retVal: string): PropertyDescriptor => ({
            async value (this: unknown): Promise<string> {
                return retVal;
            },
            writable: true,
            configurable: true,
        });

        class Svc {
            seq(): Promise<string> {
                return Promise.resolve('seq');
            }
            ex(): Promise<string> {
                return Promise.resolve('ex');
            }
        }

        const proto = Svc.prototype as object;
        const rSeq = LSeqLock<readonly []>('multi-key')(proto, 'seq', makeDescriptor('seq'));
        const rEx = LExLock<readonly []>('multi-key')(proto, 'ex', makeDescriptor('ex'));

        const svc = new Svc();
        const [r1, r2] = await Promise.all([
            (rSeq.value as () => Promise<string>).call(svc),
            (rEx.value as () => Promise<string>).call(svc),
        ]);

        expect(r1).toBe('seq');
        expect(r2).toBe('ex');
    });
});
