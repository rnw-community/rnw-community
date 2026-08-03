# Event support types

## What & why

The small supporting types for the change-event system: the event-name union, the listener signatures, and the
raw native payload. Reach for these when typing a standalone listener function or when inspecting the payload
before it reaches a listener.

## How

| Type | Shape | Notes |
| --- | --- | --- |
| `PaymentRequestEventType` | `'shippingaddresschange' \| 'shippingoptionchange' \| 'paymentmethodchange' \| 'couponcodechange'` | Accepted by `addEventListener`/`removeEventListener`. |
| `PaymentRequestEventListener` | `(event: PaymentRequestUpdateEvent) => Promise<void> \| void` | For `shippingaddresschange`, `shippingoptionchange` and `couponcodechange`. Both sync and async listeners are accepted — see [guides/change-events.md](../guides/change-events.md). |
| `PaymentMethodChangeEventListener` | `(event: PaymentMethodChangeEvent) => Promise<void> \| void` | For `paymentmethodchange`. |
| `PaymentRequestEventPayloadInterface` | `{ requestId: string; eventId?: number; … }` | The raw native payload carried by a change event, before it is applied to the request and dispatched to listeners. `requestId` always identifies the request; `eventId` identifies the native completion handler and is optional — the rest is event-type specific. |

## Example

```ts
const eventType: PaymentRequestEventType = 'shippingoptionchange';

paymentRequest.addEventListener(eventType, event => event.updateWith({}));

const onShippingOptionChange: PaymentRequestEventListener = event => {
    event.updateWith({});
};

const onPaymentMethodChange: PaymentMethodChangeEventListener = event => {
    event.updateWith({});
};

const payload: PaymentRequestEventPayloadInterface = {
    requestId: paymentRequest.id,
    eventId: 1,
    shippingOption: 'express',
};
```

## Pitfalls

- `eventId` on `PaymentRequestEventPayloadInterface` is optional — guard with `isDefined`/`?.` before forwarding
  it to a native completion call instead of assuming it is always a `number`.
- A listener may return either synchronously or a `Promise` — `updateWith` does not have to be called before the
  listener function returns. See [guides/change-events.md](../guides/change-events.md).

## References

- [guides/change-events.md](../guides/change-events.md)
- [api/payment-request-update-event.md](./payment-request-update-event.md)
