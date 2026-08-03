# Event support types

The small supporting types for the change-event system: the event-name union, the listener signatures, and the
raw native payload. Reach for these when typing a standalone listener function or when inspecting the payload
before it reaches a listener.

## How

| Type | Shape | Notes |
| --- | --- | --- |
| `PaymentRequestEventType` | `'shippingaddresschange' \| 'shippingoptionchange' \| 'paymentmethodchange' \| 'couponcodechange'` | Accepted by `addEventListener`/`removeEventListener`. |
| `PaymentRequestEventListener` | `(event: PaymentRequestUpdateEvent) => void` | For `shippingaddresschange`, `shippingoptionchange` and `couponcodechange`. |
| `PaymentMethodChangeEventListener` | `(event: PaymentMethodChangeEvent) => void` | For `paymentmethodchange`. |
| `PaymentRequestEventPayloadInterface` | `{ requestId: string; eventId: number; … }` | The raw native payload carried by a change event, before it is applied to the request and dispatched to listeners. `requestId`/`eventId` identify the request and the native completion handler; the rest is event-type specific. |

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

None beyond the listener/dispatch rules documented in [guides/change-events.md](../guides/change-events.md).

## References

- [guides/change-events.md](../guides/change-events.md)
- [api/payment-request-update-event.md](./payment-request-update-event.md)
