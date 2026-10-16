import type { PaymentAddressFieldEnum } from '../enum/payment-address-field.enum';
import type { PaymentContactFieldEnum } from '../enum/payment-contact-field.enum';
import type { PaymentUpdateErrorTypeEnum } from '../enum/payment-update-error-type.enum';

/**
 * The `error` of a `PaymentDetailsUpdate`, either a sheet-wide message or a field-level error discriminated by `PaymentUpdateErrorTypeEnum`.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/payment-details-update.md
 */
export type PaymentDetailsUpdateError =
    | string
    | { expired?: boolean; message: string; type: PaymentUpdateErrorTypeEnum.CouponCode }
    | { field: PaymentContactFieldEnum; message: string; type: PaymentUpdateErrorTypeEnum.ContactField }
    | { key: PaymentAddressFieldEnum; message: string; type: PaymentUpdateErrorTypeEnum.ShippingAddressField };
