# `PaymentShippingTypeEnum`

## What & why

Populates the optional `shippingType` of `methodData.data`, mapping to the W3C `PaymentOptions.shippingType`
concept. Reach for it when you need PassKit to label the shipping picker as delivery vs. pickup.

## How

| Member | iOS `PKShippingType` | Android |
| --- | --- | --- |
| `Shipping` | `PKShippingTypeShipping` | No-op |
| `Delivery` | `PKShippingTypeDelivery` | No-op |
| `Pickup` | `PKShippingTypeStorePickup` | No-op |

## Example

```ts
import { PaymentShippingTypeEnum } from '@rnw-community/react-native-payments';

const data = {
    merchantIdentifier: 'merchant.com.your-app.namespace',
    shippingType: PaymentShippingTypeEnum.Delivery,
};
```

## Pitfalls

- No-op on Android, which has no equivalent concept — validated but not forwarded to native.
- PassKit also has `PKShippingTypeServicePickup`, which has no W3C equivalent and is not exposed by this library.

## References

- [`PaymentOptions.shippingType`](https://www.w3.org/TR/payment-request/#dom-paymentoptions-shippingtype)
- [platforms/ios.md](../platforms/ios.md)
