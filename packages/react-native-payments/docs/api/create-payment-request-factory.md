# `createPaymentRequestFactory` / `PaymentRequestFactoryConfig` / `PaymentRequestFactory`

## What & why

A `PaymentRequest` is single-use (see [architecture.md](../architecture.md)), so every checkout attempt — including a
retry after a failed or cancelled payment — needs a new instance. `createPaymentRequestFactory` captures the
configuration that stays the same across attempts once, and returns a function that builds a fresh request from the
details of each checkout.

## How

```ts
createPaymentRequestFactory(config: PaymentRequestFactoryConfig): PaymentRequestFactory

type PaymentRequestFactory = (details: PaymentDetailsInit) => PaymentRequest;
```

| `PaymentRequestFactoryConfig` member | Required | Notes                                                                                                     |
| ------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------- |
| `methodData`                         | yes      | Passed to every request. Each request gets its own copy of the array.                                     |
| `details`                            | no       | Base `PaymentDetailsInit` without `total` and `id` (for example shared `shippingOptions` or `modifiers`). |

Merge semantics: every call builds `new PaymentRequest([...methodData], { ...config.details, ...details })`.

- The merge is shallow. A key in the per-checkout `details` replaces the base value as a whole, so arrays are
  replaced, not concatenated.
- A key set to `undefined` in the per-checkout `details` clears the base value.
- `total` and `id` only come from the per-checkout `details`. When `id` is omitted, every request gets a new
  generated one.
- The constructor runs on every call, so invalid details throw `ConstructorError` from the factory call, exactly like
  `new PaymentRequest(...)`.

Event listeners belong to one request. Register them on each request the factory returns. The factory is a plain
function with no React dependency. In a component, create it once (module scope or `useMemo`) and call it inside the
pay handler.

## Example

```ts
import {
    PaymentComplete,
    createApplePayMethodData,
    createGooglePayMethodData,
    createPaymentRequestFactory,
} from '@rnw-community/react-native-payments';

const createPaymentRequest = createPaymentRequestFactory({
    methodData: [
        createApplePayMethodData({
            merchantIdentifier: 'merchant.com.your-app.namespace',
            countryCode: 'US',
            currencyCode: 'USD',
        }),
        createGooglePayMethodData({
            countryCode: 'US',
            currencyCode: 'USD',
            gatewayConfig: { gateway: 'example', gatewayMerchantId: 'id' },
        }),
    ],
});

const pay = async (value: string): Promise<void> => {
    const paymentResponse = await createPaymentRequest({
        total: { label: 'Total', amount: { currency: 'USD', value } },
    }).show();

    await paymentResponse.complete(
        (await sendToYourBackend(paymentResponse.details)) ? PaymentComplete.SUCCESS : PaymentComplete.FAIL
    );
};
```

## Pitfalls

- On react-native-web, `PaymentRequest` resolves to the browser's `window.PaymentRequest`, and the factory builds that
  one. It is `null` during SSR. See [platforms/web.md](../platforms/web.md).

## References

- [api/payment-request.md](./payment-request.md)
- [api/payment-details-init.md](./payment-details-init.md)
- [guides/retry.md](../guides/retry.md#starting-a-new-attempt)
- [W3C `PaymentRequest` constructor](https://www.w3.org/TR/payment-request/#constructor)
