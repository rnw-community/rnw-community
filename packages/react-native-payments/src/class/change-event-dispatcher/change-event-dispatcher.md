# ChangeEventDispatcher

Owns the lifecycle of a single change event: it builds the event, runs the listeners of the type in order, stops at the
first one that answers, and resolves the details the payment sheet has to be answered with. It is internal to
`PaymentRequest` and is not exported from the package.

```ts
const dispatcher = new ChangeEventDispatcher('shippingoptionchange', payload, () => request.state === 'interactive');
const detailsUpdate = await dispatcher.dispatch(listeners);
```

`dispatch` resolves to `null` when no listener answered, when the answer stayed pending for `changeEventTimeoutMs`, or
when `abandon()` was called because the request finished. It rejects when the answered promise rejects, which the request
turns into an unchanged-details response.
