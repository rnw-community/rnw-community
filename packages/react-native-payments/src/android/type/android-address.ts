import type { AndroidFullAddress } from '../interface/response/android-full-address';
import type { AndroidMinAddress } from '../interface/response/android-min-address';

// https://developers.google.com/pay/api/android/reference/response-objects#Address
export type AndroidAddress = AndroidFullAddress | AndroidMinAddress;
