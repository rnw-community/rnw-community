import type { AndroidSelectionOption } from './android-selection-option.interface';

/**
 * The Google Pay `ShippingOptionParameters` request shape.
 *
 * @see https://developers.google.com/pay/api/android/reference/request-objects#ShippingOptionParameters
 */
export interface AndroidShippingOptionParameters {
    defaultSelectedOptionId?: string;
    shippingOptions: AndroidSelectionOption[];
}
