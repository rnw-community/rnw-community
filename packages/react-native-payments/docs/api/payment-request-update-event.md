# `PaymentRequestUpdateEvent` / `PaymentMethodChangeEvent`

The event object handed to a change-event listener; `PaymentMethodChangeEvent` is the subtype delivered for
`paymentmethodchange`, extending the base with the selected method. Reach for these when you register
`addEventListener` and need to answer with updated details. The full narrative (dispatch order, timeout,
`isAnswered`, sheet errors) lives in [guides/change-events.md](../guides/change-events.md); this page is the
per-class signature reference.

## How

| Member | Signature | Notes |
| --- | --- | --- |
| `updateWith(detailsOrPromise)` | `(details: PaymentDetailsUpdate \| Promise<PaymentDetailsUpdate>) => void` | Answers the event. Throws `InvalidStateError` if called twice. |
| `isAnswered` | `boolean` | `true` once `updateWith` was called for the event. |
| `PaymentMethodChangeEvent.methodDetails` | `Record<string, unknown> \| undefined` | The selected payment method's details, only on `paymentmethodchange`. |

## Example

```ts
paymentRequest.addEventListener('paymentmethodchange', event => {
    if (event.methodDetails?.['network'] === 'Amex') {
        event.updateWith({ error: 'Amex is not supported for this order' });
    }
});
```

## Pitfalls

- Calling `updateWith` twice, or once the event was already answered or the request is no longer showing, throws
  `DOMException InvalidStateError`.
- A listener that throws, rejects, sends invalid details, never calls `updateWith`, or leaves its promise
  pending for more than 30 seconds is logged and answered with the unchanged details — see
  [guides/change-events.md](../guides/change-events.md).

## References

- [W3C `PaymentRequestUpdateEvent`](https://www.w3.org/TR/payment-request/#dom-paymentrequestupdateevent)
- [W3C `PaymentMethodChangeEvent`](https://www.w3.org/TR/payment-request/#dom-paymentmethodchangeevent)
- [guides/change-events.md](../guides/change-events.md)
