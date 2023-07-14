import { PaymentsError } from './payments.error';

export class TypeError extends PaymentsError {
    constructor(message: string) {
        super(`TypeError: ${message}`);
    }
}
