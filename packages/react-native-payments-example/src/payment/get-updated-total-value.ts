const monetaryFractionDigits = 2;

export const getUpdatedTotalValue = (totalValue: string, shippingValue: string): string => {
    const parsedTotalValue = Number.parseFloat(totalValue);
    const parsedShippingValue = Number.parseFloat(shippingValue);

    if (Number.isNaN(parsedTotalValue) || Number.isNaN(parsedShippingValue)) {
        return totalValue;
    }

    return (parsedTotalValue + parsedShippingValue).toFixed(monetaryFractionDigits);
};
