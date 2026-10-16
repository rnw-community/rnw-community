# `PaymentAddressFieldEnum` / `PaymentContactFieldEnum`

## What & why

The field-key enums used by field-level sheet errors and `PaymentResponse.retry()`'s `errorFields`. Reach for
these when you need to point a validation error at a specific row of the sheet instead of showing a generic
banner.

## How

| Type | Maps onto | Members |
| --- | --- | --- |
| `PaymentAddressFieldEnum` | PassKit `CNPostalAddress` keys | `AddressLine` (street), `City`, `Country` (ISO code), `DependentLocality` (sub locality), `PostalCode`, `Region` (state), `SubAdministrativeArea` |
| `PaymentContactFieldEnum` | PassKit `PKContactField` | `Email`, `Name`, `Phone`, `PostalAddress` |

## Example

```ts
import { PaymentAddressFieldEnum, PaymentContactFieldEnum } from '@rnw-community/react-native-payments';

await paymentResponse.retry({
    payer: { [PaymentContactFieldEnum.Email]: 'Please provide a valid email' },
    shippingAddress: { [PaymentAddressFieldEnum.PostalCode]: 'We do not ship to this postal code' },
});
```

## Pitfalls

An unknown field, an empty message, or a coupon error below iOS 15 is dropped and the sheet is answered with the
updated details only. On Android the errors passed to `PaymentResponse.retry()` are ignored because Google Pay has
no in-sheet retry, while a field error answered to a shipping change event reaches Google Pay — a
`shippingAddressField` error as `SHIPPING_ADDRESS_INVALID`, any other as `OTHER_ERROR`.

## References

- [guides/change-events.md](../guides/change-events.md#sheet-errors)
- [guides/retry.md](../guides/retry.md)
