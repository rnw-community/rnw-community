import type { PaymentAddressFieldEnum } from '../enum/payment-address-field.enum.js';
import type { PaymentContactFieldEnum } from '../enum/payment-contact-field.enum.js';
import type { PaymentUpdateErrorTypeEnum } from '../enum/payment-update-error-type.enum.js';

export type PaymentDetailsUpdateError =
    | string
    | { expired?: boolean; message: string; type: PaymentUpdateErrorTypeEnum.CouponCode }
    | { field: PaymentContactFieldEnum; message: string; type: PaymentUpdateErrorTypeEnum.ContactField }
    | { key: PaymentAddressFieldEnum; message: string; type: PaymentUpdateErrorTypeEnum.ShippingAddressField };
