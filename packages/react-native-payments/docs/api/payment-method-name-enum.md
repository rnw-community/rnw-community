# `PaymentMethodNameEnum`

## What & why

Discriminates which platform a `methodData` entry targets. Reach for it whenever you build the `methodData` array
passed to `new PaymentRequest(...)`.

## How

| Member | Runtime value | Pairs with |
| --- | --- | --- |
| `ApplePay` | `'apple-pay'` | [`IosPaymentMethodDataInterface`](./ios-payment-method-data.md) |
| `AndroidPay` | `'android-pay'` | [`AndroidPaymentMethodDataInterface`](./android-payment-method-data.md) |

## Example

```ts
import { PaymentMethodNameEnum, SupportedNetworkEnum } from '@rnw-community/react-native-payments';

const methodData = [
    {
        supportedMethods: PaymentMethodNameEnum.ApplePay,
        data: {
            merchantIdentifier: 'merchant.com.your-app.namespace',
            supportedNetworks: [SupportedNetworkEnum.Visa],
            countryCode: 'US',
            currencyCode: 'USD',
        },
    },
];
```

## Pitfalls

A `PaymentRequest` constructed with no platform-matching payment method throws `DOMException NotSupportedError`
at construction time — see [architecture.md](../architecture.md).

## References

- [api/payment-request.md](./payment-request.md)
