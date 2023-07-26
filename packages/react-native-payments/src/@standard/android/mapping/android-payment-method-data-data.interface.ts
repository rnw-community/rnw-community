import type { GenericPaymentMethodDataDataInterface } from '../../../interface/generic-payment-method-data-data.interface';
import type { AndroidTokenizationDirectSpecification } from '../request/android-tokenization-direct-specification';
import type { AndroidTokenizationGatewaySpecification } from '../request/android-tokenization-gateway-specification';

export type AndroidPaymentMethodDataDataInterface = GenericPaymentMethodDataDataInterface &
    (
        | {
              directConfig: AndroidTokenizationDirectSpecification['parameters'];
              gatewayConfig?: never;
          }
        | {
              directConfig?: never;
              gatewayConfig: AndroidTokenizationGatewaySpecification['parameters'];
          }
    );
