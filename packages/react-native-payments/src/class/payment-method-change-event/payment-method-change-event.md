# PaymentMethodChangeEvent

`PaymentRequestUpdateEvent` delivered for `paymentmethodchange`, carrying the newly selected method.

```ts
paymentRequest.addEventListener('paymentmethodchange', event => {
    if (event.methodDetails?.['network'] === 'Amex') {
        event.updateWith({ error: 'Amex is not supported for this order' });
    }
});
```

`methodName` is the payment method identifier (`''` when native sends none) and `methodDetails` is the method specific
payload, `null` when native sends none.
