export enum PaymentsErrorEnum {
    AbortError = 'The operation was aborted.',
    InvalidStateError = 'The object is in an invalid state.',
    NotAllowedError = 'The request is not allowed by the user agent or the platform in the current context, possibly because the user denied permission.',
    NotSupportedError = 'The operation is not supported.',
    SecurityError = 'The operation is insecure.',
}
