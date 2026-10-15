# `SupportedNetworkEnum`

## What & why

The card networks a `methodData` entry accepts. Reach for it when populating `methodData.data.supportedNetworks`
on either platform.

## How

Accepts the standard networks (`Visa`, `Mastercard`, `Amex`, …) plus several Apple Pay introduced after the
oldest supported iOS version, rejected below their minimum:

| Member | Minimum iOS version |
| --- | --- |
| `Girocard` | iOS 14 |
| `Mir` | iOS 14.5 — **deprecated**, see Pitfalls |
| `Dankort` | iOS 15.1 |
| `Bancontact` | iOS 16 |

On Android only the networks Google Pay accepts are sent: `Amex`, `Discover`, `Interac`, `Jcb`, `Mastercard` and
`Visa`, plus `Electron`, `Maestro` and `Elo` for Brazilian combo cards. Other members are left out of the Google Pay
request, so one cross-platform `supportedNetworks` list works on both platforms. If a Google Pay `methodData` entry
contains none of those networks, the constructor throws `ConstructorError`.

## Example

```ts
import { SupportedNetworkEnum } from '@rnw-community/react-native-payments';

const supportedNetworks = [SupportedNetworkEnum.Visa, SupportedNetworkEnum.Mastercard];
```

## Pitfalls

`SupportedNetworkEnum.Mir` is **deprecated**. Apple delisted the network over the sanctions against the issuing
banks, so it resolves on iOS 14.5+ and keeps an existing integration building, but no Mir card can be
provisioned into Apple Pay anymore. It is kept functional instead of being removed so upgrading does not break a
build; do not add it to a new integration.

## References

- [platforms/ios.md](../platforms/ios.md)
