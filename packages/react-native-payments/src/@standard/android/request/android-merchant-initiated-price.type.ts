export type AndroidMerchantInitiatedPrice =
    | {
          price: string;
          priceStatus: 'ESTIMATED' | 'FINAL';
      }
    | {
          price?: never;
          priceStatus: 'NOT_CURRENTLY_KNOWN';
      };
