# `PaymentUpdateErrorTypeEnum`

## What & why

The discriminator for a field-level `PaymentDetailsUpdateError` answered from `updateWith`. Reach for it when
building a field-level sheet error instead of a plain string.

## How

| Member | Additional member | iOS `PKPaymentErrorDomain` error |
| --- | --- | --- |
| `ShippingAddressField` | `key: PaymentAddressFieldEnum` | `paymentShippingAddressInvalidErrorWithKey:` |
| `ContactField` | `field: PaymentContactFieldEnum` | `paymentContactInvalidErrorWithContactField:` |
| `CouponCode` | `expired?: boolean` | `paymentCouponCodeInvalidError` / `paymentCouponCodeExpiredError` (iOS 15+) |

## Example

```ts
import { PaymentAddressFieldEnum, PaymentUpdateErrorTypeEnum } from '@rnw-community/react-native-payments';

event.updateWith({
    error: {
        type: PaymentUpdateErrorTypeEnum.ShippingAddressField,
        key: PaymentAddressFieldEnum.PostalCode,
        message: 'We do not ship to this postal code',
    },
});
```

## Pitfalls

`shippingoptionchange` has no error slot in PassKit, so an error answered there is ignored.

## References

- [guides/change-events.md](../guides/change-events.md#sheet-errors)
- [api/payment-address-contact-field-enums.md](./payment-address-contact-field-enums.md)
