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
    /**
     * @deprecated Apple delisted Mir over the sanctions against the issuing banks. The network still resolves on
     * iOS 14.5+ so an existing integration keeps building, but no Mir card can be provisioned into Apple Pay.
     */
    Mir = 'mir',
    PrivateLabel = 'privateLabel',
    Visa = 'visa',
    Vpay = 'vPay',
}
