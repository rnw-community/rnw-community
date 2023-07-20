import type { GenericPaymentMethodDataDataInterface } from '../../../interface/generic-payment-method-data-data.interface';

export interface IosPaymentMethodDataDataInterface extends GenericPaymentMethodDataDataInterface {
    merchantIdentifier: string;
}
