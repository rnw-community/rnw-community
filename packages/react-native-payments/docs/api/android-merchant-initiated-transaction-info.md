# `AndroidDeferredTransactionInfo` / `AndroidRecurringTransactionInfo` / `AndroidAutomaticReloadTransactionInfo`

Also covers the nested `AndroidRecurrencePeriodItem`, `AndroidIntroductoryPeriodInfo` and `AndroidDisplayItem` shapes.

## What & why

Google Pay's merchant-initiated transaction (MIT) objects describe a payment the merchant charges later instead of a
regular checkout: a pre-order or a booking (`deferredTransactionInfo`), a subscription (`recurringTransactionInfo`), or
a stored-value automatic reload (`automaticReloadTransactionInfo`). Reach for them when the amount charged at
checkout differs from what the user is agreeing to be charged in the future — for example a `'0.00'` hotel
reservation that is charged on the arrival date.

## How

Set exactly one of the three objects on the Android entry of `methodData.data`. The package sends it to Google Pay in
place of the regular `transactionInfo` and fills the fields it already owns:

| `PaymentDataRequest` field | Filled from                                                                                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `currencyCode`             | `methodData.data.currencyCode`                                                                                               |
| `countryCode`              | `methodData.data.countryCode` — required by Google Pay for every MIT object                                                  |
| `transactionId`            | `methodData.data.transactionId`, when set                                                                                    |
| `immediateTotalPrice`      | `details.total.amount.value` after [modifiers](../guides/modifiers.md) are resolved — the amount due today, `'0.00'` allowed |

Everything else comes from the object you supply:

| Type                                    | Fields                                                                                                                                                                                   |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `AndroidDeferredTransactionInfo`        | `billingDateTime` (RFC 3339, in the future), `label`, `priceStatus` + `price`, `displayItems?`                                                                                           |
| `AndroidRecurringTransactionInfo`       | `recurrenceItems` (non-empty `AndroidRecurrencePeriodItem[]`), `introductoryPeriodInfo?` (`AndroidIntroductoryPeriodInfo`)                                                               |
| `AndroidAutomaticReloadTransactionInfo` | `label`, `minimumBalanceAmount`, `reloadAmount`                                                                                                                                          |
| `AndroidRecurrencePeriodItem`           | `label`, `priceStatus` + `price`, `recurrencePeriod` (`'DAY'`/`'WEEK'`/`'MONTH'`/`'YEAR'`), `recurrencePeriodCount`, `billingInitialDateTime?`, `billingFinalDateTime?`, `displayItems?` |
| `AndroidIntroductoryPeriodInfo`         | `introductoryPeriodEndDateTime`, `label`, `totalPrice`, `introductoryPeriodStartDateTime?`, `displayItems?`                                                                              |
| `AndroidDisplayItem`                    | `label`, `price`, `type` (`'DISCOUNT'`/`'LINE_ITEM'`/`'SHIPPING_OPTION'`/`'SUBTOTAL'`/`'TAX'`), `status?`                                                                                |

The three MIT objects also accept `tokenUpdateUrl?`, `managementUrl?`, `billingAgreement?` and
`immediateDisplayItems?` (`AndroidDisplayItem[]`). `priceStatus` is `'FINAL'` or `'ESTIMATED'` together with a
`price`, or `'NOT_CURRENTLY_KNOWN'` without one — the type rejects any other pairing.

| Platform | Behavior                                                          |
| -------- | ----------------------------------------------------------------- |
| Android  | Serialized into the `PaymentDataRequest` as documented by Google. |
| iOS      | Not applicable — the fields live on the Android method data only. |

## Example

```ts
import {
    EnvironmentEnum,
    PaymentMethodNameEnum,
    PaymentRequest,
    SupportedNetworkEnum,
} from '@rnw-community/react-native-payments';

const request = new PaymentRequest(
    [
        {
            supportedMethods: PaymentMethodNameEnum.AndroidPay,
            data: {
                supportedNetworks: [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard],
                environment: EnvironmentEnum.TEST,
                countryCode: 'US',
                currencyCode: 'USD',
                gatewayConfig: { gateway: 'example', gatewayMerchantId: 'exampleGatewayMerchantId' },
                deferredTransactionInfo: {
                    billingDateTime: '2026-12-01T08:00:00Z',
                    label: 'Hotel Room Reservation',
                    priceStatus: 'FINAL',
                    price: '200.00',
                },
            },
        },
    ],
    { total: { label: 'Due today', amount: { currency: 'USD', value: '0.00' } } }
);
```

## Pitfalls

- The constructor throws a `ConstructorError` when more than one MIT object is set, when `countryCode` is missing,
  or when an MIT object is combined with `checkoutOption` or `totalPriceStatus` — those two only exist on the regular
  `transactionInfo` that the MIT object replaces.
- Google Pay documents MIT objects for merchant-initiated transactions only and does not support dynamic price
  updates for them. Your gateway must also support MIT tokens — confirm with it before going live.
- `tokenUpdateUrl` and `managementUrl` must be HTTPS endpoints with no trailing slash, query parameters or fragment.

## References

- [Google Pay Android `PaymentDataRequest`](https://developers.google.com/pay/api/android/reference/request-objects#PaymentDataRequest)
- [Google Pay `DeferredTransactionInfo`](https://developers.google.com/pay/api/android/reference/request-objects#DeferredTransactionInfo),
  [`RecurringTransactionInfo`](https://developers.google.com/pay/api/android/reference/request-objects#RecurringTransactionInfo),
  [`AutomaticReloadTransactionInfo`](https://developers.google.com/pay/api/android/reference/request-objects#AutomaticReloadTransactionInfo)
- [Google Pay merchant-initiated transactions guide](https://developers.google.com/pay/api/web/guides/resources/merchant-initiated-transactions)
- [api/android-payment-method-data.md](./android-payment-method-data.md)
- [platforms/android.md](../platforms/android.md)
