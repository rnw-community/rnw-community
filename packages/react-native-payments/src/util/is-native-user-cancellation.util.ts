import { isError } from '@rnw-community/shared';

const nativeCancellationCodes: ReadonlySet<string> = new Set(['E_CANCELLED_BY_USER', 'payment_error']);

export const isNativeUserCancellation = (error: unknown): boolean =>
    isError(error) && nativeCancellationCodes.has((error as { code?: string }).code ?? '');
