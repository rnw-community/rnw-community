import { PaymentsError } from './payments.error';

export class ConstructorError extends PaymentsError {
    constructor(message: string) {
        super(`Failed to construct 'PaymentRequest':  ${message}`);
    }
}
