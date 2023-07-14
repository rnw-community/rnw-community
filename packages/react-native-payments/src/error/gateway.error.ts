export class GatewayError extends Error {
    constructor(message: string) {
        super(`[GatewayError]: ${message}`);
    }
}
