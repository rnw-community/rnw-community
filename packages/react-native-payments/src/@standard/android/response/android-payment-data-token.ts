export interface AndroidPaymentDataToken {
    encryptedMessage: string;
    ephemeralPublicKey: string;
    protocolVersion: string;
    signedMessage: string;
    tag: string;
}
