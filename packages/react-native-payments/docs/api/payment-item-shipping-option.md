# `PaymentItem` / `PaymentShippingOption`

## What & why

The line-item shapes used throughout `PaymentDetailsInit` and change-event updates: `PaymentItem` for `total`
and `displayItems`, `PaymentShippingOption` for `shippingOptions`. Reach for these when building or updating any
priced row of the sheet.

## How

| Type | Member | Notes |
| --- | --- | --- |
| `PaymentItem` | `label`, `amount`, `pending?` | `pending: true` renders `PKPaymentSummaryItemTypePending` on iOS instead of the amount; Google Pay ignores the flag. |
| `PaymentShippingOption` | `id`, `label`, `amount`, `detail?`, `selected?` | `id`/`label`/`amount` are required — iOS renders the row from the label and amount and reports the selection back by id. `selected` is **ignored on iOS** (see Pitfalls). |

## Example

```ts
const paymentDetails = {
    total: { label: 'Total', amount: { currency: 'USD', value: '10.00' } },
    displayItems: [{ label: 'Shipping', amount: { currency: 'USD', value: '0.00' }, pending: true }],
};

const shippingOptions = [
    { id: 'express', label: 'Express', detail: 'Next business day', amount: { currency: 'USD', value: '5.00' } },
    { id: 'ground', label: 'Ground', detail: '3-5 business days', amount: { currency: 'USD', value: '0.00' } },
];
```

## Pitfalls

- `PaymentShippingOption.selected` is part of the W3C dictionary but is **silently ignored on iOS**: PassKit has
  no preselection support and always shows its shipping-method picker with the first option of the array
  highlighted. Put the option you want preselected first in `shippingOptions` instead.
- `amount.currency` on a shipping option is ignored because the sheet is already bound to the `currencyCode` of
  the method data.

## References

- [W3C `PaymentItem`](https://www.w3.org/TR/payment-request/#dom-paymentitem)
- [guides/change-events.md](../guides/change-events.md)
