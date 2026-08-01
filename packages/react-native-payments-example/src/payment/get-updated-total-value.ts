import { shippingSurchargeValue } from '../constant/shipping-surcharge-value';

const monetaryFractionDigits = 2;

export const getUpdatedTotalValue = (totalValue: string): string => {
    const parsedTotalValue = Number.parseFloat(totalValue);

    if (Number.isNaN(parsedTotalValue)) {
        return totalValue;
    }

    return (parsedTotalValue + Number.parseFloat(shippingSurchargeValue)).toFixed(monetaryFractionDigits);
};
