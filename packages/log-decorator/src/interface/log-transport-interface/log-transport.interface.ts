export interface LogTransportInterface {
    readonly log: (message: string, logContext: string) => void;
    readonly debug: (message: string, logContext: string) => void;
    readonly error: (message: string, error: unknown, logContext: string) => void;
}
