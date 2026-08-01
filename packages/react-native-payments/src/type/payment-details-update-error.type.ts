import type { PaymentAddressFieldEnum } from '../enum/payment-address-field.enum';
import type { PaymentContactFieldEnum } from '../enum/payment-contact-field.enum';
import type { PaymentUpdateErrorTypeEnum } from '../enum/payment-update-error-type.enum';

export type PaymentDetailsUpdateError =
    | string
    | { expired?: boolean; message: string; type: PaymentUpdateErrorTypeEnum.CouponCode }
    | { field: PaymentContactFieldEnum; message: string; type: PaymentUpdateErrorTypeEnum.ContactField }
    | { key: PaymentAddressFieldEnum; message: string; type: PaymentUpdateErrorTypeEnum.ShippingAddressField };
