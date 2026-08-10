import type { AndroidPaymentMethodDataInterface } from '../android/mapping/android-payment-method-data.interface';
import type { IosPaymentMethodDataInterface } from '../ios/mapping/ios-payment-method-data.interface';

/**
 * The W3C `PaymentMethodData` dictionary, resolved to its platform-specific shape.
 *
 * @see https://www.w3.org/TR/payment-request/#paymentmethoddata-dictionary
 */
export type PaymentMethodData = AndroidPaymentMethodDataInterface | IosPaymentMethodDataInterface;
