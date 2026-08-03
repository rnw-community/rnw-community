# `PaymentValidationErrors`

The type of `PaymentResponse.retry()`'s `errorFields` argument. Reach for it when telling `retry()` which fields
to highlight in the sheet.

## How

| Member | Notes |
| --- | --- |
| `error?` | Optional generic error message. |
| `payer?` | Keyed by `PaymentContactFieldEnum` — see [api/payment-address-contact-field-enums.md](./payment-address-contact-field-enums.md). |
| `shippingAddress?` | Keyed by `PaymentAddressFieldEnum`. |

Uses the same keys as the [Sheet errors](../guides/change-events.md#sheet-errors) field-level
`PaymentDetailsUpdateError`.

## Example

```ts
const errorFields: PaymentValidationErrors = {
    payer: { [PaymentContactFieldEnum.Email]: 'Please provide a valid email' },
};

await paymentResponse.retry(errorFields);
```

## Pitfalls

An omitted `payer`/`shippingAddress` still fails the attempt but nothing is highlighted in the sheet. See
[guides/retry.md](../guides/retry.md).

## References

- [guides/retry.md](../guides/retry.md)
