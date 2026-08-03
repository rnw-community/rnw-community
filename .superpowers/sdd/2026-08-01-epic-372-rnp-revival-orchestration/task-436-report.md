# Task 436 — PaymentResponse retry() and toJSON()

## Status

Done. PR #462 open against master, all required CI checks green, all bot review findings triaged and resolved
on-thread (2 fixed, 2 refuted and withdrawn by the bot).

## Commits

- `a951e75e` feat(react-native-payments): add PaymentResponse retry() and toJSON()
- `6b8ef39c` docs(react-native-payments): document PaymentResponse retry() and toJSON()
- `b21dfa47` fix(react-native-payments): reject complete() after PaymentResponse.retry()
- `d8a4ec27` test(react-native-payments): use hasAssertions and drop non-pragma comments

## PR

https://github.com/rnw-community/rnw-community/pull/462 (`feat/rnp-436-response-retry-tojson` -> `master`, Closes #436)

## Design decision (retry())

`PaymentRequest` is already single-use in this package: `show()`'s promise settles exactly once and the native
`paymentResolve`/`paymentReject` slots are consumed on first use, so there is no channel to deliver a second
authorization back to JavaScript. Full spec-compliant `retry()` (re-present the sheet an arbitrary number of times,
hand back the same updated `PaymentResponse`) would require a new native authorization channel — out of scope here.
Implemented subset: `retry(errorFields)` enforces the spec's single-pending-retry + `InvalidStateError` rules in JS
(permanently, not just concurrently — a second retry can never succeed given the native completion is single-fire,
so a client-side reject is more honest than a native round-trip that would fail anyway), and `complete()` also
rejects once `retry()` has been called since native `complete()` unconditionally dismisses the sheet. On iOS,
`retry()` feeds `payer`/`shippingAddress` field errors into the *currently pending* native authorization completion
via the existing `PKPaymentErrorDomain` mapping from #381, failing that one pending completion without dismissing
the sheet so PassKit visually highlights the offending rows. If the user then corrects and resubmits, native detects
there is no live JS promise left and fails-and-dismisses the sheet automatically instead of crashing on a nil block
call — documented as a known limitation, not full spec compliance. On Android, `retry()` is a no-op that resolves
cleanly, consistent with the existing `complete()`/`abort()` no-op boundary on that platform.

## Bot dispositions

- **Macroscope** (1 finding, High): `complete()` didn't reject after `retry()`, so `complete()` would dismiss the
  still-open correction sheet. Valid — fixed in `b21dfa47`, replied on-thread naming the commit.
- **CodeRabbit** (4 findings):
  1. `expect.assertions(n)` instead of `expect.hasAssertions()` in several new tests (Trivial). Valid — fixed in
     `d8a4ec27`; bot confirmed "addresses the finding."
  2. New non-pragma comments in `payment-response.ts`/`payment-response-json.interface.ts` (Major/Quick win). Valid
     for the two lines this PR actually introduced — fixed in `d8a4ec27` (left pre-existing comments outside this
     diff untouched); bot acknowledged.
  3. "Track an active retry instead of lifetime retry use" (Major/Heavy lift) — refuted: `retryCalled` is set
     synchronously before the native `await`, so `complete()` already rejects for the whole retry duration (the
     bot's premise was stale against the Macroscope fix); a "pending-only" flag would not enable a real second
     retry anyway since iOS's native completion block is single-fire — it would just trade a cheap synchronous
     `InvalidStateError` for a native-round-trip `PaymentsError` with the same outcome. Bot withdrew the finding
     and recorded a learning matching this reasoning.
  4. "Refresh the response after a successful retry" (toJSON/details go stale) (Major/Heavy lift) — refuted: this
     requires observing a second `didAuthorizePayment` in JS, which the architecture explicitly cannot do (documented
     as the "new native show-path" out of scope in the PR's Design decision). Bot withdrew the finding.
  All four threads are resolved/withdrawn; no unresolved bot findings remain.
- **claude-review**: passed with no comments.
- CI: `Build, lint and test`, `Required checks`, `CodeQL`, `DeepScan`, `Analyze (actions/javascript/ruby)`, and all
  `codecov/project/*` checks are green. `Maestro (bare)`/`Maestro (expo)` (iOS/Android) remain `queued` — confirmed
  via `gh run list` that the underlying workflow runs are stuck in `queued` state, not failing; their own workflow
  header comments state the self-hosted fleet is not registered yet (blocked on #396), and they are not part of
  `Required checks` (which already passed), so they do not gate this PR.

## Concerns

- Native iOS (Objective-C) and Android (Java) changes could not be compiled/tested in this sandbox (no Xcode/Android
  SDK); they were reviewed carefully by hand against the existing file's conventions and the codegen contract
  (`Object`/`ReadableMap`/`NSDictionary` bridging matches the existing `updatePaymentDetails` method), and the
  Maestro CI (which would exercise them) cannot run yet (unregistered fleet, tracked separately under #393/#395/#396).
- On-device verification of the in-sheet retry UX is explicitly out of scope for this issue.

## Report path

/Users/vitalyiegorov/rnw-community/.superpowers/sdd/2026-08-01-epic-372-rnp-revival-orchestration/task-436-report.md
