/**
 * The card networks a `methodData` entry accepts through `supportedNetworks` on either platform.
 *
 * @see https://github.com/rnw-community/rnw-community/blob/master/packages/react-native-payments/docs/api/supported-network-enum.md
 * @see https://developer.apple.com/documentation/passkit/pkpaymentnetwork?language=objc
 * @see https://developers.google.com/pay/api/android/reference/request-objects#CardParameters
 */
export enum SupportedNetworkEnum {
    Amex = 'amex',
    Bancontact = 'bancontact',
    CartesBancaires = 'cartesBancaires',
    ChinaUnionPay = 'chinaUnionPay',
    Dankort = 'dankort',
    Discover = 'discover',
    Eftpos = 'eftpos',
    Electron = 'electron',
    Elo = 'elo',
    Girocard = 'girocard',
    Interac = 'interac',
    Jcb = 'jcb',
    Mada = 'mada',
    Maestro = 'maestro',
    Mastercard = 'masterCard',
    Mir = 'mir',
    PrivateLabel = 'privateLabel',
    Visa = 'visa',
    Vpay = 'vPay',
}
