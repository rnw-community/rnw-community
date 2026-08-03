# `PaymentDetailsUpdate` / `PaymentDetailsUpdateError`

The dictionary answered from `updateWith`, and the type of its optional `error` member. Reach for these when
typing a change-event listener's response.

## How

| Type | Shape | Notes |
| --- | --- | --- |
| `PaymentDetailsUpdate` | `{ total?, displayItems?, shippingOptions?, modifiers?: PaymentDetailsModifier[], error?: PaymentDetailsUpdateError }` | Every member is optional — only the provided members replace the current details. `modifiers` is inherited from `PaymentDetailsBase` and is re-resolved against the platform's active payment method on every `updateWith()` call — see [guides/modifiers.md](../guides/modifiers.md). |
| `PaymentDetailsUpdateError` | `string \| { type: PaymentUpdateErrorTypeEnum; … }` | A plain string, or a field-level error — see [api/payment-update-error-type-enum.md](./payment-update-error-type-enum.md). |

## Example

```ts
const fieldError: PaymentDetailsUpdateError = {
    type: PaymentUpdateErrorTypeEnum.CouponCode,
    message: 'SALE10 expired last week',
    expired: true,
};

event.updateWith({
    total: { label: 'Total', amount: { currency: 'USD', value: '25.00' } },
    error: fieldError,
});
```

## Pitfalls

Updated details go through the same validation as the ones passed to the constructor — a malformed amount is
reported to the console and never reaches the sheet. See [guides/change-events.md](../guides/change-events.md).

## References

- [W3C `PaymentDetailsUpdate`](https://www.w3.org/TR/payment-request/#dom-paymentdetailsupdate)
- [guides/change-events.md](../guides/change-events.md#sheet-errors)
- [guides/modifiers.md](../guides/modifiers.md)
