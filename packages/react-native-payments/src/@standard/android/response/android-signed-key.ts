// https://developers.google.com/pay/api/android/guides/resources/payment-data-cryptography#signed-key
export interface AndroidSignedKey {
    keyExpiration: string;
    keyValue: string;
}

export const emptyAndroidSignedKey: AndroidSignedKey = {
    keyExpiration: '',
    keyValue: '',
};
