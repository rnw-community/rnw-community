# PaymentRequestUpdateEvent

Event passed to every change listener. `updateWith` accepts details or a promise of details and hands them to the request
that dispatched the event. It may be called only once — a second call, or a call made once the request stopped accepting
answers, throws a `DOMException` with `InvalidStateError`. `isAnswered` tells whether the event was already answered.

```ts
paymentRequest.addEventListener('shippingoptionchange', async event => {
    const quote = await fetchShippingQuote(paymentRequest.shippingOption);

    event.updateWith({
        total: { label: 'Total', amount: { currency: 'USD', value: quote.total } },
        displayItems: [{ label: 'Shipping', amount: { currency: 'USD', value: quote.shipping } }],
    });
});
```

Not calling `updateWith`, or leaving its promise pending past the change-event timeout, responds to the payment sheet with
the unchanged details.
