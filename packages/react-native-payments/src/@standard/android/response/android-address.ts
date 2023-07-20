import type { AndroidFullAddress } from './android-full-address';
import type { AndroidMinAddress } from './android-min-address';

// https://developers.google.com/pay/api/android/reference/response-objects#Address
export type AndroidAddress = AndroidFullAddress | AndroidMinAddress;
