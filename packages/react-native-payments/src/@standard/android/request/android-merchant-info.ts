// https://developers.google.com/pay/api/android/reference/request-objects#MerchantInfo
export interface AndroidMerchantInfo {
    /**
     * https://developers.google.com/pay/api/android/guides/tutorial#paymentdatarequest
     * Important: Merchants that process transactions in the European Economic Area (EEA) or any other countries that are
     * subject to Strong Customer Authentication (SCA) must include the countryCode, totalPrice, and merchantName parameters
     * to meet SCA requirements.
     */
    merchantName?: string;
}
