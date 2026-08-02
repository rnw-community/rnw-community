import { PaymentsError } from '../error/payments.error';

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- callers rely on explicit T to type the parsed JSON shape
export const parseJsonOrThrow = <T>(json: string): T => {
    try {
        return JSON.parse(json) as T;
    } catch {
        throw new PaymentsError(`Failed parsing PaymentRequest details`);
    }
};
