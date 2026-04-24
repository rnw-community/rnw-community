# `wait`

Promise-based sleep. Resolves after `ms` milliseconds via a single `setTimeout`.

Prefer over re-implementing `new Promise(r => setTimeout(r, ms))` inline — the shared helper keeps call sites terse and readable, and gives the delay a single owner if you ever need to mock it in tests.

## Example

```ts
// Simulate latency in a test
await wait(10);
expect(spy).toHaveBeenCalled();

// Yield to the microtask queue / let pending async work settle
await wait(0);
```
