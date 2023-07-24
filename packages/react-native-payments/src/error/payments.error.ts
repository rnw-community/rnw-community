export class PaymentsError extends Error {
    constructor(message: string) {
        super(`[ReactNativePayments] ${message}`);
    }
}
