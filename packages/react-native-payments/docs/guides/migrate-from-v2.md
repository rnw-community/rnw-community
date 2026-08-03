# Migrating from v2

> **The native module interface changed** (`show()` now carries the request id, and the change-event methods are
> part of the TurboModule spec). Rebuild the native app when upgrading — a JavaScript-only update (e.g.
> CodePush/OTA) shipped on top of a v2 binary will fail to open the payment sheet.

The `v2.x` line shipped no change-event API: the sheet only ever showed the `PaymentDetailsInit` given to the
constructor, and neither `addEventListener` nor `removeEventListener` existed. Adopting the event API in
[change-events.md](./change-events.md) is purely additive — `PaymentRequest`, `canMakePayment()`, `show()`,
`abort()` and `PaymentComplete` keep their v2 signatures, and a consumer who never calls `addEventListener` sees
the same sheet as before (aside from the iOS round trip described in [change-events.md](./change-events.md)).

> **Behavior change:** in `v2.x` a settled `PaymentRequest` could call `show()` again to reopen the sheet. From
> `v3` a `PaymentRequest` is single-use — once `show()` settles or `abort()` resolves the request is `closed`,
> `addEventListener` becomes a no-op and every further `show()` rejects with `InvalidStateError`. Construct a new
> `PaymentRequest` per payment attempt instead of reusing one across retries. See
> [architecture.md](./../architecture.md) for why.

## References

- [architecture.md](./../architecture.md)
- [api/payment-request.md](./../api/payment-request.md)
