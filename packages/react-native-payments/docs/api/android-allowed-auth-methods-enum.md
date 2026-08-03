# `AndroidAllowedAuthMethodsEnum`

## What & why

Restricts `methodData.data.allowedAuthMethods` on the Android entry to the auth methods Google Pay should accept.
Reach for it only when you need to narrow acceptance below the default.

## How

| Member | Meaning |
| --- | --- |
| `PAN_ONLY` | Accept cards without requiring 3-D Secure cryptogram data. |
| `CRYPTOGRAM_3DS` | Accept cards tokenized with a 3-D Secure cryptogram. |

Both members are the default when `allowedAuthMethods` is omitted from
[`AndroidPaymentMethodDataDataInterface`](./android-payment-method-data.md).

## Example

```ts
import { AndroidAllowedAuthMethodsEnum } from '@rnw-community/react-native-payments';

const allowedAuthMethods = [AndroidAllowedAuthMethodsEnum.PAN_ONLY];
```

## Pitfalls

None — narrowing this list only restricts which cards Google Pay offers; it does not change any other validation.

## References

- [Google Pay API for Android — CardParameters](https://developers.google.com/pay/api/android/reference/request-objects#CardParameters)
- [api/android-payment-method-data.md](./android-payment-method-data.md)
