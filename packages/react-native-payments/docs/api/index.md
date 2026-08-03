# API reference

One entry per group of public exports from [`src/index.ts`](../../src/index.ts). Grouped files follow the same
pairing the package already uses for tightly-coupled siblings (a data shape and its platform-specific
`*DataInterface`, an event and its payload/listener types).

## Core classes

- [payment-request.md](./payment-request.md) — `PaymentRequest`
- [payment-response.md](./payment-response.md) — `PaymentResponse`
- [ios-payment-response.md](./ios-payment-response.md) — `IosPaymentResponse`, `IosPKToken`
- [android-payment-response.md](./android-payment-response.md) — `AndroidPaymentResponse`, `AndroidPaymentMethodToken`

## Change events

- [payment-request-update-event.md](./payment-request-update-event.md) — `PaymentRequestUpdateEvent`, `PaymentMethodChangeEvent`
- [events-types.md](./events-types.md) — `PaymentRequestEventType`, `PaymentRequestEventListener`, `PaymentMethodChangeEventListener`, `PaymentRequestEventPayloadInterface`

## Enums

- [payment-method-name-enum.md](./payment-method-name-enum.md) — `PaymentMethodNameEnum`
- [environment-enum.md](./environment-enum.md) — `EnvironmentEnum`
- [payment-complete-enum.md](./payment-complete-enum.md) — `PaymentComplete`
- [supported-network-enum.md](./supported-network-enum.md) — `SupportedNetworkEnum`
- [payments-error-enum.md](./payments-error-enum.md) — `PaymentsErrorEnum`
- [payment-address-contact-field-enums.md](./payment-address-contact-field-enums.md) — `PaymentAddressFieldEnum`, `PaymentContactFieldEnum`
- [payment-update-error-type-enum.md](./payment-update-error-type-enum.md) — `PaymentUpdateErrorTypeEnum`
- [payment-shipping-type-enum.md](./payment-shipping-type-enum.md) — `PaymentShippingTypeEnum`

## Errors

- [constructor-error.md](./constructor-error.md) — `ConstructorError`
- [dom-exception.md](./dom-exception.md) — `DOMException`
- [payments-error.md](./payments-error.md) — `PaymentsError`

## Payment details shapes

- [payment-details-init.md](./payment-details-init.md) — `PaymentDetailsInit`
- [payment-details-update.md](./payment-details-update.md) — `PaymentDetailsUpdate`, `PaymentDetailsUpdateError`
- [payment-details-modifier.md](./payment-details-modifier.md) — `PaymentDetailsModifier`
- [payment-item-shipping-option.md](./payment-item-shipping-option.md) — `PaymentItem`, `PaymentShippingOption`
- [payment-validation-errors.md](./payment-validation-errors.md) — `PaymentValidationErrors`
- [payment-response-json.md](./payment-response-json.md) — `PaymentResponseJsonInterface`
- [payment-response-address.md](./payment-response-address.md) — `PaymentResponseAddressInterface`
- [payment-method-data.md](./payment-method-data.md) — `PaymentMethodData`

## Platform method data

- [android-payment-method-data.md](./android-payment-method-data.md) — `AndroidPaymentMethodDataInterface`, `AndroidPaymentMethodDataDataInterface`, `AndroidAllowedAuthMethodsEnum`
- [ios-payment-method-data.md](./ios-payment-method-data.md) — `IosPaymentMethodDataInterface`, `IosPaymentMethodDataDataInterface`, `IosPKMerchantCapability`
