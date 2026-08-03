# @rnw-community/decorators-core

Framework-agnostic interceptor primitive: wraps a decorated method's descriptor so every invocation is routed through one consumer-supplied middleware hook.

## Package Commands

```bash
yarn test && yarn test:coverage && yarn build && yarn ts && yarn lint:fix
```

## Architecture

```text
src/
  interface/
    execution-context.interface.ts        — ExecutionContextInterface<TArgs>: { className, methodName, args, logContext }
    interceptor-middleware.interface.ts    — InterceptorMiddleware<TArgs, TResult> = (context, next: () => TResult) => TResult
    create-interceptor-options.interface.ts — CreateInterceptorOptionsInterface<TArgs, TResult>: { middleware }
  engine/
    build-context/       — buildContext(self, fallbackClassName, methodName, args) + spec
    create-interceptor/  — createInterceptor(options) + spec
  util/
    resolve-fallback-class-name/ — resolveFallbackClassName(target) + spec
  index.ts
```

Public export surface (`index.ts`): `ExecutionContextInterface`, `InterceptorMiddleware`, `CreateInterceptorOptionsInterface` (types) and `createInterceptor` (value). Nothing else — there is no `strategy/` directory and no `runInterception` engine step; the whole contract collapsed to one middleware hook.

### Key Patterns

- **The entire interceptor contract is one middleware function**: `(context, next) => TResult`. There are no built-in `onEnter`/`onSuccess`/`onError` hooks and no `syncStrategy`/`promiseStrategy`/`observableStrategy`/`completionObservableStrategy` — those existed in an earlier version of this package and are gone. A middleware that needs to branch on whether `next()` returned a sync value, a `Promise`, or an `Observable` does so itself, typically with `isPromise` from `@rnw-community/shared` and rxjs's `isObservable` (this is exactly what `log-decorator` and `histogram-metric-decorator` do internally).
- `createInterceptor` wraps `descriptor.value`; if the original property isn't a function, the descriptor is returned unchanged (getters/setters/non-method values pass through untouched).
- Per-invocation `className` resolution (`buildContext`) is dynamic, not fixed at decoration time: given the `this` value at call time (`self`), it returns `null` for `null`/`undefined`/`globalThis`, the function's own `.name` when `self` is itself a function (static-method call context), otherwise `self.constructor.name`; an empty resolved name is treated the same as no name. Only when none of those apply does it fall back to `fallbackClassName`.
- `fallbackClassName` is resolved once at decoration time by `resolveFallbackClassName(target)`: the decorated class's own `.name` if `target` is a function with a non-empty name, else `target.constructor.name`, else the literal string `'Object'`.
- `logContext` is always `` `${className}::${methodName}` ``, recomputed on every call (never memoized), so the same decorated method reports a different `className` when invoked with a different `this` (e.g. via `.call`/`.apply` or a subclass instance).
- `createInterceptor` never wraps, swallows, or inspects errors — whatever the middleware throws, rejects, or emits propagates unchanged. Resource setup/teardown (e.g. acquire-then-release) is entirely the middleware's responsibility, expressed as a try/finally around `next()` for Promises or an unsubscribe/teardown callback for Observables; this is the composition idiom `lock-decorator`'s `createLockMiddleware`/`createLockMiddleware$` build on directly.
- A middleware may short-circuit without ever calling `next()` (e.g. a guard that rejects before the method runs).

### Dependencies

- `@rnw-community/shared` — `isDefined`, `isNotEmptyString` (runtime), `AnyFn`, `MethodDecoratorType` (types)
- **Optional peer**: `rxjs` — not imported anywhere in `src/`; declared as an optional peer/dev dependency purely because `create-interceptor.spec.ts` exercises Observable-shaped `next()` return values to prove the engine is shape-agnostic
- **Optional peer**: `typescript` (`>=5.2.0`)

### Coverage

Default monorepo threshold: **99.9%** on all metrics (statements, branches, functions, lines).
