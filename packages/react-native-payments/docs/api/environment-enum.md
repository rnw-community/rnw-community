# `EnvironmentEnum`

## What & why

Selects the Google Pay environment for a payment, and the `googlePayEnvironment` Expo plugin option. Reach for
it when setting `methodData.data.environment` on the Android entry, or when configuring the Expo plugin.

## How

| Member | Runtime value | Meaning |
| --- | --- | --- |
| `TEST` | `'TEST'` | Google Pay's test environment — used internally by `canMakePayment()` regardless of the configured value. |
| `PRODUCTION` | `'PRODUCTION'` | Google Pay's production environment — the default for the Expo plugin's `googlePayEnvironment` option. |

## Example

```ts
import { EnvironmentEnum, PaymentMethodNameEnum } from '@rnw-community/react-native-payments';

const methodData = [
    {
        supportedMethods: PaymentMethodNameEnum.AndroidPay,
        data: { environment: EnvironmentEnum.TEST, supportedNetworks: [], countryCode: 'DE', currencyCode: 'EUR' },
    },
];
```

## Pitfalls

`canMakePayment()` on Android always checks against `EnvironmentEnum.TEST` regardless of the `environment` set on
`methodData.data` — set the real `environment` for `show()` regardless of what `canMakePayment()` reported. See
[platforms/android.md](../platforms/android.md).

## References

- [platforms/android.md](../platforms/android.md)
- [platforms/expo.md](../platforms/expo.md)
