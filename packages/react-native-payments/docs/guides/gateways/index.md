# Gateway recipes

Copy-paste integrations for the payment service providers (PSPs) that charge the Apple Pay and Google Pay tokens this
package returns. Each recipe goes from the sheet to a charged token: the method data the PSP expects, the token to
read off the `PaymentResponse`, the server call that charges it, and a sandbox checklist.

| PSP | Google Pay tokenization | Apple Pay token handoff | Recipe |
| --- | --- | --- | --- |
| Stripe | `PAYMENT_GATEWAY`, `gateway: 'stripe'` | Stripe-issued certificate, `paymentData` exchanged for a Stripe token | [stripe.md](./stripe.md) |
| Adyen | `PAYMENT_GATEWAY`, `gateway: 'adyen'` | Your own certificate, base64 `paymentData` in `/payments` | [adyen.md](./adyen.md) |
| Braintree | `PAYMENT_GATEWAY`, `gateway: 'braintree'` | Braintree-issued certificate, `paymentData` exchanged for a nonce | [braintree.md](./braintree.md) |
| Checkout.com | `PAYMENT_GATEWAY`, `gateway: 'checkoutltd'` | Checkout.com-issued certificate, `paymentData` exchanged for a token | [checkout-com.md](./checkout-com.md) |
| None (self-decrypt) | `DIRECT`, your own public key | Your own certificate, decrypted on your server | [direct.md](./direct.md) |

## How to read a recipe

Every PSP-specific value in a recipe sits in a table with the public doc page it was checked against and the date
of that check. PSPs rename parameters and bump API versions, so re-check the linked page when a recipe's
verification date is old. Where a PSP documents a step only through its own native SDK, the recipe says so and
names the SDK source file the shape was taken from.

## The flow every recipe shares

1. Build `methodData` with [`createApplePayMethodData`](../../api/create-apple-pay-method-data.md) and
   [`createGooglePayMethodData`](../../api/create-google-pay-method-data.md), passing the PSP values from the
   recipe. `createGooglePayMethodData` defaults to `EnvironmentEnum.TEST`, which is what every sandbox checklist
   below expects.
2. `show()` the sheet and read the token off the response:
    - **iOS** — `response.details.applePayToken` ([`IosPKToken`](../../api/ios-pk-token.md)): `paymentData` is the
      still-encrypted Apple Pay payment token, already parsed into `{ data, header, signature, version }`;
      `paymentMethod` and `transactionIdentifier` describe the card and the transaction.
    - **Android** — `response.details.androidPayToken.rawToken`
      ([`AndroidPaymentMethodToken`](../../api/android-payment-method-token.md)): the untouched
      `tokenizationData.token` string Google Pay returned. Forward this string — whether it is Google's encrypted
      envelope or a token the gateway issued depends on the gateway.
3. Send the token to your backend over your own API. Never call a PSP endpoint that needs a secret key from the app.
4. Your backend charges the token through the PSP, and the app calls `complete()` with the outcome.

```ts
import {
    AndroidPaymentResponse,
    IosPaymentResponse,
    PaymentComplete,
    PaymentRequest,
} from '@rnw-community/react-native-payments';

const response = await new PaymentRequest(methodData, details).show();

if (response instanceof IosPaymentResponse) {
    const { paymentData, paymentMethod, transactionIdentifier } = response.details.applePayToken;

    await yourBackend.charge({
        wallet: 'apple-pay',
        paymentData: JSON.stringify(paymentData),
        paymentMethod,
        transactionIdentifier,
    });
} else if (response instanceof AndroidPaymentResponse) {
    await yourBackend.charge({ wallet: 'google-pay', token: response.details.androidPayToken.rawToken });
}

await response.complete(PaymentComplete.SUCCESS);
```

`yourBackend.charge` stands for your own API call; each recipe lists what its payload carries and what the backend
does with it. Call `complete(PaymentComplete.FAIL)` instead when the backend reports a declined or failed charge —
see [guides/errors.md](../errors.md).

## Pitfalls

- `JSON.stringify(paymentData)` re-serializes the parsed Apple Pay payload; the PSP parses it as JSON, it never
  needs the original bytes. Each recipe says whether the PSP wants that JSON as-is or base64-encoded.
- On the iOS simulator PassKit returns an empty `paymentData`, so every field of `applePayToken.paymentData` is an
  empty string. Exercise a recipe's iOS path on a device.
- The Google Pay `example` gateway in the quickstarts is accepted only in `TEST` and returns a token no PSP can
  charge (`rawToken` is `examplePaymentMethodToken`). Swap in the recipe's gateway before testing against the PSP.

## References

- [Google Pay API — gateway tokenization and participating processors](https://developers.google.com/pay/api/android/guides/tutorial#tokenization)
- [Google Pay API — `PaymentMethodTokenizationData`](https://developers.google.com/pay/api/android/reference/response-objects#PaymentMethodTokenizationData)
- [Apple Pay — payment token format reference](https://developer.apple.com/documentation/passkit/apple_pay/payment_token_format_reference)
- [platforms/android.md](../../platforms/android.md), [platforms/ios.md](../../platforms/ios.md)
