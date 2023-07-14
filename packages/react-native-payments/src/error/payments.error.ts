import { MODULE_NAME } from '../constants';

export class PaymentsError extends Error {
    constructor(message: string) {
        super(`[${MODULE_NAME}] ${message}`);
    }
}
