# `isDecimalMonetaryValue`

Check if variable is a decimal-formatted numeric string (`^-?[0-9]+(\.[0-9]+)?$`), e.g. currency
amounts.

## Example

```ts
const amount = '10.00';

isDecimalMonetaryValue(amount); // returns true and narrows type to string
isDecimalMonetaryValue('10.'); // returns false — trailing dot without digits
isDecimalMonetaryValue('+10'); // returns false — leading sign other than '-' is not allowed
```
