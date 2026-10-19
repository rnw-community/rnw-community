# `AndroidPaymentMethodDataInterface` / `AndroidPaymentMethodDataDataInterface`

## What & why

The typed shape of the Android entry of `methodData`. Reach for these when building the `AndroidPay` entry of
your `methodData` array.

## How

| Type                                    | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AndroidPaymentMethodDataInterface`     | `supportedMethods: PaymentMethodNameEnum.AndroidPay` paired with an `AndroidPaymentMethodDataDataInterface` `data`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `AndroidPaymentMethodDataDataInterface` | `supportedNetworks`, `environment`, `countryCode?`, `currencyCode`, exactly one of `gatewayConfig` (`{ gateway, gatewayMerchantId?, ...gateway-specific keys }`) or `directConfig` (`{ protocolVersion, publicKey }`) — the type forbids supplying both, `allowedAuthMethods?` ([`AndroidAllowedAuthMethodsEnum`](./android-allowed-auth-methods-enum.md)), `totalPriceStatus?`, `checkoutOption?`, `transactionId?`, at most one of `deferredTransactionInfo?` / `recurringTransactionInfo?` / `automaticReloadTransactionInfo?` ([merchant-initiated transactions](./android-merchant-initiated-transaction-info.md)) — see [platforms/android.md](../platforms/android.md) for every field. |

`requestBillingAddress`, `requestPayerEmail`, `requestPayerName`, `requestPayerPhone` and `requestShipping` are
shared with [`IosPaymentMethodDataDataInterface`](./ios-payment-method-data.md) (both extend the package's
common `GenericPaymentMethodDataDataInterface`): each is an optional boolean that, when `true`, adds the matching
field to the resulting `PaymentResponse` — see [api/payment-response.md](./payment-response.md).

[`createGooglePayMethodData`](./create-google-pay-method-data.md) builds this entry with defaults filled in.

## Example

```ts
const androidMethod: AndroidPaymentMethodDataInterface = {
    supportedMethods: PaymentMethodNameEnum.AndroidPay,
    data: {
        supportedNetworks: [SupportedNetworkEnum.Visa],
        environment: EnvironmentEnum.TEST,
        countryCode: 'DE',
        currencyCode: 'EUR',
        gatewayConfig: { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' },
    },
};
```

## Pitfalls

- `checkoutOption: 'COMPLETE_IMMEDIATE_PURCHASE'` is only allowed together with `totalPriceStatus: 'FINAL'` —
  the constructor throws on any other combination. See [platforms/android.md](../platforms/android.md).
- A merchant-initiated transaction object replaces `transactionInfo`, so it cannot be combined with
  `checkoutOption` or `totalPriceStatus`, and it requires `countryCode` — the constructor throws otherwise. See
  [api/android-merchant-initiated-transaction-info.md](./android-merchant-initiated-transaction-info.md).
- `countryCode` is optional on this interface (unlike the required `countryCode` on the iOS side) — omitting it
  is valid TypeScript, but Google Pay's own requirements for your merchant configuration may still need it set.
- `gatewayConfig` and `directConfig` are mutually exclusive at the type level (`{ directConfig; gatewayConfig?: never } | { directConfig?: never; gatewayConfig }`) — providing both, or neither, is a type error.
- `gatewayConfig` is passed verbatim as the Google Pay `tokenizationSpecification.parameters`, so gateway-specific
  keys (`stripe:publishableKey`, `braintree:clientKey`, …) go straight into it. `gatewayMerchantId` is optional
  because not every gateway takes it — Google's
  [processor table](https://developers.google.com/pay/api/android/guides/tutorial#tokenization) lists none for
  Stripe or Braintree. See [guides/gateways/](../guides/gateways/index.md) for each PSP's exact parameters.

## References

- [platforms/android.md](../platforms/android.md)
- [api/payment-method-name-enum.md](./payment-method-name-enum.md)
- [api/android-allowed-auth-methods-enum.md](./android-allowed-auth-methods-enum.md)
- [api/android-merchant-initiated-transaction-info.md](./android-merchant-initiated-transaction-info.md)
