import { describe, expect, it, jest } from '@jest/globals';
import { Observable, Subject, lastValueFrom, of, throwError } from 'rxjs';

import { createInterceptor } from './create-interceptor';

import type { InterceptorMiddleware } from '../../interface/interceptor-middleware.interface';

describe('createInterceptor — pure middleware engine', () => {
    it('invokes the method with no middlewares and returns the sync value', () => {
        expect.hasAssertions();
        const Dec = createInterceptor({ middlewares: [] });

        class Service {
            @Dec
            add(a: number, b: number): number {
                return a + b;
            }
        }
        expect(new Service().add(2, 3)).toBe(5);
    });

    it('runs middlewares in outer-to-inner order around invoke', () => {
        expect.hasAssertions();
        const log: string[] = [];
        const mw = (name: string): InterceptorMiddleware<readonly unknown[], string> => (_ctx, next) => {
            log.push(`${name}:before`);
            const result = next();
            log.push(`${name}:after`);

            return result;
        };
        const Dec = createInterceptor({ middlewares: [mw('A'), mw('B'), mw('C')] });

        class Service {
            @Dec
            run(): string {
                log.push('method');

                return 'ok';
            }
        }
        expect(new Service().run()).toBe('ok');
        expect(log).toEqual(['A:before', 'B:before', 'C:before', 'method', 'C:after', 'B:after', 'A:after']);
    });

    it('passes execution context with className, methodName, args, logContext', () => {
        expect.hasAssertions();
        const seen: unknown[] = [];
        const mw: InterceptorMiddleware<readonly unknown[], number> = (ctx, next) => {
            seen.push(ctx);

            return next();
        };
        const Dec = createInterceptor({ middlewares: [mw] });

        class OrderService {
            @Dec
            place(_id: string, qty: number): number {
                return qty;
            }
        }
        new OrderService().place('sku-1', 3);
        expect(seen[0]).toMatchObject({
            className: 'OrderService',
            methodName: 'place',
            args: ['sku-1', 3],
            logContext: 'OrderService::place',
        });
    });

    it('forwards a Promise return shape when the innermost middleware awaits', async () => {
        expect.hasAssertions();
        const mw: InterceptorMiddleware<readonly unknown[], Promise<string>> = async (_ctx, next) => {
            const value = await next();

            return `wrapped-${value}`;
        };
        const Dec = createInterceptor({ middlewares: [mw] });

        class Service {
            @Dec
            async run(): Promise<string> {
                return 'raw';
            }
        }
        expect(await new Service().run()).toBe('wrapped-raw');
    });

    it('forwards an Observable return shape when middleware returns an Observable', async () => {
        expect.hasAssertions();
        const mw: InterceptorMiddleware<readonly unknown[], Observable<number>> = (_ctx, next) => next();
        const Dec = createInterceptor({ middlewares: [mw] });

        class Service {
            @Dec
            stream(): Observable<number> {
                return of(10);
            }
        }
        expect(await lastValueFrom(new Service().stream())).toBe(10);
    });

    it('a middleware can short-circuit without calling next (e.g. resource failure)', async () => {
        expect.hasAssertions();
        const methodSpy = jest.fn();
        const mw: InterceptorMiddleware<readonly unknown[], Promise<never>> = async () => {
            throw new Error('short-circuit');
        };
        const Dec = createInterceptor({ middlewares: [mw] });

        class Service {
            @Dec
            async run(): Promise<void> {
                methodSpy();
            }
        }
        await expect(new Service().run()).rejects.toThrow('short-circuit');
        expect(methodSpy).not.toHaveBeenCalled();
    });

    it('releases resource via closure in the middleware (setup/invoke/teardown pattern)', async () => {
        expect.hasAssertions();
        const release = jest.fn();
        const mw: InterceptorMiddleware<readonly unknown[], Promise<string>> = async (_ctx, next) => {
            const handle = { release };
            try {
                return await next();
            } finally {
                handle.release();
            }
        };
        const Dec = createInterceptor({ middlewares: [mw] });

        class Service {
            @Dec
            async run(): Promise<string> {
                return 'done';
            }
        }
        expect(await new Service().run()).toBe('done');
        expect(release).toHaveBeenCalledTimes(1);
    });

    it('releases resource even when the method throws', async () => {
        expect.hasAssertions();
        const release = jest.fn();
        const boom = new Error('method-boom');
        const mw: InterceptorMiddleware<readonly unknown[], Promise<never>> = async (_ctx, next) => {
            try {
                return await next();
            } finally {
                release();
            }
        };
        const Dec = createInterceptor({ middlewares: [mw] });

        class Service {
            @Dec
            async run(): Promise<void> {
                throw boom;
            }
        }
        await expect(new Service().run()).rejects.toBe(boom);
        expect(release).toHaveBeenCalledTimes(1);
    });

    it('returns the descriptor unchanged when applied to a non-function descriptor', () => {
        expect.hasAssertions();
        const Dec = createInterceptor({ middlewares: [] });
        const descriptor = { value: 42, writable: true, enumerable: false, configurable: true };
        const result = (Dec as unknown as (t: object, p: string, d: typeof descriptor) => typeof descriptor)(
            {},
            'notAMethod',
            descriptor
        );
        expect(result).toBe(descriptor);
    });

    it('Observable middleware: releases on unsubscribe via inner unsubscribe hook', async () => {
        expect.hasAssertions();
        const release = jest.fn();
        const source = new Subject<number>();
        const mw: InterceptorMiddleware<readonly unknown[], Observable<number>> = (_ctx, next) =>
            new Observable<number>((sub) => {
                const inner$ = next();
                const subscription = inner$.subscribe({
                    next: (v) => void sub.next(v),
                    error: (e: unknown) => void sub.error(e),
                    complete: () => void sub.complete(),
                });

                return () => {
                    subscription.unsubscribe();
                    release();
                };
            });
        const Dec = createInterceptor({ middlewares: [mw] });

        class Service {
            @Dec
            stream(): Observable<number> {
                return source;
            }
        }
        const subscription = new Service().stream().subscribe();
        source.next(1);
        subscription.unsubscribe();
        await Promise.resolve();
        expect(release).toHaveBeenCalledTimes(1);
    });

    it('propagates Observable errors through the chain', async () => {
        expect.hasAssertions();
        const mw: InterceptorMiddleware<readonly unknown[], Observable<number>> = (_ctx, next) => next();
        const Dec = createInterceptor({ middlewares: [mw] });

        class Service {
            @Dec
            stream(): Observable<number> {
                return throwError(() => new Error('stream-boom'));
            }
        }
        await expect(lastValueFrom(new Service().stream())).rejects.toThrow('stream-boom');
    });
});
